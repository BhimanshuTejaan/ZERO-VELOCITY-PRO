import React from 'react';
import './ReleaseNotes.css';

const releases = [
  {
    version: 'v1.0',
    date: 'August 2026',
    status: 'Released',
    badgeType: 'released',
    isCurrent: true,
    tagline: 'Initial Public Release',
    features: [
      'One-word animated captions',
      'Hero & Accent word styling controls',
      'Real-time live panel preview',
      'Automatic layer organization',
      'Instant composition alignment',
      'Seamless After Effects workflow'
    ]
  },
  {
    version: 'v1.1',
    date: 'September 2026',
    status: 'In Development',
    badgeType: 'development',
    isCurrent: false,
    tagline: 'Presets, Animations & Speed Enhancements',
    features: [
      '1-Click Animation Presets (bounce, pop, slide, fade)',
      'Hero Color Picker (sample colors directly from video)',
      'Saved Custom Presets & Style Templates',
      'Shorts, Reels & TikTok layout templates',
      'System Font Selection browser',
      'Faster rendering & playback performance',
      'Cleaner animation workflow & custom controls',
      'Built-in audio transcription helper'
    ]
  },
  {
    version: 'v1.2',
    date: 'Q4 2026',
    status: 'Planned',
    badgeType: 'planned',
    isCurrent: false,
    tagline: 'AI Highlights & Multi-Timeline Workflow',
    features: [
      'Smart AI key-word highlighting',
      'Multi-line & stacked subtitle layout options',
      'Batch caption creation across multiple sequences',
      'Keyboard shortcuts & editing speed controls',
      'Expanded Mac & Premiere Pro workflow tools',
      'Lifetime updates for all v1.x releases'
    ]
  }
];

export default function ReleaseNotes() {
  return (
    <section id="release-notes" className="release-notes section-padding">
      <div className="container">
        <div className="section-header text-center">
          <div className="release-badge">
            <span className="badge-pulse"></span>
            Release Notes & Roadmap
          </div>
          <h2 className="section-title">It keeps shipping.</h2>
          <p className="section-subtitle">
            Every update lands in your panel automatically, free for life. Buy once and receive all Version 1.x updates for free.
          </p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          <div className="timeline-list">
            {releases.map((rel) => (
              <div 
                key={rel.version} 
                className={`timeline-item ${rel.isCurrent ? 'is-current' : ''}`}
              >
                {/* Node Marker on Line */}
                <div className="timeline-node">
                  <div className="node-dot"></div>
                </div>

                {/* Card Panel */}
                <div className="timeline-card glass-panel">
                  <div className="card-header">
                    <div className="version-info">
                      <span className="version-number">{rel.version}</span>
                      <span className={`version-status-pill pill-${rel.badgeType}`}>
                        {rel.status}
                      </span>
                    </div>
                    <span className="version-date">{rel.date}</span>
                  </div>

                  <h3 className="card-tagline">{rel.tagline}</h3>

                  <ul className="feature-list">
                    {rel.features.map((feat, idx) => (
                      <li key={idx} className="feature-item">
                        <svg className="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
