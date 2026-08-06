import React from 'react';
import './ReleaseNotes.css';

const releases = [
  {
    version: 'v1.0',
    date: 'August 2026',
    status: 'Released',
    badgeType: 'released',
    isCurrent: true,
    tagline: 'Initial Public Release & Licensing Engine',
    features: [
      'One-word animated caption engine',
      'Hero & Accent word styling controls',
      'Real-time live panel preview',
      'Hardware-locked Ed25519 signature security',
      'High-speed After Effects script integration',
      'Auto-composition detection & layer sync'
    ]
  },
  {
    version: 'v1.1',
    date: 'September 2026',
    status: 'In Development',
    badgeType: 'development',
    isCurrent: false,
    tagline: 'Presets, Color Samplers & Animations',
    features: [
      'Hero Color Picker (sample hex codes directly in panel)',
      '1-Click Animation Presets (bounce, pop, slide, fade)',
      'Built-in local SRT Audio Generator',
      'Saved Custom Presets & Layouts manager',
      'System Font Selection browser',
      'Shorts, Reels & TikTok optimized layout templates',
      'Liquid Glass & Liquid Color text styles',
      'Panel UI & rendering speed optimizations'
    ]
  },
  {
    version: 'v1.2',
    date: 'Q4 2026',
    status: 'Planned',
    badgeType: 'planned',
    isCurrent: false,
    tagline: 'AI Workflows & Multi-Comp Batch Processing',
    features: [
      'AI-assisted intelligent emphasis word highlighting',
      'Multi-line & stacked subtitle layout modes',
      'Batch captioning across multiple compositions',
      'Custom expression engine integrations',
      'Keyboard shortcuts & workflow accelerators',
      'Expanded Mac OS & Premiere Pro optimizations'
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
