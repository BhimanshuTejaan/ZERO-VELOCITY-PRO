import React from 'react';
import './ReleaseNotes.css';

const releases = [
  {
    version: 'v1.0',
    date: 'August 2026',
    status: 'RELEASED',
    badgeType: 'released',
    isCurrent: false,
    tagline: 'Core Foundation',
    features: [
      'SRT File Import & Timed Parsing',
      'Balanced Layout & Corporate Clean styles',
      'Hero & Accent word styling controls',
      'Edit Words interactive editor',
      'Vertical Spacing & Hero Size Ratio controls',
      'Composition caption rendering engine'
    ]
  },
  {
    version: 'v1.1',
    date: 'AVAILABLE NOW',
    status: 'CURRENT',
    badgeType: 'released',
    isCurrent: true,
    tagline: 'One-Click Auto Transcribe & Full Customization',
    features: [
      'One-Click Built-in Auto Transcribe',
      'English & Hinglish transcription support ("Built for Indian creators")',
      'Font selection & recommended font pairs',
      'Custom Hero & Accent color pickers',
      'Improved accurate in-plugin preview engine',
      'Panel UI polish & font availability detection'
    ]
  },
  {
    version: 'FUTURE',
    date: 'Coming Later',
    status: 'IN DEVELOPMENT',
    badgeType: 'development',
    isCurrent: false,
    tagline: 'More Animation & Custom Styles',
    features: [
      'Motion Animation Controls (Fade, Pop, Up, Down, Left, Right)',
      'Expanded social media caption layout templates',
      'Create Your Own Style (Reuse your design language across captions)',
      'Advanced multi-sequence batching & editing workflows'
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
