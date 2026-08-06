import React from 'react';
import './Hero.css';
import { useAuth } from '../AuthContext';
import { executePurchaseFlow } from '../utils/purchaseFlow';

export default function Hero() {
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
    <section className="hero animate-fade-in">
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="launch-badge">
            <span className="badge-dot"></span>
            Zero Velocity v1.0 • Now Available
          </div>
          
          <h1 className="hero-title">
            Automated Captions.<br />
            <span className="text-gradient-accent">Built for After Effects.</span>
          </h1>
          
          <p className="hero-subtitle">
            Zero Velocity eliminates manual keyframing and tedious text positioning. Generate crisp, animated, perfectly timed captions in seconds.
          </p>
          
          <div className="hero-pricing-widget">
            <div className="price-tag-inline">
              <span className="price-current">₹99</span>
              <span className="price-crossed">₹499</span>
            </div>
            <p className="price-terms-inline">Founder Launch Price. Lifetime access.</p>
          </div>

          <div className="hero-cta">
            {isSoleAdmin ? (
              <button className="btn btn-primary btn-large" onClick={handleOpenAdmin}>
                Admin Control Center
              </button>
            ) : hasActiveLicense ? (
              <button className="btn btn-primary btn-large" onClick={handleOpenLicenseModal}>
                My License &amp; Download
              </button>
            ) : (
              <button className="btn btn-primary btn-large" onClick={handleBuyNow}>
                Buy Now
              </button>
            )}
            <button 
              type="button"
              className="btn btn-secondary btn-large"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(
                  "https://youtu.be/MTN4vS5O_Bs?si=NJHWgewS74e1J8MC",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              Watch Demo
            </button>
          </div>
          
          <a href="#release-notes" className="roadmap-value-badge">
            <div className="rv-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"></path>
              </svg>
            </div>
            <div className="rv-text">
              <span className="rv-title">All Version 1.x Updates Included &rarr;</span>
              <span className="rv-subtitle">Buy once today. Receive every feature update for free.</span>
            </div>
          </a>
        </div>
        
        <div className="hero-visual">
          <div className="iframe-container glass-panel">
            <iframe 
              src="/cep/index.html" 
              title="Zero Velocity Preview" 
              className="cep-iframe"
            />
          </div>
          <div className="glow-bg-hero"></div>
        </div>
      </div>
    </section>
  );
}
