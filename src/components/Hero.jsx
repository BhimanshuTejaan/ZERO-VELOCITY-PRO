import React, { useState, useEffect } from 'react';
import './Hero.css';
import { useAuth } from '../AuthContext';
import { executePurchaseFlow } from '../utils/purchaseFlow';

export default function Hero() {
  const { currentUser, loginWithGoogle, isSoleAdmin, hasActiveLicense } = useAuth();
  const [activeWordIndex, setActiveWordIndex] = useState(0);

  // Subtle keyframe cadence simulating playhead passing through words
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % 4);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

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
    <section className="cinematic-hero" id="hero">
      <div className="hero-backdrop" aria-hidden="true">
        <div className="backdrop-ambient-glow"></div>
        <div className="backdrop-fine-grid"></div>
      </div>

      <div className="container hero-container">
        {/* Top Editorial Headline & Actions */}
        <div className="hero-editorial-lead">
          <div className="hero-eyebrow">
            <span className="eyebrow-pip" aria-hidden="true"></span>
            <span>ZERO VELOCITY 1.2 · FOR ADOBE AFTER EFFECTS</span>
          </div>

          <h1 className="hero-headline">
            Captions that move<br />
            <span className="headline-accent">with your edit.</span>
          </h1>

          <p className="hero-subtitle">
            Turn raw speech into styled, animated, editable caption layers without leaving Adobe After Effects.
          </p>

          {/* Primary Action Row */}
          <div className="hero-actions-row">
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
                Get Lifetime Access · ₹299
              </button>
            )}

            <a href="#demo" className="btn-hero-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Watch the demo</span>
            </a>
          </div>

          {/* Understated Platform Compatibility Notice */}
          <div className="hero-os-badge">
            <span className="hero-os-dot" aria-hidden="true"></span>
            <span><strong>Windows Only — macOS Version in Development</strong></span>
          </div>

          <p className="hero-trust-note">
            Adobe After Effects 2020–2025 · 2 device activations · Version 1.x updates included free
          </p>
        </div>

        {/* Cinematic Product-Led Output Showcase (Widescreen Composition) */}
        <div className="hero-cinematic-stage" aria-label="Authentic After Effects Output Preview">
          {/* Timeline Viewport Top Chrome */}
          <div className="stage-topbar">
            <div className="stage-comp-info">
              <span className="ae-tag-badge">Ae</span>
              <span className="stage-comp-name">Active Timeline · 1080 × 1920 (29.97 fps)</span>
            </div>
            <div className="stage-timecode">
              <span className="timecode-dot" aria-hidden="true"></span>
              <span className="timecode-value">00:00:02:14</span>
            </div>
          </div>

          {/* Composition Output Frame */}
          <div className="stage-viewport">
            <div className="stage-footage-scrim" aria-hidden="true"></div>

            {/* Authentic Caption Output Render */}
            <div className="stage-caption-overlay">
              <div className="caption-role-pills" aria-hidden="true">
                <span className={`role-pill role-support ${activeWordIndex === 0 ? 'active' : ''}`}>SUPPORT</span>
                <span className={`role-pill role-hero ${activeWordIndex === 1 || activeWordIndex === 2 ? 'active' : ''}`}>HERO WORD</span>
                <span className={`role-pill role-accent ${activeWordIndex === 3 ? 'active' : ''}`}>ACCENT · POP SFX</span>
              </div>

              <div className="stage-caption-block">
                <span className={`caption-word word-lead ${activeWordIndex === 0 ? 'highlight' : ''}`}>
                  POWERFUL
                </span>
                <span className={`caption-word word-hero ${activeWordIndex === 1 || activeWordIndex === 2 ? 'highlight' : ''}`}>
                  CAPTIONS
                </span>
                <span className={`caption-word word-accent ${activeWordIndex === 3 ? 'highlight' : ''}`}>
                  SYNCED.
                </span>
              </div>

              <div className="stage-layer-label">
                <span className="layer-type-dot"></span>
                <span>Native After Effects Vector Text Layer · Auto Keyframed</span>
              </div>
            </div>
          </div>

          {/* Timeline Scrubber & Marker Rail */}
          <div className="stage-timeline-bar" aria-hidden="true">
            <div className="timeline-ruler">
              <span className="ruler-tick">00:00:00</span>
              <span className="ruler-tick">00:00:01</span>
              <span className="ruler-tick active">00:00:02</span>
              <span className="ruler-tick">00:00:03</span>
              <span className="ruler-tick">00:00:04</span>
            </div>

            <div className="timeline-track">
              {/* Playhead Indicator */}
              <div className={`timeline-playhead pos-${activeWordIndex}`}>
                <div className="playhead-head"></div>
                <div className="playhead-line"></div>
              </div>

              {/* Audio waveform visualization */}
              <div className="timeline-waveform">
                {[40, 65, 85, 45, 95, 70, 50, 90, 100, 60, 45, 80, 95, 40, 75, 85, 30, 90, 65, 50, 80, 100, 70, 45, 90, 60, 85, 40].map((h, i) => (
                  <span
                    key={i}
                    className="wave-bar"
                    style={{ height: `${h}%` }}
                  ></span>
                ))}
              </div>

              {/* Sequence Keyframe Markers */}
              <div className="timeline-markers">
                <span className="marker-diamond pos-1" title="Word 1 In"></span>
                <span className="marker-diamond pos-2" title="Hero Word In"></span>
                <span className="marker-diamond pos-3 active" title="SFX Hit Locked"></span>
                <span className="marker-diamond pos-4" title="Caption Out"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Editorial Capability Strip */}
        <div className="hero-capability-rail" aria-label="Core Technical Capabilities">
          <div className="rail-col">
            <span className="rail-accent">01</span>
            <span className="rail-text">100% Native AE Layers</span>
          </div>
          <div className="rail-col">
            <span className="rail-accent">02</span>
            <span className="rail-text">Offline English &amp; Hinglish</span>
          </div>
          <div className="rail-col">
            <span className="rail-accent">03</span>
            <span className="rail-text">6 Signature Styles</span>
          </div>
          <div className="rail-col">
            <span className="rail-accent">04</span>
            <span className="rail-text">10 Motion Presets + 5 SFX</span>
          </div>
        </div>
      </div>
    </section>
  );
}
