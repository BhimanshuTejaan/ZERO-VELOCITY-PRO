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
                <span>Direct message the core developer on Instagram for fast assistance and direct priority requests.</span>
              </div>
            </div>
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
    </section>
  );
}
