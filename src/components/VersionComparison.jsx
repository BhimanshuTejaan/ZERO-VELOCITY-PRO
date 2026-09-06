import React from 'react';
import './VersionComparison.css';

export default function VersionComparison() {
  const transformations = [
    {
      id: 1,
      v10: 'Basic caption layouts',
      v12: 'Complete caption-production workflow',
      detail: 'From raw speech audio to finished, styled AE comp layers in one unified pipeline.'
    },
    {
      id: 2,
      v10: 'Limited styling',
      v12: '6 customizable caption styles',
      detail: 'Purpose-built kinetic stacks, editorial cards, pills, and typography hierarchies.'
    },
    {
      id: 3,
      v10: 'Static caption generation',
      v12: '10 animations plus synchronized sound',
      detail: 'Word and line motion curves paired with 5 built-in SFX cues aligned to keyframes.'
    },
    {
      id: 4,
      v10: 'External correction workflow',
      v12: 'Transcribe and edit directly in the panel',
      detail: 'Correct typos, balance blocks, and assign Support, Hero, and Accent role tags before generation.'
    }
  ];

  return (
    <section className="comparison-section" id="comparison">
      <div className="container">
        {/* Section Header */}
        <div className="comparison-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>Evolution of Zero Velocity</span>
          </div>
          <h2 className="section-title">
            Version 1.0 vs Version 1.2.<br />
            <span className="text-gradient-accent">A Complete Workflow Transformation.</span>
          </h2>
          <p className="section-subtitle">
            Zero Velocity has evolved from a basic subtitle tool into a full After Effects caption studio.
          </p>
        </div>

        {/* 4 Customer-Readable Transformation Cards */}
        <div className="transformation-grid">
          {transformations.map((t) => (
            <div key={t.id} className="transformation-card panel-matte-elevated">
              <div className="transformation-step-badge">0{t.id}</div>
              <div className="transformation-compare">
                <div className="compare-v10">
                  <span className="v10-tag">Version 1.0</span>
                  <span className="v10-text">{t.v10}</span>
                </div>
                <div className="compare-arrow">→</div>
                <div className="compare-v12">
                  <span className="v12-tag">Version 1.2</span>
                  <span className="v12-text">{t.v12}</span>
                </div>
              </div>
              <p className="transformation-detail">{t.detail}</p>
            </div>
          ))}
        </div>

        {/* Summary Card Below */}
        <div className="comparison-summary-card">
          <p className="summary-statement">
            "Version 1.2 takes captions from raw audio to styled, animated, editable AE layers in one workflow."
          </p>
          <div className="summary-upgrade-row">
            <span className="summary-check">✓</span>
            <span>Free update for all existing license holders • ₹99 lifetime access for new users</span>
          </div>
        </div>
      </div>
    </section>
  );
}
