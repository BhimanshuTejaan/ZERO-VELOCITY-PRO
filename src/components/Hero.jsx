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
    videoSrc: '/previews/devin-style.mp4',
    posterSrc: '/previews/devin-style-poster.jpg',
  },
  {
    id: 'balanced-style',
    name: 'Balanced Style',
    kicker: 'Podcast & Narrative',
    tagline: 'Mixed Serif Italic & Sans',
    videoSrc: '/previews/balanced-style.mp4',
    posterSrc: '/previews/balanced-style-poster.jpg',
  },
  {
    id: 'clean-caption',
    name: 'Clean Caption',
    kicker: 'Minimalist Talking Head',
    tagline: 'Refined Centered Subtitles',
    videoSrc: '/previews/clean-caption.mp4',
    posterSrc: '/previews/clean-caption-poster.jpg',
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    kicker: 'Executive & Brand',
    tagline: 'Authoritative Uppercase Titling',
    videoSrc: '/previews/corporate-clean.mp4',
    posterSrc: '/previews/corporate-clean-poster.jpg',
  },
];

export default function Hero() {
  const { currentUser, loginWithGoogle, isSoleAdmin, hasActiveLicense } = useAuth();

  // Orbital state
  const [orbitAngle, setOrbitAngle] = useState(0); // in degrees
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [pinnedIndex, setPinnedIndex] = useState(0); // Devin Style featured initially
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);
  const unhoverTimerRef = useRef(null);
  const videoRefs = useRef([]);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setIsReducedMotion(motionQuery.matches);

      const handleChange = (e) => setIsReducedMotion(e.matches);
      motionQuery.addEventListener('change', handleChange);
      return () => motionQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Continuous gentle orbital loop when resting (not hovered, not pinned, motion allowed)
  useEffect(() => {
    // If user has pinned a card or prefers reduced motion or is hovering, freeze orbit
    if (pinnedIndex !== null || isHovered || isReducedMotion) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    const speedDegPerSec = 10; // Slow, cinematic 36-second full orbit

    const animateOrbit = (time) => {
      if (lastTimeRef.current !== null) {
        const deltaSec = (time - lastTimeRef.current) / 1000;
        setOrbitAngle((prev) => (prev + speedDegPerSec * deltaSec) % 360);
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(animateOrbit);
    };

    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(animateOrbit);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [pinnedIndex, isHovered, isReducedMotion]);

  // Determine which card is currently active/featured
  const activeIndex = pinnedIndex !== null 
    ? pinnedIndex 
    : hoveredIndex !== null 
      ? hoveredIndex 
      : 0; // Devin Style default

  const activeStyle = HERO_STYLES[activeIndex];

  // Hover handlers
  const handleCardMouseEnter = (index) => {
    if (unhoverTimerRef.current) {
      clearTimeout(unhoverTimerRef.current);
      unhoverTimerRef.current = null;
    }
    setIsHovered(true);
    setHoveredIndex(index);
  };

  const handleCardMouseLeave = () => {
    setIsHovered(false);
    unhoverTimerRef.current = setTimeout(() => {
      setHoveredIndex(null);
    }, 450);
  };

  // Click handler: pins or toggles active style within hero (never opens modal)
  const handleCardClick = (index) => {
    if (pinnedIndex === index) {
      // Toggle unpin to resume free orbit
      setPinnedIndex(null);
      setHoveredIndex(index);
    } else {
      // Pin this card in front
      setPinnedIndex(index);
      setHoveredIndex(index);
    }
  };

  // Resume orbit button handler
  const handleResumeOrbit = () => {
    setPinnedIndex(null);
    setHoveredIndex(null);
    setIsHovered(false);
  };

  // Synchronize muted video playback safely
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      video.muted = true;
      video.playsInline = true;

      // When pinned/hovered, prioritize active video playback
      if (idx === activeIndex) {
        video.play().catch(() => {});
      }
    });
  }, [activeIndex]);

  // Handle visibility change (pause videos when tab hidden)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        videoRefs.current.forEach((v) => v && v.pause());
      } else {
        const activeVideo = videoRefs.current[activeIndex];
        if (activeVideo) activeVideo.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [activeIndex]);

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

  /**
   * Compute 3D orbital transform for card i
   * If a card is pinned or hovered, cards arrange into a focused stage layout:
   *  - Active card is front-and-center (X:0, Z:+120px, Scale: 1.05, RotY: 0deg)
   *  - Other cards flank it naturally in 3D perspective
   * If in resting orbit:
   *  - Cards move along continuous ellipse
   */
  const computeCardStyle = useCallback((index) => {
    const isFocusedState = pinnedIndex !== null || (isHovered && hoveredIndex !== null);

    if (isFocusedState) {
      // Relative offset from active card: 0 = active, 1 = right, 2 = back, 3 = left
      const offset = (index - activeIndex + 4) % 4;

      if (offset === 0) {
        // Active Hero Card (Front and Center)
        return {
          transform: 'translate3d(0, 0, 110px) scale(1.05) rotateY(0deg)',
          zIndex: 400,
          opacity: 1,
          filter: 'brightness(1)',
        };
      } else if (offset === 1) {
        // Flanking Right
        return {
          transform: 'translate3d(180px, 0, -30px) scale(0.84) rotateY(-12deg)',
          zIndex: 200,
          opacity: 0.65,
          filter: 'brightness(0.75)',
        };
      } else if (offset === 2) {
        // Deep Back
        return {
          transform: 'translate3d(0, -10px, -90px) scale(0.74) rotateY(0deg)',
          zIndex: 100,
          opacity: 0.45,
          filter: 'brightness(0.6)',
        };
      } else {
        // Flanking Left (offset === 3)
        return {
          transform: 'translate3d(-180px, 0, -30px) scale(0.84) rotateY(12deg)',
          zIndex: 200,
          opacity: 0.65,
          filter: 'brightness(0.75)',
        };
      }
    }

    // Resting Continuous 3D Orbit
    // Each card is 90 deg apart
    const cardAngleDeg = (orbitAngle + index * 90) % 360;
    const rad = (cardAngleDeg * Math.PI) / 180;

    const radiusX = 185; // px horizontal reach
    const radiusZ = 95;  // px depth reach

    const x = Math.sin(rad) * radiusX;
    const z = Math.cos(rad) * radiusZ;
    const cosVal = Math.cos(rad); // -1 (back) to +1 (front)

    // Gentle scale from 0.82 to 1.0
    const scale = 0.82 + 0.18 * ((cosVal + 1) / 2);
    // Upright subtle perspective tilt: max 10 deg (never extreme, highly readable)
    const rotY = -Math.sin(rad) * 10;
    // Layering z-index based on depth
    const zIndex = Math.round(150 + 150 * cosVal);
    // Subtle depth opacity
    const opacity = 0.62 + 0.38 * ((cosVal + 1) / 2);

    return {
      transform: `translate3d(${x.toFixed(1)}px, 0, ${z.toFixed(1)}px) scale(${scale.toFixed(3)}) rotateY(${rotY.toFixed(1)}deg)`,
      zIndex,
      opacity,
      filter: cosVal > 0.4 ? 'brightness(1)' : 'brightness(0.75)',
    };
  }, [pinnedIndex, isHovered, hoveredIndex, activeIndex, orbitAngle]);

  return (
    <section className="hero-minimalist" id="hero" aria-label="Zero Velocity Overview">
      {/* Subtle ambient lighting */}
      <div className="hero-atmosphere" aria-hidden="true">
        <div className="hero-glow-soft"></div>
      </div>

      <div className="container hero-layout-container">
        {/* =================================================================
            LEFT COLUMN (~42%): Confident Editorial Lead & One-Click Message
            ================================================================= */}
        <div className="hero-editorial-col">
          <div className="hero-tag-kicker">
            <span className="kicker-lead">ZERO VELOCITY 1.2</span>
            <span className="kicker-sep">/</span>
            <span className="kicker-sub">NATIVE AFTER EFFECTS CAPTION ENGINE</span>
          </div>

          <h1 className="hero-title">
            Captions, finished in one click.
          </h1>

          <p className="hero-lede">
            Turn speech into styled, animated, editable captions directly inside Adobe After Effects. 
            Real native vector text layers with frame-accurate sync and zero monthly subscriptions.
          </p>

          {/* Central One-Click Workflow Sequence (Typographic, not bulky cards) */}
          <div className="hero-one-click-sequence" aria-label="One-click workflow progression">
            <span className="seq-step seq-highlight">ONE CLICK</span>
            <span className="seq-arrow" aria-hidden="true">→</span>
            <span className="seq-step">STYLED CAPTIONS</span>
            <span className="seq-arrow" aria-hidden="true">→</span>
            <span className="seq-step">EDITABLE AE LAYERS</span>
          </div>

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
            RIGHT COLUMN (~58%): Four-Video 3D Orbit Stage
            ================================================================= */}
        <div className="hero-orbit-col" aria-label="Interactive 3D caption style showcase">
          {/* Active Style HUD Pill Indicator */}
          <div className="orbit-hud-header">
            <div className="orbit-active-badge">
              <span className="orbit-live-dot" aria-hidden="true"></span>
              <span className="orbit-active-name">{activeStyle.name}</span>
              <span className="orbit-meta-divider" aria-hidden="true">·</span>
              <span className="orbit-one-click-tag">Generated in 1 Click</span>
            </div>

            {pinnedIndex !== null && !isReducedMotion && (
              <button
                type="button"
                className="orbit-resume-btn"
                onClick={handleResumeOrbit}
                aria-label="Resume continuous 3D orbit"
                title="Resume orbital motion"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                <span>Resume Orbit</span>
              </button>
            )}
          </div>

          {/* 3D Orbit Stage Canvas */}
          <div 
            className="orbit-stage-viewport"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="orbit-stage-3d">
              {HERO_STYLES.map((style, idx) => {
                const isCardActive = idx === activeIndex;
                const isCardPinned = idx === pinnedIndex;
                const dynamicTransform = computeCardStyle(idx);

                return (
                  <div
                    key={style.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${style.name} preview. ${isCardPinned ? 'Pinned in place.' : 'Click to inspect.'}`}
                    className={`orbit-card ${isCardActive ? 'is-active' : ''} ${isCardPinned ? 'is-pinned' : ''}`}
                    style={dynamicTransform}
                    onMouseEnter={() => handleCardMouseEnter(idx)}
                    onClick={() => handleCardClick(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(idx);
                      }
                    }}
                  >
                    {/* Seamless 9:16 Portrait Video Frame */}
                    <div className="orbit-card-media">
                      <video
                        ref={(el) => (videoRefs.current[idx] = el)}
                        src={style.videoSrc}
                        poster={style.posterSrc}
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                        className="orbit-video-element"
                        aria-label={`${style.name} caption demonstration`}
                      />

                      {/* Card Overlay Label (Minimalist, readable) */}
                      <div className="orbit-card-pill">
                        <span className="card-pill-title">{style.name}</span>
                        {style.id === 'devin-style' && (
                          <span className="card-pill-tag">Featured</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Style Selector Strip for Direct Touch & Accessibility */}
          <div className="orbit-selector-rail" role="tablist" aria-label="Select caption style">
            {HERO_STYLES.map((style, idx) => {
              const isSelected = idx === activeIndex;
              return (
                <button
                  key={style.id}
                  role="tab"
                  id={`orbit-tab-${style.id}`}
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  className={`orbit-selector-tab ${isSelected ? 'active' : ''}`}
                  onClick={() => handleCardClick(idx)}
                >
                  <span className="tab-dot" aria-hidden="true"></span>
                  <span className="tab-label">{style.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
