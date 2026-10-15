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
    <section id="pricing" className="pricing-section">
      <div className="container">
        {/* Section Header */}
        <div className="pricing-header text-center">
          <div className="pricing-eyebrow">
            <span className="pricing-dot" aria-hidden="true"></span>
            <span>ONE-TIME PURCHASE · PERPETUAL LICENSE</span>
          </div>
          <h2 className="pricing-title">
            One Investment.<br />
            <span className="pricing-title-accent">Lifetime After Effects Studio.</span>
          </h2>
          <p className="pricing-subtitle">
            One-time payment of ₹299. No subscriptions, no rendering credits, and no recurring fees ever.
          </p>
        </div>

        {/* Coherent Single Pricing Decision Stage (No nested boxes) */}
        <div className="pricing-decision-card">
          <div className="pricing-main-col">
            <div className="pricing-tier-row">
              <span className="pricing-license-name">Zero Velocity Studio License</span>
              <span className="pricing-status-pill">
                {isSoleAdmin ? 'Admin Account' : hasActiveLicense ? 'Active License' : 'Perpetual Access'}
              </span>
            </div>

            <p className="pricing-summary-text">
              Full commercial license for motion designers, video editors, and creators working inside Adobe After Effects.
            </p>

            {/* Price Line with Mathematically Corrected 40% Discount */}
            <div className="pricing-figure-block">
              <div className="pricing-rate-line">
                <span className="pricing-curr">₹</span>
                <span className="pricing-num">299</span>
                <span className="pricing-original">₹499</span>
                <span className="pricing-discount-tag">40% OFF</span>
              </div>
              <span className="pricing-billing-terms">One-time payment • Lifetime access • No recurring fees</span>
            </div>

            {/* Primary Action Button */}
            <div className="pricing-action-wrap">
              {isSoleAdmin ? (
                <button className="btn-pricing-cta" onClick={handleOpenAdmin}>
                  Open Admin Dashboard
                </button>
              ) : hasActiveLicense ? (
                <button className="btn-pricing-cta" onClick={handleOpenLicenseModal}>
                  My License &amp; Download
                </button>
              ) : (
                <button className="btn-pricing-cta" onClick={handleBuyNow}>
                  <span>Get Lifetime Access · ₹299</span>
                  <span className="cta-arrow" aria-hidden="true">&rarr;</span>
                </button>
              )}

              {/* Exact Primary Platform Compatibility Notice */}
              <div className="pricing-platform-pill">
                <span className="platform-dot" aria-hidden="true"></span>
                <span><strong>Windows Only — macOS Version in Development</strong></span>
              </div>
            </div>

            <p className="pricing-activation-terms">
              Includes 2 device activations (desktop workstation &amp; laptop) · Compatible with AE 2020–2025 · Instant license delivery after checkout.
            </p>
          </div>

          {/* Scannable Inclusions List */}
          <div className="pricing-inclusions-col">
            <span className="inclusions-heading">Everything Included with Your License:</span>

            <ul className="inclusions-list">
              <li>
                <span className="check-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>6 Signature Caption Styles</strong>
                  <span>Balanced, Corporate Clean, Progressive Line, Simple Line, Clean Caption, Devin Style.</span>
                </div>
              </li>
              <li>
                <span className="check-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>10 Native Motion Entrance Presets</strong>
                  <span>Smooth cubic-bezier keyframe curves targeting Words or Lines.</span>
                </div>
              </li>
              <li>
                <span className="check-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>5 Built-in Audio SFX Cues</strong>
                  <span>Pops, clicks, whooshes, and snaps automatically locked to impact keyframes.</span>
                </div>
              </li>
              <li>
                <span className="check-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>100% Native After Effects Vector Layers</strong>
                  <span>Always editable in the AE timeline with infinite resolution. Never flat video.</span>
                </div>
              </li>
              <li>
                <span className="check-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>Private On-Device Speech Recognition</strong>
                  <span>Local Whisper transcription for English and Roman Hinglish. Zero cloud latency.</span>
                </div>
              </li>
              <li>
                <span className="check-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>2 Workstation Activations &amp; Free v1.x Updates</strong>
                  <span>Activate on 2 machines simultaneously. Pay once today, all v1.x updates included free.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
