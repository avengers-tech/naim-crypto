import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaChartLine, FaCoins, FaHistory, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { CryptoState } from '../CryptoContext';
import { CoinList } from '../config/api';
import { numberWithCommas } from '../components/CoinTable';
import VirtualWallet from '../components/VirtualWallet';
import TradeModal from '../components/TradeModal';
import '../styles/PortfolioPage.css';

/**
 * PortfolioPage Component
 * Displays user's virtual portfolio with holdings, P/L, and transaction history
 * This is a simulated trading system using dummy money
 */
const PortfolioPage = () => {
  const navigate = useNavigate();
  const { 
    symbol, 
    holdings, 
    transactions, 
    getTotalInvested, 
    resetVirtualTrading,
    dummyBalance,
    currency
  } = CryptoState();
  
  const [currentPrices, setCurrentPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('holdings'); // 'holdings' or 'history'
  const [tradeModal, setTradeModal] = useState({ isOpen: false, coin: null, mode: 'sell', currentPrice: 0, quantity: 0 });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Fetch current prices for all holdings
  useEffect(() => {
    const fetchPrices = async () => {
      if (holdings.length === 0) {
        setCurrentPrices({});
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(CoinList(currency));
        
        // Create a map of coin ID to current price
        const priceMap = {};
        data.forEach(coin => {
          priceMap[coin.id] = coin.current_price;
        });
        
        setCurrentPrices(priceMap);
      } catch (error) {
        console.error('Error fetching prices:', error);
        // Fall back to buy prices
        const priceMap = {};
        holdings.forEach(h => {
          priceMap[h.coinId] = h.buyPrice;
        });
        setCurrentPrices(priceMap);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [holdings, currency]);

  const formatCurrency = (value) => {
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  // Calculate portfolio stats
  const totalInvested = getTotalInvested();
  const portfolioValue = holdings.reduce((total, holding) => {
    const currentPrice = currentPrices[holding.coinId] || holding.buyPrice;
    return total + (holding.quantity * currentPrice);
  }, 0);
  const totalPL = portfolioValue - totalInvested;
  const totalPLPercent = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  // Handle sell button click
  const handleSellClick = (holding, currentPrice) => {
    setTradeModal({
      isOpen: true,
      coin: {
        id: holding.coinId,
        name: holding.name,
        symbol: holding.symbol,
        image: holding.image
      },
      mode: 'sell',
      currentPrice: currentPrice,
      quantity: holding.quantity
    });
  };

  // Handle reset
  const handleReset = () => {
    resetVirtualTrading();
    setShowResetConfirm(false);
  };

  // Render holding row
  const renderHolding = (holding) => {
    const currentPrice = currentPrices[holding.coinId] || holding.buyPrice;
    const currentValue = holding.quantity * currentPrice;
    const investedValue = holding.quantity * holding.buyPrice;
    const pl = currentValue - investedValue;
    const plPercent = investedValue > 0 ? (pl / investedValue) * 100 : 0;
    const isProfit = pl >= 0;

    return (
      <div key={holding.coinId} className="portfolio-holding">
        <div className="holding-coin">
          <img src={holding.image} alt={holding.name} className="holding-image" />
          <div className="holding-info">
            <span className="holding-name">{holding.name}</span>
            <span className="holding-symbol">{holding.symbol.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="holding-details">
          <div className="holding-stat">
            <span className="stat-label">Quantity</span>
            <span className="stat-value">{holding.quantity}</span>
          </div>
          
          <div className="holding-stat">
            <span className="stat-label">Avg. Buy Price</span>
            <span className="stat-value">{symbol} {formatCurrency(holding.buyPrice)}</span>
          </div>
          
          <div className="holding-stat">
            <span className="stat-label">Current Price</span>
            <span className="stat-value">{symbol} {formatCurrency(currentPrice)}</span>
          </div>
          
          <div className="holding-stat">
            <span className="stat-label">Value</span>
            <span className="stat-value">{symbol} {formatCurrency(currentValue)}</span>
          </div>
          
          <div className="holding-stat">
            <span className="stat-label">P/L</span>
            <span className={`stat-value ${isProfit ? 'profit' : 'loss'}`}>
              {isProfit ? '+' : ''}{symbol} {formatCurrency(Math.abs(pl))}
              <span className="pl-percent"> ({isProfit ? '+' : ''}{plPercent.toFixed(2)}%)</span>
            </span>
          </div>
        </div>
        
        <button 
          className="sell-btn"
          onClick={() => handleSellClick(holding, currentPrice)}
        >
          Sell
        </button>
      </div>
    );
  };

  // Render transaction row
  const renderTransaction = (tx) => {
    const isBuy = tx.type === 'BUY';
    const date = new Date(tx.date);
    
    return (
      <div key={tx.id} className="transaction-row">
        <div className="tx-type">
          <span className={`tx-badge ${isBuy ? 'buy' : 'sell'}`}>
            {isBuy ? 'BUY' : 'SELL'}
          </span>
        </div>
        
        <div className="tx-details">
          <span className="tx-coin">{tx.coinName}</span>
          <span className="tx-info">
            {tx.quantity} {tx.coinName.split(' ')[0].toUpperCase()} @ {symbol} {formatCurrency(tx.price)}
          </span>
        </div>
        
        <div className="tx-total">
          <span className={isBuy ? 'spent' : 'received'}>
            {isBuy ? '-' : '+'}{symbol} {formatCurrency(tx.total)}
          </span>
          <span className="tx-date">
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="portfolio-page">
      {/* Disclaimer Banner */}
      <div className="portfolio-disclaimer">
        <FaExclamationTriangle />
        <span>
          <strong>Virtual Trading</strong> - This is a simulated trading system using dummy money. 
          No real transactions involved.
        </span>
      </div>

      <div className="portfolio-container">
        {/* Sidebar with Wallet */}
        <div className="portfolio-sidebar">
          <VirtualWallet />
          
          {/* Quick Stats */}
          <div className="portfolio-stats">
            <h4>Portfolio Summary</h4>
            
            <div className="stat-row">
              <span>Total Invested</span>
              <span>{symbol} {formatCurrency(totalInvested)}</span>
            </div>
            
            <div className="stat-row">
              <span>Portfolio Value</span>
              <span>{symbol} {formatCurrency(portfolioValue)}</span>
            </div>
            
            <div className="stat-row total">
              <span>Total P/L</span>
              <span className={totalPL >= 0 ? 'profit' : 'loss'}>
                {totalPL >= 0 ? '+' : ''}{symbol} {formatCurrency(Math.abs(totalPL))}
                <span className="pl-percent">
                  ({totalPL >= 0 ? '+' : ''}{totalPLPercent.toFixed(2)}%)
                </span>
              </span>
            </div>
          </div>

          {/* Reset Button */}
          <button 
            className="reset-btn"
            onClick={() => setShowResetConfirm(true)}
          >
            <FaTrash /> Reset Virtual Trading
          </button>
        </div>

        {/* Main Content */}
        <div className="portfolio-main">
          {/* Tabs */}
          <div className="portfolio-tabs">
            <button 
              className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
              onClick={() => setActiveTab('holdings')}
            >
              <FaCoins /> Holdings ({holdings.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory /> History ({transactions.length})
            </button>
          </div>

          {/* Holdings Tab */}
          {activeTab === 'holdings' && (
            <div className="holdings-section">
              {loading ? (
                <div className="loader-container">
                  <span className="loader" />
                </div>
              ) : holdings.length === 0 ? (
                <div className="empty-state">
                  <FaChartLine className="empty-icon" />
                  <h3>No Holdings Yet</h3>
                  <p>Start trading with dummy money to build your portfolio!</p>
                  <button onClick={() => navigate('/')}>
                    Browse Coins
                  </button>
                </div>
              ) : (
                <div className="holdings-list">
                  {holdings.map(renderHolding)}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="history-section">
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <FaHistory className="empty-icon" />
                  <h3>No Transactions Yet</h3>
                  <p>Your transaction history will appear here.</p>
                </div>
              ) : (
                <div className="transactions-list">
                  {transactions.map(renderTransaction)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal 
        isOpen={tradeModal.isOpen}
        onClose={() => setTradeModal({ ...tradeModal, isOpen: false })}
        coin={tradeModal.coin}
        currentPrice={tradeModal.currentPrice}
        mode={tradeModal.mode}
        existingQuantity={tradeModal.quantity}
      />

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="reset-modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="reset-modal" onClick={e => e.stopPropagation()}>
            <FaExclamationTriangle className="warning-icon" />
            <h3>Reset Virtual Trading?</h3>
            <p>This will:</p>
            <ul>
              <li>Reset your dummy balance to ₹10,000</li>
              <li>Clear all your holdings</li>
              <li>Clear all transaction history</li>
            </ul>
            <p className="warning-text">This action cannot be undone!</p>
            
            <div className="reset-modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-reset-btn"
                onClick={handleReset}
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
