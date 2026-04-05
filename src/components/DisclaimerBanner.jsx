import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import '../styles/DisclaimerBanner.css';

/**
 * DisclaimerBanner Component
 * Shows a warning about dummy money - this is a simulated trading system
 */
const DisclaimerBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-content">
        <FaExclamationTriangle className="disclaimer-icon" />
        <div className="disclaimer-text">
          <strong>⚠️ IMPORTANT: This is a learning-only virtual trading platform.</strong>
          <span> All money used here is <strong>DUMMY MONEY</strong>. No real transactions involved.</span>
        </div>
      </div>
      <button 
        className="disclaimer-close" 
        onClick={() => setIsVisible(false)}
        aria-label="Close disclaimer"
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default DisclaimerBanner;
