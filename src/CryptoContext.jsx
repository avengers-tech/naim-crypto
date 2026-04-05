import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "./config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Crypto = createContext();

// Initial dummy balance for virtual trading
const INITIAL_DUMMY_BALANCE = 10000;

// Load from localStorage or use defaults
const loadFromLocalStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Save to localStorage
const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

const CryptoContext = ({ children }) => {
  const [currency, setCurrency] = useState("INR");
  const [symbol, setSymbol] = useState("₹");
  const [theme, setTheme] = useState("dark");
  
  // Auth and Sync State
  const [currentUser, setCurrentUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);

  // Virtual Trading State
  // This is a simulated trading system using dummy money
  const [dummyBalance, setDummyBalance] = useState(() =>
    loadFromLocalStorage("cryptoHub_dummyBalance", INITIAL_DUMMY_BALANCE)
  );

  const [holdings, setHoldings] = useState(() =>
    loadFromLocalStorage("cryptoHub_holdings", [])
  );

  const [transactions, setTransactions] = useState(() =>
    loadFromLocalStorage("cryptoHub_transactions", [])
  );

  const [lastUpdated, setLastUpdated] = useState(() =>
    loadFromLocalStorage("cryptoHub_lastUpdated", new Date().toISOString())
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveToLocalStorage("cryptoHub_dummyBalance", dummyBalance);
  }, [dummyBalance]);

  useEffect(() => {
    saveToLocalStorage("cryptoHub_holdings", holdings);
  }, [holdings]);

  useEffect(() => {
    saveToLocalStorage("cryptoHub_transactions", transactions);
  }, [transactions]);

  useEffect(() => {
    saveToLocalStorage("cryptoHub_lastUpdated", lastUpdated);
  }, [lastUpdated]);

  // Sync wallet data to Firestore
  const syncWalletToFirestore = async (userId) => {
    try {
      const walletRef = doc(db, "users", userId);
      await setDoc(walletRef, {
        dummyBalance,
        holdings,
        transactions,
        lastUpdated: lastUpdated,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error syncing to Firestore:", error);
    }
  };

  // Fetch wallet data from Firestore
  const fetchWalletFromFirestore = async (userId) => {
    setIsSyncing(true);
    try {
      const walletRef = doc(db, "users", userId);
      const walletSnap = await getDoc(walletRef);

      // Get local timestamp
      const localLastUpdated = loadFromLocalStorage("cryptoHub_lastUpdated", null);

      if (walletSnap.exists()) {
        const data = walletSnap.data();
        const firestoreLastUpdated = data.lastUpdated || data.updatedAt || "1970-01-01T00:00:00.000Z";

        // Compare timestamps: prioritize more recent data
        const localTime = localLastUpdated ? new Date(localLastUpdated).getTime() : 0;
        const firestoreTime = new Date(firestoreLastUpdated).getTime();

        // If local data is more recent, sync local to Firestore instead of overwriting
        if (localTime > firestoreTime) {
          console.log("Local data is more recent, syncing to Firestore instead of overwriting");
          await syncWalletToFirestore(userId);
        } else if (data.holdings && data.holdings.length > 0) {
          // Firestore has more recent data, load it
          setDummyBalance(data.dummyBalance || INITIAL_DUMMY_BALANCE);
          setHoldings(data.holdings);
          setTransactions(data.transactions || []);
          setLastUpdated(firestoreLastUpdated);

          // Also save to localStorage
          saveToLocalStorage("cryptoHub_dummyBalance", data.dummyBalance || INITIAL_DUMMY_BALANCE);
          saveToLocalStorage("cryptoHub_holdings", data.holdings);
          saveToLocalStorage("cryptoHub_transactions", data.transactions || []);
          saveToLocalStorage("cryptoHub_lastUpdated", firestoreLastUpdated);
        } else {
          // Firestore is empty, keep localStorage data and sync current data to Firestore
          await syncWalletToFirestore(userId);
        }
      } else {
        // Create new wallet for new user
        await syncWalletToFirestore(userId);
      }
    } catch (error) {
      console.error("Error fetching from Firestore:", error);
    } finally {
      setIsSyncing(false);
      setSyncComplete(true);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        // User is logged in, fetch their wallet data
        fetchWalletFromFirestore(user.uid);
      } else {
        // User is logged out, use local data
        setSyncComplete(true);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (currency === "INR") setSymbol("₹");
    else if (currency === "USD") setSymbol("$");
    else if (currency === "NGN") setSymbol("₦");
  }, [currency]);

  // Modified setDummyBalance to sync with Firestore
  const handleSetDummyBalance = (value) => {
    setDummyBalance(value);
    // Sync to Firestore if user is logged in
    if (currentUser) {
      syncWalletToFirestore(currentUser.uid);
    }
  };

  // Buy coin with dummy money - modified to sync with Firestore
  const buyCoin = (coin, quantity, currentPrice) => {
    const totalCost = quantity * currentPrice;

    if (totalCost > dummyBalance) {
      return { success: false, message: "Insufficient dummy balance!" };
    }

    // Check if we already have this coin
    const existingHoldingIndex = holdings.findIndex(h => h.coinId === coin.id);

    let newHoldings = [...holdings];

    if (existingHoldingIndex >= 0) {
      // Update existing holding - calculate new average price
      const existingHolding = newHoldings[existingHoldingIndex];
      const totalQuantity = existingHolding.quantity + quantity;
      const totalInvestment = (existingHolding.quantity * existingHolding.buyPrice) + (quantity * currentPrice);
      const newAveragePrice = totalInvestment / totalQuantity;

      newHoldings[existingHoldingIndex] = {
        ...existingHolding,
        quantity: totalQuantity,
        buyPrice: newAveragePrice,
        buyTime: existingHolding.buyTime // Keep original buy time
      };
    } else {
      // Add new holding
      newHoldings.push({
        coinId: coin.id,
        name: coin.name,
        symbol: coin.symbol,
        image: coin.image,
        quantity: quantity,
        buyPrice: currentPrice,
        buyTime: new Date().toISOString()
      });
    }

    // Deduct from dummy balance
    setDummyBalance(prev => prev - totalCost);

    // Add transaction record
    const newTransaction = {
      id: Date.now(),
      type: "BUY",
      coinId: coin.id,
      coinName: coin.name,
      quantity: quantity,
      price: currentPrice,
      total: totalCost,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setHoldings(newHoldings);

    // Update lastUpdated timestamp
    setLastUpdated(new Date().toISOString());

    // Sync to Firestore if user is logged in
    if (currentUser) {
      syncWalletToFirestore(currentUser.uid);
    }

    return {
      success: true,
      message: `Bought ${quantity} ${coin.symbol.toUpperCase()} with dummy money!`
    };
  };

  // Sell coin with dummy money - modified to sync with Firestore
  const sellCoin = (coinId, quantity, currentPrice) => {
    const holdingIndex = holdings.findIndex(h => h.coinId === coinId);
    
    if (holdingIndex < 0) {
      return { success: false, message: "You don't own this coin!" };
    }

    const holding = holdings[holdingIndex];
    
    if (quantity > holding.quantity) {
      return { success: false, message: "Insufficient coins to sell!" };
    }

    const totalValue = quantity * currentPrice;
    let newHoldings = [...holdings];

    if (quantity === holding.quantity) {
      // Remove the holding completely
      newHoldings = newHoldings.filter(h => h.coinId !== coinId);
    } else {
      // Reduce the quantity
      newHoldings[holdingIndex] = {
        ...holding,
        quantity: holding.quantity - quantity
      };
    }

    // Add to dummy balance
    setDummyBalance(prev => prev + totalValue);
    
    // Add transaction record
    const newTransaction = {
      id: Date.now(),
      type: "SELL",
      coinId: coinId,
      coinName: holding.name,
      quantity: quantity,
      price: currentPrice,
      total: totalValue,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setHoldings(newHoldings);

    // Update lastUpdated timestamp
    setLastUpdated(new Date().toISOString());

    // Sync to Firestore if user is logged in
    if (currentUser) {
      syncWalletToFirestore(currentUser.uid);
    }

    return {
      success: true,
      message: `Sold ${quantity} ${holding.symbol.toUpperCase()} for dummy money!`
    };
  };

  // Get portfolio value based on current prices
  const getPortfolioValue = (currentPrices) => {
    if (!currentPrices || holdings.length === 0) return 0;
    
    return holdings.reduce((total, holding) => {
      const currentPriceData = currentPrices[holding.coinId];
      if (currentPriceData) {
        return total + (holding.quantity * currentPriceData);
      }
      return total + (holding.quantity * holding.buyPrice);
    }, 0);
  };

  // Get total invested amount
  const getTotalInvested = () => {
    return holdings.reduce((total, holding) => {
      return total + (holding.quantity * holding.buyPrice);
    }, 0);
  };

  // Get holding for a specific coin
  const getHolding = (coinId) => {
    return holdings.find(h => h.coinId === coinId);
  };

  // Reset virtual trading (for testing) - modified to sync with Firestore
  const resetVirtualTrading = () => {
    setDummyBalance(INITIAL_DUMMY_BALANCE);
    setHoldings([]);
    setTransactions([]);
    setLastUpdated(new Date().toISOString());

    // Sync to Firestore if user is logged in
    if (currentUser) {
      syncWalletToFirestore(currentUser.uid);
    }
  };

  return (
    <Crypto.Provider value={{ 
      currency, 
      setCurrency, 
      symbol, 
      theme, 
      setTheme,
      // Virtual Trading - This is a simulated trading system using dummy money
      dummyBalance,
      setDummyBalance: handleSetDummyBalance,
      holdings,
      transactions,
      buyCoin,
      sellCoin,
      getPortfolioValue,
      getTotalInvested,
      getHolding,
      resetVirtualTrading,
      // Sync status
      isSyncing,
      syncComplete,
      currentUser
    }}>
      {children}
    </Crypto.Provider>
  );
};

export default CryptoContext;

export const CryptoState = () => {
  return useContext(Crypto);
};
