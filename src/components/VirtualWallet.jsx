import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaCoins, FaChartLine, FaSignOutAlt, FaPlus, FaTimes } from 'react-icons/fa';
import { CryptoState } from '../CryptoContext';
import '../styles/VirtualWallet.css';

/**
 * VirtualWallet Component
 * Displays the dummy balance and quick portfolio stats
 * This is a simulated trading system using dummy money
 */
const VirtualWallet = ({ compact = false }) => {
  const { dummyBalance, holdings, symbol, setDummyBalance } = CryptoState();
  const navigate = useNavigate();
  
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [error, setError] = useState('');
  
  const formatCurrency = (value) => {
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  };

  const handleAddMoney = () => {
    const amount = parseFloat(addAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    
    // Add the amount to dummy balance
    setDummyBalance(prev => prev + amount);
    
    // Close modal and reset
    setShowAddMoneyModal(false);
    setAddAmount('');
    setError('');
  };

  const handleCloseModal = () => {
    setShowAddMoneyModal(false);
    setAddAmount('');
    setError('');
  };

  if (compact) {
    // Compact version for header
    return (
      <div className="virtual-wallet-compact" onClick={() => navigate('/portfolio')}>
        <FaWallet className="wallet-icon" />
        <div className="wallet-info">
          <span className="wallet-label">Dummy Balance</span>
          <span className="wallet-amount">
            {symbol} {formatCurrency(dummyBalance)}
          </span>
        </div>
        <div className="wallet-badge">
          <FaCoins />
        </div>
      </div>
    );
  }

  // Full version for portfolio page
  return (
    <div className="virtual-wallet">
      <div className="wallet-header">
        <div className="wallet-title">
          <FaWallet className="wallet-icon-large" />
          <h3>Virtual Wallet</h3>
        </div>
        <span className="wallet-badge-full">DUMMY MONEY</span>
      </div>
      
      <div className="wallet-balance">
        <span className="balance-label">Available Balance</span>
        <span className="balance-amount">
          {symbol} {formatCurrency(dummyBalance)}
        </span>
      </div>

      <button 
        className="add-money-btn"
        onClick={() => setShowAddMoneyModal(true)}
      >
        <FaPlus /> Add Money
      </button>
      
      <div className="wallet-stats">
        <div className="stat-item">
          <FaCoins className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">Holdings</span>
            <span className="stat-value">{holdings.length} coins</span>
          </div>
        </div>
        
        <div className="stat-item" onClick={() => navigate('/portfolio')}>
          <FaChartLine className="stat-icon" />
          <div className="stat-info">
            <span className="stat-label">View Portfolio</span>
            <span className="stat-value clickable">Click here →</span>
          </div>
        </div>
      </div>
      
      <div className="wallet-disclaimer">
        <small>⚠️ This is simulated money for learning purposes only</small>
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="add-money-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Money to Wallet</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-body">
              <label>Enter Amount ({symbol})</label>
              <input
                type="number"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => {
                  setAddAmount(e.target.value);
                  setError('');
                }}
                min="0"
                step="any"
                autoFocus
              />
              
              {error && <p className="error-message">{error}</p>}
              
              <p className="current-balance">
                Current Balance: {symbol} {formatCurrency(dummyBalance)}
              </p>
              
              {addAmount && !error && (
                <p className="new-balance">
                  New Balance: {symbol} {formatCurrency(dummyBalance + parseFloat(addAmount || 0))}
                </p>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleAddMoney}>
                Add Money
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualWallet;
