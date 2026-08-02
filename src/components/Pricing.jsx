import React from 'react';
import './Pricing.css';
import { useAuth } from '../AuthContext';
import { executePurchaseFlow } from '../utils/purchaseFlow';

export default function Pricing() {
  const { currentUser, loginWithGoogle } = useAuth();

  const handleBuyNow = () => {
    executePurchaseFlow({ currentUser, loginWithGoogle });
  };

  return (
    <section className="pricing section-padding">
      <div className="container">
        <div className="pricing-card glass-panel">
          <div className="pricing-header">
            <h2 className="pricing-title">Founder Launch</h2>
            <div className="pricing-badge">First 50 Customers</div>
          </div>
          
          <div className="early-adopter-notice">
            <span className="rocket-icon">🚀</span>
            <div className="early-adopter-text">
              <strong>Buy Version 1.0</strong>
              <span>Every Version 1.x update is FREE.</span>
            </div>
          </div>
          
          <div className="pricing-amount">
            <span className="pricing-crossed">₹499</span>
            <span className="pricing-current">₹99</span>
          </div>
          
          <ul className="pricing-features">
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Lifetime Access
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              All Version 1.x Updates
            </li>
            <li>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Premium Support
            </li>
          </ul>
          
          <button className="btn btn-primary btn-full" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>
    </section>
  );
}
