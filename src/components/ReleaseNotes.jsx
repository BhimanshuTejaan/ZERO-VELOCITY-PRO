import React from 'react';
import './ReleaseNotes.css';

const releases = [
  {
    version: 'v1.0',
    status: 'Current Version',
    isCurrent: true,
    tag: 'Latest Release',
    features: [
      'Initial public release',
      'One-word captions',
      'Hero & Accent words',
      'Live preview',
      'Secure licensing'
    ]
  },
  {
    version: 'v1.1',
    status: 'Coming Soon',
    isCurrent: false,
    tag: 'Next Update',
    features: [
      'New caption layouts',
      'Additional animation presets',
      'Performance improvements'
    ]
  },
  {
    version: 'v1.2',
    status: 'Coming Soon',
    isCurrent: false,
    tag: 'Planned',
    features: [
      'More customization',
      'Better workflow',
      'Quality of life improvements'
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
            Release Notes
          </div>
          <h2 className="section-title">It keeps getting better.</h2>
          <p className="section-subtitle">
            Every update is included with your purchase. Buy once and receive all Version 1.x updates for free.
          </p>
        </div>

        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          <div className="timeline-list">
            {releases.map((rel, index) => (
              <div 
                key={rel.version} 
                className={`timeline-item ${rel.isCurrent ? 'is-current' : 'is-upcoming'}`}
              >
                {/* Timeline node marker */}
                <div className="timeline-node">
                  <div className="node-dot"></div>
                </div>

                {/* Release Card */}
                <div className="timeline-card glass-panel">
                  <div className="card-header">
                    <div className="version-info">
                      <span className="version-number">{rel.version}</span>
                      <span className={`version-status-pill ${rel.isCurrent ? 'pill-active' : 'pill-soon'}`}>
                        {rel.status}
                      </span>
                    </div>
                    <span className="version-tag">{rel.tag}</span>
                  </div>

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
