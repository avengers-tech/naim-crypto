import React, { useState, useEffect } from 'react';
import { FaTimes, FaCoins, FaExchangeAlt, FaExclamationTriangle } from 'react-icons/fa';
import { CryptoState } from '../CryptoContext';
import '../styles/TradeModal.css';

/**
 * TradeModal Component
 * Modal for buying and selling cryptocurrencies with dummy money
 * This is a simulated trading system using dummy money
 */
const TradeModal = ({ 
  isOpen, 
  onClose, 
  coin, 
  currentPrice, 
  mode = 'buy', // 'buy' or 'sell'
  existingQuantity = 0 
}) => {
  const { symbol, dummyBalance, buyCoin, sellCoin } = CryptoState();
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen || !coin) return null;

  const formatCurrency = (value) => {
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Only allow positive numbers
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setQuantity(value);
      setError('');
      setSuccess('');
    }
  };

  const handleMaxQuantity = () => {
    if (mode === 'buy') {
      // Calculate max quantity based on dummy balance
      const maxQty = dummyBalance / currentPrice;
      setQuantity(maxQty.toFixed(8));
    } else {
      // Set max quantity for sell (existing holdings)
      setQuantity(existingQuantity.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const qty = parseFloat(quantity);
    
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (mode === 'buy') {
      const totalCost = qty * currentPrice;
      if (totalCost > dummyBalance) {
        setError('Insufficient dummy balance!');
        return;
      }
    }

    if (mode === 'sell') {
      if (qty > existingQuantity) {
        setError('Insufficient coins to sell!');
        return;
      }
    }

    setIsLoading(true);

    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    let result;
    if (mode === 'buy') {
      result = buyCoin(coin, qty, currentPrice);
    } else {
      result = sellCoin(coin.id, qty, currentPrice);
    }

    setIsLoading(false);

    if (result.success) {
      setSuccess(result.message);
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  const totalValue = quantity ? parseFloat(quantity) * currentPrice : 0;

  return (
    <div className="trade-modal-overlay" onClick={onClose}>
      <div className="trade-modal" onClick={e => e.stopPropagation()}>
        <div className="trade-modal-header">
          <div className="trade-modal-title">
            {mode === 'buy' ? (
              <>
                <FaCoins className="buy-icon" />
                <span>Buy with Dummy Money</span>
              </>
            ) : (
              <>
                <FaExchangeAlt className="sell-icon" />
                <span>Sell for Dummy Money</span>
              </>
            )}
          </div>
          <button className="trade-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="trade-disclaimer">
          <FaExclamationTriangle />
          <span>This is simulated trading with DUMMY money only!</span>
        </div>

        {/* Coin Info */}
        <div className="trade-coin-info">
          <img src={coin.image} alt={coin.name} className="trade-coin-image" />
          <div className="trade-coin-details">
            <span className="trade-coin-name">{coin.name}</span>
            <span className="trade-coin-symbol">{coin.symbol.toUpperCase()}</span>
          </div>
          <div className="trade-coin-price">
            <span className="price-label">Current Price</span>
            <span className="price-value">
              {symbol} {formatCurrency(currentPrice)}
            </span>
          </div>
        </div>

        {/* Available Balance */}
        <div className="trade-balance-info">
          {mode === 'buy' ? (
            <>
              <span className="balance-label">Available Dummy Balance</span>
              <span className="balance-value">{symbol} {formatCurrency(dummyBalance)}</span>
            </>
          ) : (
            <>
              <span className="balance-label">Your Holdings</span>
              <span className="balance-value">{existingQuantity} {coin.symbol.toUpperCase()}</span>
            </>
          )}
        </div>

        {/* Trade Form */}
        <form onSubmit={handleSubmit} className="trade-form">
          <div className="trade-input-group">
            <label>Quantity</label>
            <div className="trade-input-wrapper">
              <input
                type="text"
                value={quantity}
                onChange={handleQuantityChange}
                placeholder="Enter quantity"
                className="trade-input"
              />
              <button 
                type="button" 
                className="trade-max-btn"
                onClick={handleMaxQuantity}
              >
                MAX
              </button>
            </div>
          </div>

          <div className="trade-summary">
            <div className="trade-summary-row">
              <span>Total {mode === 'buy' ? 'Cost' : 'Value'}</span>
              <span className="trade-summary-value">
                {symbol} {formatCurrency(totalValue)}
              </span>
            </div>
          </div>

          {error && <div className="trade-error">{error}</div>}
          {success && <div className="trade-success">{success}</div>}

          <button 
            type="submit" 
            className={`trade-submit-btn ${mode}`}
            disabled={isLoading || !quantity}
          >
            {isLoading ? (
              <span className="loader" />
            ) : (
              <>
                {mode === 'buy' ? 'Buy with Dummy Money' : 'Sell for Dummy Money'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;
