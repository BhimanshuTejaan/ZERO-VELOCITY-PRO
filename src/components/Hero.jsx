import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Hero.css';
import { useAuth } from '../AuthContext';
import { executePurchaseFlow } from '../utils/purchaseFlow';

const HERO_STYLES = [
  {
    id: 'devin-style',
    name: 'Devin Style',
    kicker: 'Featured Creator Style',
    tagline: 'High-Impact Kinetic Word Pop',
    description: 'Ultra-bold kinetic typography with dynamic two-tone word emphasis and high-velocity retention.',
    videoSrc: '/previews/devin-style.mp4',
    posterSrc: '/previews/devin-style-poster.jpg',
    duration: 9.75,
  },
  {
    id: 'balanced-style',
    name: 'Balanced Style',
    kicker: 'Podcast & Narrative',
    tagline: 'Mixed Serif Italic & Clean Sans',
    description: 'Dynamic font pairing blending fluid editorial italics with high-contrast bold sans-serif.',
    videoSrc: '/previews/balanced-style.mp4',
    posterSrc: '/previews/balanced-style-poster.jpg',
    duration: 7.92,
  },
  {
    id: 'clean-caption',
    name: 'Clean Caption',
    kicker: 'Minimalist Talking Head',
    tagline: 'Refined Centered Typography',
    description: 'Crisp, centered subtitle presentation calibrated for dialogue clarity without visual clutter.',
    videoSrc: '/previews/clean-caption.mp4',
    posterSrc: '/previews/clean-caption-poster.jpg',
    duration: 7.06,
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    kicker: 'Executive & Brand',
    tagline: 'Authoritative Uppercase Titling',
    description: 'Polished, restrained uppercase titling engineered for corporate reels, commercials, and case studies.',
    videoSrc: '/previews/corporate-clean.mp4',
    posterSrc: '/previews/corporate-clean-poster.jpg',
    duration: 8.38,
  },
];

export default function Hero() {
  const { currentUser, loginWithGoogle, isSoleAdmin, hasActiveLicense } = useAuth();
  
  // Carousel State
  const [activeStyleIndex, setActiveStyleIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAutoCycleEnabled, setIsAutoCycleEnabled] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const videoRef = useRef(null);
  const modalVideoRef = useRef(null);
  const expandTriggerRef = useRef(null);
  const progressAnimRef = useRef(null);

  const activeStyle = HERO_STYLES[activeStyleIndex];

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (motionQuery.matches) {
        setIsAutoCycleEnabled(false);
        setIsPlaying(false);
      }
    }
  }, []);

  // Handle cycle advancement
  const advanceToNextStyle = useCallback(() => {
    setActiveStyleIndex((prev) => (prev + 1) % HERO_STYLES.length);
    setProgressPercent(0);
  }, []);

  // Inline video lifecycle on style change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setProgressPercent(0);
    video.currentTime = 0;

    // Load and attempt autoplay (muted)
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Autoplay was prevented by browser policy; stay on poster
          setIsPlaying(false);
        });
    }
  }, [activeStyleIndex]);

  // Video time update for smooth progress bar indicator
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const pct = Math.min(100, (video.currentTime / video.duration) * 100);
    setProgressPercent(pct);
  };

  // Video ended -> auto-advance to next style if auto-cycling is active
  const handleVideoEnded = () => {
    if (isAutoCycleEnabled && !isInteracting && !isExpandedModalOpen) {
      advanceToNextStyle();
    } else {
      // Loop current video if auto-cycling is paused
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    }
  };

  // Visibility change pause/resume
  useEffect(() => {
    const handleVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden || isExpandedModalOpen) {
        video.pause();
      } else if (isPlaying) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, isExpandedModalOpen]);

  // Select style manually
  const handleSelectStyle = (index) => {
    setActiveStyleIndex(index);
    setProgressPercent(0);
  };

  // Toggle Auto-Cycle
  const toggleAutoCycle = () => {
    setIsAutoCycleEnabled((prev) => {
      const next = !prev;
      const video = videoRef.current;
      if (video) {
        if (!next) {
          // Keep looping single video
          video.loop = true;
        } else {
          video.loop = false;
        }
      }
      return next;
    });
  };

  // Expanded modal handlers
  const openExpandedModal = () => {
    setIsExpandedModalOpen(true);
    // Pause inline video
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const closeExpandedModal = useCallback(() => {
    setIsExpandedModalOpen(false);
    // Resume inline video if was playing
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(() => {});
    }
    // Return focus to trigger
    if (expandTriggerRef.current) {
      expandTriggerRef.current.focus();
    }
  }, [isPlaying]);

  // Escape key & modal scroll lock
  useEffect(() => {
    if (!isExpandedModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeExpandedModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpandedModalOpen, closeExpandedModal]);

  // Purchase & Navigation handlers
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
    <section className="hero-editorial" id="hero" aria-label="Zero Velocity Overview">
      {/* Subtle ambient lighting */}
      <div className="hero-atmosphere" aria-hidden="true">
        <div className="hero-glow-soft"></div>
      </div>

      <div className="container hero-layout-container">
        {/* =================================================================
            LEFT COLUMN (~40%): Confident Editorial Storytelling & Direct CTA
            ================================================================= */}
        <div className="hero-editorial-col">
          <div className="hero-tag-kicker">
            <span className="kicker-lead">ZERO VELOCITY 1.2</span>
            <span className="kicker-sep">/</span>
            <span className="kicker-sub">NATIVE AFTER EFFECTS CAPTION ENGINE</span>
          </div>

          <h1 className="hero-title">
            Captions, made for the cut.
          </h1>

          <p className="hero-lede">
            Generate styled, animated, editable captions directly inside Adobe After Effects. 
            Real native vector text layers with frame-accurate sync and zero monthly subscriptions.
          </p>

          {/* Action Button Row */}
          <div className="hero-cta-group">
            {isSoleAdmin ? (
              <button 
                type="button"
                className="hero-btn-primary" 
                onClick={handleOpenAdmin}
                id="hero-admin-cta"
              >
                Admin Control Center
              </button>
            ) : hasActiveLicense ? (
              <button 
                type="button"
                className="hero-btn-primary" 
                onClick={handleOpenLicenseModal}
                id="hero-license-cta"
              >
                My License &amp; Downloads
              </button>
            ) : (
              <button 
                type="button"
                className="hero-btn-primary" 
                onClick={handleBuyNow}
                id="hero-purchase-cta"
              >
                Get Lifetime Access · ₹299
              </button>
            )}

            <a href="#demo" className="hero-btn-secondary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="6 3 20 12 6 21 6 3"></polygon>
              </svg>
              <span>Watch Demo</span>
            </a>
          </div>

          {/* Understated OS Compatibility & License Note */}
          <div className="hero-compatibility-strip">
            <div className="hero-compat-pill">
              <span className="compat-dot" aria-hidden="true"></span>
              <span>Windows Only · macOS in development</span>
            </div>
            <span className="compat-sep" aria-hidden="true">·</span>
            <span className="compat-ae">Adobe After Effects 2020–2025</span>
          </div>

          {/* Technical Specs Guarantee */}
          <div className="hero-spec-rail" aria-label="Core Technical Highlights">
            <div className="spec-unit">
              <span className="spec-num">100%</span>
              <span className="spec-desc">Native Vector Text Layers</span>
            </div>
            <div className="spec-unit">
              <span className="spec-num">0 ms</span>
              <span className="spec-desc">Cloud Latency · Local AI</span>
            </div>
            <div className="spec-unit">
              <span className="spec-num">2</span>
              <span className="spec-desc">Active Device Activations</span>
            </div>
          </div>
        </div>

        {/* =================================================================
            RIGHT COLUMN (~60%): Real 4-Style Video Showcase Carousel
            ================================================================= */}
        <div 
          className="hero-showcase-col"
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
        >
          {/* Main Video Presentation Display */}
          <div 
            className="video-stage-chassis"
            onClick={openExpandedModal}
            role="button"
            tabIndex={0}
            ref={expandTriggerRef}
            aria-label={`Previewing ${activeStyle.name}. Click to expand with audio.`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openExpandedModal();
              }
            }}
          >
            {/* Stage Top Bar: Real Style Details & Expand Affordance */}
            <div className="stage-hud-bar">
              <div className="stage-hud-identity">
                <span className="stage-pulse-dot" aria-hidden="true"></span>
                <span className="stage-style-title">{activeStyle.name}</span>
                <span className="stage-hud-meta">1080 × 1920 (9:16)</span>
              </div>
              <button 
                type="button" 
                className="stage-expand-pill" 
                onClick={(e) => {
                  e.stopPropagation();
                  openExpandedModal();
                }}
                aria-label={`Expand ${activeStyle.name} video with audio`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
                <span>Expand · Audio</span>
              </button>
            </div>

            {/* Video Viewport: Clean 9:16 Aspect Display */}
            <div className="stage-video-frame">
              <video
                ref={videoRef}
                key={activeStyle.id}
                src={activeStyle.videoSrc}
                poster={activeStyle.posterSrc}
                muted
                playsInline
                autoPlay
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                className="stage-video-element"
                aria-label={`Demonstration of ${activeStyle.name} in After Effects`}
              />

              {/* Hover Overlay Hint */}
              <div className="stage-click-hint" aria-hidden="true">
                <span className="hint-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6 3 20 12 6 21 6 3"></polygon>
                  </svg>
                  Click to play with sound
                </span>
              </div>
            </div>

            {/* Live Progress Indicator Line */}
            <div className="stage-progress-track" aria-hidden="true">
              <div 
                className="stage-progress-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Style Selector Rail & Carousel Controls */}
          <div className="hero-selector-panel">
            <div className="selector-tabs-header">
              <span className="tabs-header-label">CAPTION STYLES (4 REAL AE PREVIEWS)</span>
              
              {/* Accessible Pause / Resume Auto-Cycle Control */}
              <button
                type="button"
                className={`btn-cycle-toggle ${isAutoCycleEnabled ? 'active' : 'paused'}`}
                onClick={toggleAutoCycle}
                aria-label={isAutoCycleEnabled ? 'Pause automatic style carousel' : 'Resume automatic style carousel'}
                title={isAutoCycleEnabled ? 'Pause automatic carousel cycling' : 'Resume automatic carousel cycling'}
              >
                {isAutoCycleEnabled ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="4" width="4" height="16"></rect>
                      <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                    <span>Auto-cycle On</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="6 3 20 12 6 21 6 3"></polygon>
                    </svg>
                    <span>Paused</span>
                  </>
                )}
              </button>
            </div>

            {/* 4 Interactive Style Selection Tabs */}
            <div 
              className="style-tabs-grid" 
              role="tablist" 
              aria-label="Hero Caption Style Selection"
            >
              {HERO_STYLES.map((style, idx) => {
                const isActive = idx === activeStyleIndex;
                return (
                  <button
                    key={style.id}
                    role="tab"
                    id={`hero-tab-${style.id}`}
                    aria-selected={isActive}
                    aria-controls={`hero-panel-${style.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`style-tab-button ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleSelectStyle(idx)}
                  >
                    <div className="tab-indicator-bar" aria-hidden="true">
                      {isActive && (
                        <div 
                          className="tab-progress-indicator" 
                          style={{ width: isAutoCycleEnabled ? `${progressPercent}%` : '100%' }}
                        ></div>
                      )}
                    </div>
                    <div className="tab-content">
                      <div className="tab-header-mini">
                        <span className="tab-name">{style.name}</span>
                        {style.id === 'devin-style' && (
                          <span className="tab-featured-badge">Featured</span>
                        )}
                      </div>
                      <span className="tab-kicker">{style.kicker}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================
          EXPANDED VIDEO MODAL: Full Size, Native Controls, Sound Enabled
          ================================================================= */}
      {isExpandedModalOpen && (
        <div 
          className="expanded-modal-backdrop"
          onClick={closeExpandedModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-style-title"
        >
          <div 
            className="expanded-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="expanded-modal-header">
              <div className="modal-title-group">
                <span className="modal-ae-badge">Ae</span>
                <div>
                  <h3 id="modal-style-title" className="modal-style-name">
                    {activeStyle.name}
                  </h3>
                  <p className="modal-style-tagline">{activeStyle.tagline}</p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeExpandedModal}
                aria-label="Close expanded video preview"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Video Frame with Native Browser Controls & Sound */}
            <div className="expanded-video-wrapper">
              <video
                ref={modalVideoRef}
                key={activeStyle.id}
                src={activeStyle.videoSrc}
                poster={activeStyle.posterSrc}
                controls
                autoPlay
                playsInline
                className="expanded-video-player"
              />
            </div>

            {/* Modal Footer with Style Switcher & Fast Checkout */}
            <div className="expanded-modal-footer">
              <div className="modal-footer-switcher">
                <span className="modal-switcher-label">Switch Style:</span>
                <div className="modal-mini-tabs">
                  {HERO_STYLES.map((style, idx) => (
                    <button
                      key={style.id}
                      type="button"
                      className={`modal-mini-tab ${idx === activeStyleIndex ? 'active' : ''}`}
                      onClick={() => handleSelectStyle(idx)}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-footer-action">
                <button
                  type="button"
                  className="modal-buy-btn"
                  onClick={() => {
                    closeExpandedModal();
                    handleBuyNow();
                  }}
                >
                  Get Lifetime Access · ₹299
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
