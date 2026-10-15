import React, { useState } from 'react';
import './VideoBreakdown.css';

const YOUTUBE_VIDEO_ID = 'pxf3k0pU-oE';
const YOUTUBE_WATCH_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`;
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`;
const YOUTUBE_THUMBNAIL_URL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;
const YOUTUBE_FALLBACK_THUMBNAIL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`;

const CAPABILITY_PILLARS = [
  {
    number: '01',
    title: '100% Native Timeline Layers',
    badge: 'Vector Keyframes',
    text: 'Zero Velocity outputs genuine Adobe After Effects text layers and shape elements—never baked, flat video exports. Retain complete creative freedom: apply native motion blur, deep glow, adjust kerning, or retime keyframes anytime.'
  },
  {
    number: '02',
    title: 'Private On-Device AI Engine',
    badge: 'Zero Cloud Fees',
    text: 'Speech recognition runs entirely on your local machine using an optimized Whisper pipeline. Supports both English and casual Roman Hinglish. Complete audio privacy with zero server queues and zero monthly token costs.'
  },
  {
    number: '03',
    title: 'Motion Presets & Sound Sync',
    badge: '10 Presets · 5 SFX',
    text: 'Select from 10 entrance animations with calibrated bezier easing graph curves targeting Words or Lines. Automatically attaches 5 built-in SFX audio cues (pops, clicks, whooshes, snaps) directly to keyframe impact points.'
  },
  {
    number: '04',
    title: 'Perpetual Commercial Rights',
    badge: '2 Workstations · No Subscriptions',
    text: 'One honest payment of ₹299 gives you lifetime studio access across 2 personal devices (desktop and laptop). All Version 1.x feature releases and compatibility updates are included free forever.'
  }
];

export default function VideoBreakdown() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(YOUTUBE_THUMBNAIL_URL);

  const handleStartPlay = () => {
    setIsPlaying(true);
  };

  const handleThumbError = () => {
    if (thumbSrc !== YOUTUBE_FALLBACK_THUMBNAIL) {
      setThumbSrc(YOUTUBE_FALLBACK_THUMBNAIL);
    }
  };

  return (
    <section id="demo" className="video-breakdown-section">
      <div className="container">
        {/* Section Header */}
        <div className="demo-header text-center">
          <div className="demo-eyebrow">
            <span className="demo-dot" aria-hidden="true"></span>
            <span>PRODUCT DEMONSTRATION</span>
          </div>
          <h2 className="demo-title">
            See Zero Velocity<br />
            <span className="demo-title-accent">in Action.</span>
          </h2>
          <p className="demo-subtitle">
            Watch the complete v1.2 breakdown showing real caption generation directly inside Adobe After Effects.
          </p>
        </div>

        {/* Video Theatre Stage */}
        <div className="demo-theatre-frame">
          <div className="theatre-topbar">
            <div className="theatre-dots" aria-hidden="true">
              <span className="t-dot close"></span>
              <span className="t-dot min"></span>
              <span className="t-dot max"></span>
            </div>
            <div className="theatre-title-bar">
              <span className="theatre-app-pill">Ae</span>
              <span className="theatre-title-text">Zero Velocity v1.2 · Feature Breakdown &amp; Workflow</span>
            </div>
            <a
              href={YOUTUBE_WATCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="theatre-ext-link"
              title="Open video on YouTube in a new tab"
            >
              <span>Watch on YouTube</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>

          <div className="video-viewport">
            {isPlaying ? (
              <div className="iframe-aspect-container">
                <iframe
                  src={YOUTUBE_EMBED_URL}
                  title="Zero Velocity v1.2 Full Feature Breakdown"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="video-iframe"
                />
              </div>
            ) : (
              <div
                className="thumbnail-stage"
                onClick={handleStartPlay}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStartPlay();
                  }
                }}
                aria-label="Play Zero Velocity v1.2 Feature Breakdown video"
              >
                <img
                  src={thumbSrc}
                  alt="Zero Velocity v1.2 Video Breakdown Preview"
                  className="video-poster"
                  onError={handleThumbError}
                  loading="lazy"
                />
                <div className="poster-scrim" aria-hidden="true"></div>

                <div className="play-trigger-btn">
                  <div className="play-pulse-ring" aria-hidden="true"></div>
                  <div className="play-core-circle">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>

                <div className="poster-caption-tag">
                  <span>Click to watch 1080p feature walkthrough (3 mins)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editorial Capability Hierarchy (Restrained Typographic Rows, No Card Clutter) */}
        <div className="capabilities-hierarchy" aria-label="Core Technical Capabilities">
          <div className="cap-hierarchy-header">
            <span className="cap-hierarchy-eyebrow">BUILT FOR SPEED &amp; RETENTION</span>
            <h3 className="cap-hierarchy-title">Why Editors Choose Zero Velocity</h3>
          </div>

          <div className="cap-pillars-list">
            {CAPABILITY_PILLARS.map((pillar) => (
              <div key={pillar.number} className="cap-pillar-row">
                <div className="pillar-num-col">
                  <span className="pillar-num">{pillar.number}</span>
                </div>
                <div className="pillar-content-col">
                  <div className="pillar-title-wrap">
                    <h4 className="pillar-title">{pillar.title}</h4>
                    <span className="pillar-badge">{pillar.badge}</span>
                  </div>
                  <p className="pillar-text">{pillar.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
