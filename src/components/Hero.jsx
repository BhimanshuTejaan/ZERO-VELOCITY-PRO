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
    <section className="editorial-hero" id="hero">
      <div className="hero-backdrop" aria-hidden="true">
        <div className="backdrop-ambient-glow"></div>
        <div className="backdrop-fine-grid"></div>
      </div>

      <div className="editorial-container">
        {/* Main Editorial Asymmetrical Grid */}
        <div className="editorial-grid">
          {/* Left Column: Copy & Actions */}
          <div className="editorial-copy-col">
            <div className="editorial-eyebrow">
              <span className="eyebrow-pip" aria-hidden="true"></span>
              <span>ZERO VELOCITY 1.2 · FOR AFTER EFFECTS</span>
            </div>

            <h1 className="editorial-headline">
              Captions that move<br />
              <span className="headline-accent">with your edit.</span>
            </h1>

            <p className="editorial-subtitle">
              Turn raw audio into styled, animated, editable, and sound-synced captions without leaving After Effects.
            </p>

            {/* Actions: One Primary Button & One Clean Text Link */}
            <div className="editorial-actions-row">
              {isSoleAdmin ? (
                <button className="btn-hero-primary" onClick={handleOpenAdmin}>
                  Admin Control Center
                </button>
              ) : hasActiveLicense ? (
                <button className="btn-hero-primary" onClick={handleOpenLicenseModal}>
                  My License &amp; Download
                </button>
              ) : (
                <button className="btn-hero-primary" onClick={handleBuyNow}>
                  Get Lifetime Access · ₹99
                </button>
              )}

              <a href="#workflow" className="hero-secondary-link">
                <span>Explore the workflow</span>
                <span className="link-arrow" aria-hidden="true">&rarr;</span>
              </a>
            </div>

            {/* Quiet Platform Trust Line */}
            <p className="editorial-trust-note">
              Windows · AE 2020–2025 · 2 devices · Version 1.x updates included
            </p>
          </div>

          {/* Right Column: Original Code-Rendered Kinetic Typography Composition */}
          <div className="editorial-motion-col" aria-label="Kinetic Caption Presentation">
            <div className="kinetic-stage">
              <div className="kinetic-light-field" aria-hidden="true"></div>

              <div className="kinetic-typography-stack">
                {/* 1. Support Phrase: MAKE */}
                <div className="kinetic-line line-support">
                  <span className="phrase-support">MAKE</span>
                </div>

                {/* 2. Dominant Hero Phrase: EVERY WORD */}
                <div className="kinetic-line line-hero">
                  <span className="phrase-hero">EVERY WORD</span>
                </div>

                {/* 3. Accent Phrase: LAND. */}
                <div className="kinetic-line line-accent">
                  <span className="phrase-accent">LAND<span className="accent-dot">.</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Capability Rail at bottom edge: Thin, Calm, Secondary */}
        <div className="editorial-capability-rail" aria-label="Core Capabilities">
          <div className="cap-group">
            <span className="cap-item">Offline transcription</span>
            <span className="cap-sep" aria-hidden="true">·</span>
            <span className="cap-item">6 caption styles</span>
          </div>
          <span className="cap-sep cap-sep-mid" aria-hidden="true">·</span>
          <div className="cap-group">
            <span className="cap-item">10 entrance animations</span>
            <span className="cap-sep" aria-hidden="true">·</span>
            <span className="cap-item">Built-in sound sync</span>
          </div>
        </div>
      </div>
    </section>
  );
}
