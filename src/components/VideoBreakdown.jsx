import React, { useState } from 'react';
import './VideoBreakdown.css';

const YOUTUBE_VIDEO_ID = 'pxf3k0pU-oE';
const YOUTUBE_WATCH_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`;
const YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`;
const YOUTUBE_THUMBNAIL_URL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`;
const YOUTUBE_FALLBACK_THUMBNAIL = `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`;

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
    <section id="demo" className="video-breakdown-section section-padding">
      <div className="container">
        {/* Section Header with exact requested copy */}
        <div className="video-header text-center">
          <div className="video-badge">
            <span className="video-badge-dot"></span>
            <span>FEATURE OVERVIEW</span>
          </div>
          <h2 className="section-title">See Every Feature in Action</h2>
          <p className="section-subtitle">
            Watch the complete Zero Velocity v1.2 breakdown.
          </p>
        </div>

        {/* Video Theatre Workstation */}
        <div className="video-theatre panel-matte-elevated glass-panel">
          <div className="theatre-topbar">
            <div className="theatre-dots">
              <span className="t-dot close"></span>
              <span className="t-dot min"></span>
              <span className="t-dot max"></span>
            </div>
            <div className="theatre-title-bar">
              <span className="theatre-app-pill">Ae</span>
              <span className="theatre-title-text">Zero Velocity v1.2 · Complete Feature Breakdown</span>
            </div>
            <a
              href={YOUTUBE_WATCH_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="theatre-ext-link"
              title="Open video on YouTube in a new tab"
            >
              <span>Open on YouTube</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>

          {/* Interactive Player / Thumbnail Frame */}
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
                aria-label="Play Zero Velocity v1.2 Full Feature Breakdown video"
              >
                <img
                  src={thumbSrc}
                  alt="Zero Velocity v1.2 Feature Breakdown Video Thumbnail"
                  className="video-poster"
                  onError={handleThumbError}
                  loading="lazy"
                />
                <div className="poster-scrim"></div>

                {/* Center Play Button Overlay */}
                <div className="play-trigger-ring">
                  <div className="play-pulse-circle"></div>
                  <div className="play-icon-box">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6 3 20 12 6 21 6 3"></polygon>
                    </svg>
                  </div>
                  <span className="play-label">Click to Play Demo</span>
                </div>

                {/* Duration / Quality Badges */}
                <div className="video-meta-overlay">
                  <span className="meta-badge-quality">1080p Full HD</span>
                  <span className="meta-badge-version">v1.2 Release</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="theatre-footer">
            <div className="theatre-footer-info">
              <span className="footer-lead-text">Watch the full step-by-step breakdown on YouTube with timestamp chapters.</span>
            </div>

            <div className="theatre-footer-actions">
              <a
                href={YOUTUBE_WATCH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary video-cta-btn"
                title="Watch Full Breakdown on YouTube"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>Watch Full Breakdown</span>
                <span className="btn-arrow" aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
