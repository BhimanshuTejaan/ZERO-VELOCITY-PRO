import React from 'react';
import './Reviews.css';

const WORKFLOW_PILLARS = [
  {
    tag: 'NATIVE AE LAYERS',
    badge: 'Timeline Control',
    title: '100% Editable Text Layers',
    summary: 'Zero Velocity creates genuine After Effects text layers and keyframes in your active composition—never baked video exports. Apply native glow, motion blur, adjust tracking, or retime keyframes anytime.'
  },
  {
    tag: 'LOCAL CREATOR DIALECT',
    badge: 'Indian Speech',
    title: 'Roman Hinglish & English Engine',
    summary: 'Built specifically for bilingual creators. Understands casual Indian speech and transcribes spoken Hindi into clean Roman captions (Hindi bolo, Roman captions pao) without awkward script conversion.'
  },
  {
    tag: 'PERPETUAL OWNERSHIP',
    badge: 'No Lock-in',
    title: 'Zero Monthly Cloud Credits',
    summary: 'No monthly subscriptions, no export minute limits, and no server queues. One simple license gives you perpetual desktop access across 2 devices with all Version 1.x updates included free.'
  }
];

export default function Reviews() {
  return (
    <section id="reviews" className="reviews section-padding">
      <div className="container">
        <div className="reviews-card glass-panel">
          <div className="reviews-header text-center">
            <div className="reviews-badge">
              <span className="keyframe-diamond"></span>
              <span>CREATOR WORKFLOW ADVANTAGES</span>
            </div>

            <h2 className="reviews-title">Engineered for Video Editors</h2>
            <p className="reviews-subtitle">
              Designed from the ground up to solve caption formatting bottlenecks without cloud subscriptions or export limits.
            </p>
          </div>

          <div className="workflow-pillars-grid">
            {WORKFLOW_PILLARS.map((pillar, index) => (
              <div key={index} className="pillar-card">
                <div className="pillar-header">
                  <span className="pillar-tag">{pillar.tag}</span>
                  <span className="pillar-badge">{pillar.badge}</span>
                </div>

                <h3 className="pillar-title">{pillar.title}</h3>
                <p className="pillar-summary">{pillar.summary}</p>
              </div>
            ))}
          </div>

          <div className="reviews-community-banner">
            <div className="rc-left">
              <span className="rc-icon">💬</span>
              <div className="rc-text">
                <strong>Have feedback, suggestions, or need custom workflow help?</strong>
                <span>Reach our dedicated support team at <strong>support@zerovelocitycaptions.com</strong> or message on Instagram for rapid assistance.</span>
              </div>
            </div>
            <div className="rc-actions">
              <a
                href="mailto:support@zerovelocitycaptions.com"
                className="btn btn-primary rc-btn"
                title="Official Support Email"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22 6 12 13 2 6"></polyline>
                </svg>
                <span>Email Support</span>
                <span>&rarr;</span>
              </a>
              <a
                href="https://www.instagram.com/zero.velocity.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary rc-btn"
              >
                <span>DM @zero.velocity.ai</span>
                <span>&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
