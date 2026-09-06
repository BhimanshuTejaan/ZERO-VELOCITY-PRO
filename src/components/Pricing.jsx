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
    <section id="pricing" className="pricing">
      <div className="container">
        <div className="pricing-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>Simple, Honest Lifetime Access</span>
          </div>
          <h2 className="section-title">
            One Investment.<br />
            <span className="text-gradient-accent">Lifetime After Effects Studio.</span>
          </h2>
          <p className="section-subtitle">
            One-time payment of ₹99. No subscriptions, no rendering credits, and no recurring fees ever.
          </p>
        </div>

        {/* 2-Column Wide Pricing Matrix */}
        <div className="pricing-master-card panel-matte-elevated">
          {/* Left Column: Plan Info, Price & Action CTA */}
          <div className="pricing-left-col">
            <div className="pricing-plan-badge-row">
              <span className="pricing-tier-pill">
                {isSoleAdmin ? 'Admin Mode' : hasActiveLicense ? 'Active License' : 'Version 1.2 Studio Access'}
              </span>
              <span className="pricing-lifetime-tag">Lifetime Rights</span>
            </div>

            <h3 className="pricing-plan-title">Zero Velocity Studio License</h3>
            <p className="pricing-plan-summary">
              Full commercial license for video editors, motion designers, and creators using Adobe After Effects.
            </p>

            <div className="pricing-amount-block">
              <div className="pricing-number-line">
                <span className="pricing-currency">₹</span>
                <span className="pricing-current-val">99</span>
                <span className="pricing-crossed-val">₹499</span>
                <span className="pricing-save-badge">80% OFF</span>
              </div>
              <span className="pricing-terms-note">One-time payment • Lifetime access</span>
            </div>

            <div className="pricing-cta-wrap">
              {isSoleAdmin ? (
                <button className="btn btn-primary btn-pricing-hero" onClick={handleOpenAdmin}>
                  Open Admin Dashboard
                </button>
              ) : hasActiveLicense ? (
                <button className="btn btn-primary btn-pricing-hero" onClick={handleOpenLicenseModal}>
                  My License &amp; Download
                </button>
              ) : (
                <button className="btn btn-primary btn-pricing-hero" onClick={handleBuyNow}>
                  <span>Get Lifetime Access • ₹99</span>
                  <span className="btn-arrow">&rarr;</span>
                </button>
              )}
            </div>

            <div className="pricing-guarantee-box">
              <span className="guarantee-icon">⚡</span>
              <div className="guarantee-text">
                <strong>Honest Lifetime Upgrade Guarantee</strong>
                <span>Pay once today. Receive every Version 1.x update and feature addition free forever.</span>
              </div>
            </div>

            {/* Clear OS Compatibility Notice */}
            <div className="pricing-os-notice">
              <span className="os-warning-icon">ℹ</span>
              <span><strong>Windows (AE 2020–2025)</strong> • macOS is not supported yet (coming very soon).</span>
            </div>
          </div>

          {/* Right Column: Complete Feature Breakdown & Trust Specs */}
          <div className="pricing-right-col">
            <div className="features-col-header">
              <h4 className="features-heading">Everything Included with Lifetime Access</h4>
              <span className="features-subheading">Instant download &amp; license activation</span>
            </div>

            <ul className="pricing-features-list">
              <li>
                <span className="feat-check">✓</span>
                <div className="feat-detail">
                  <strong>6 Signature Caption Styles</strong>
                  <span>Balanced, Corporate Clean, Progressive Line, Simple Line, Clean Caption &amp; Devin Style</span>
                </div>
              </li>
              <li>
                <span className="feat-check">✓</span>
                <div className="feat-detail">
                  <strong>10 Native Motion Presets</strong>
                  <span>Word and Line entrance animations with authentic bezier easing graph curves</span>
                </div>
              </li>
              <li>
                <span className="feat-check">✓</span>
                <div className="feat-detail">
                  <strong>5 Built-In Audio Cues</strong>
                  <span>Pops, Clicks, Whooshes, and Snaps locked to entrance keyframes</span>
                </div>
              </li>
              <li>
                <span className="feat-check">✓</span>
                <div className="feat-detail">
                  <strong>In-Plugin Caption Workbench</strong>
                  <span>Correct text, balance phrases, and assign Support, Hero, and Accent role tags</span>
                </div>
              </li>
              <li>
                <span className="feat-check">✓</span>
                <div className="feat-detail">
                  <strong>Deep Styling &amp; Typography Engine</strong>
                  <span>Font pairing (including Tactic Sans, Syne, Garamond, Inter), casing, and color palettes</span>
                </div>
              </li>
              <li>
                <span className="feat-check">✓</span>
                <div className="feat-detail">
                  <strong>100% Native After Effects Layers</strong>
                  <span>Frame-accurate keyframed vector text and shapes (never flat video exports)</span>
                </div>
              </li>
              <li>
                <span className="feat-check">✓</span>
                <div className="feat-detail">
                  <strong>Offline Speech Recognition</strong>
                  <span>100% private, on-device audio transcription for English and Roman Hinglish</span>
                </div>
              </li>
              <li>
                <span className="feat-check">✓</span>
                <div className="feat-detail">
                  <strong>2 Device Activations</strong>
                  <span>Activate on your primary desktop workstation and laptop simultaneously</span>
                </div>
              </li>
            </ul>

            <div className="pricing-bottom-trust-strip">
              <div className="trust-badge-item">
                <span className="trust-icon">🔒</span>
                <span>Secure Razorpay Checkout</span>
              </div>
              <div className="trust-badge-item">
                <span className="trust-icon">⚡</span>
                <span>Instant License Key</span>
              </div>
              <div className="trust-badge-item">
                <span className="trust-icon">🔄</span>
                <span>Free Lifetime Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
