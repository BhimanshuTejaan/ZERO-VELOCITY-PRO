import React from 'react';
import './Pricing.css';
import { useAuth } from '../AuthContext';
import { executePurchaseFlow } from '../utils/purchaseFlow';

export default function Pricing() {
  const { currentUser, loginWithGoogle, isSoleAdmin, hasActiveLicense } = useAuth();

  const handleBuyNow = () => {
    executePurchaseFlow({ currentUser, loginWithGoogle });
  };

  const handleOpenAdmin = () => {
    window.dispatchEvent(new CustomEvent('zero-velocity-open-admin-dashboard'));
  };

  const handleOpenLicenseModal = () => {
    window.dispatchEvent(new CustomEvent('zero-velocity-open-license-modal'));
  };

  return (
    <section className="pricing section-padding">
      <div className="container">
        <div className="pricing-card glass-panel">
          <div className="pricing-header">
            <h2 className="pricing-title">Founder Launch</h2>
            <div className="pricing-badge">
              {isSoleAdmin ? 'Admin Mode' : hasActiveLicense ? 'Purchased' : 'First 50 Customers'}
            </div>
          </div>
          
          <div className="early-adopter-notice">
            <span className="rocket-icon">
              {isSoleAdmin ? '⚡' : hasActiveLicense ? '🎉' : '🚀'}
            </span>
            <div className="early-adopter-text">
              {isSoleAdmin ? (
                <>
                  <strong>Administrator Account</strong>
                  <span>Full control panel & license generator.</span>
                </>
              ) : hasActiveLicense ? (
                <>
                  <strong>You Own Version 1.0!</strong>
                  <span>Your lifetime license is active on your account.</span>
                </>
              ) : (
                <>
                  <strong>Buy Version 1.0</strong>
                  <span>Every Version 1.x update is FREE.</span>
                </>
              )}
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
          
          {isSoleAdmin ? (
            <button className="btn btn-primary btn-full" onClick={handleOpenAdmin}>
              Open Admin Dashboard
            </button>
          ) : hasActiveLicense ? (
            <button className="btn btn-primary btn-full" onClick={handleOpenLicenseModal}>
              My License &amp; Download
            </button>
          ) : (
            <button className="btn btn-primary btn-full" onClick={handleBuyNow}>
              Buy Now
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
