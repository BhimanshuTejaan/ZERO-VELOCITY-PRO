import React from 'react';
import './ReleaseNotes.css';

const releases = [
  {
    version: 'v1.0',
    date: 'August 2026',
    status: 'RELEASED',
    badgeType: 'released',
    isCurrent: false,
    tagline: 'Initial Core Foundation',
    features: [
      'SRT File Import & Timed Parsing',
      'Balanced Layout & Corporate Clean styles',
      'Hero & Accent word styling controls',
      'Vertical Spacing & Size Ratio controls',
      'Composition caption rendering engine'
    ]
  },
  {
    version: 'v1.1',
    date: 'September 2026',
    status: 'RELEASED',
    badgeType: 'released',
    isCurrent: false,
    tagline: 'Speech Transcription & Font Engine',
    features: [
      'One-Click Built-in Speech Transcription',
      'English & Hinglish speech transcription support',
      'Font pairing & character case selection',
      'Custom Hero & Accent color pickers',
      'Panel UI refinement and font detection'
    ]
  },
  {
    version: 'v1.2',
    date: 'MAJOR RELEASE',
    status: 'CURRENT',
    badgeType: 'released',
    isCurrent: true,
    tagline: 'Complete Caption Production Suite',
    features: [
      '6 Signature Native AE Styles (Balanced, Corporate, Progressive, Simple, Pill, Devin)',
      '10 Entrance Motion Presets with Bezier graph editor easing curves',
      '5 Built-in Sound Design SFX with keyframe-locked audio timeline markers',
      'In-Plugin Caption Workbench (Live typo fix, word adding, and role assignment)',
      'Deep Styling Controls (Multi-role font pairing, ALL CAPS, word pacing 1-6, size levels)',
      'Local-First Offline Architecture (Zero cloud footage uploads)'
    ]
  },
  {
    version: 'v1.3',
    date: 'IN PIPELINE',
    status: 'NEXT UP',
    badgeType: 'development',
    isCurrent: false,
    tagline: 'macOS Build & Batch Workflows',
    features: [
      'macOS CEP Extension (Apple Silicon M1/M2/M3/M4 & Intel)',
      'Batch sequence auto-captioning across multiple comp tabs',
      'Custom style preset save & export engine'
    ]
  }
];

export default function ReleaseNotes() {
  return (
    <section id="changelog" className="release-notes section-padding">
      <div className="container">
        <div className="section-header text-center">
          <div className="release-badge">
            <span className="badge-pulse"></span>
            Version History &amp; Roadmap
          </div>
          <h2 className="section-title">Built for the Long Run</h2>
          <p className="section-subtitle">
            Zero Velocity is actively maintained and continuously updated. Pay once today for ₹99 and receive every Version 1.x release and feature addition completely free.
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
