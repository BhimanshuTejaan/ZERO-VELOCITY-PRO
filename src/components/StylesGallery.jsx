import React from 'react';
import './StylesGallery.css';

export default function StylesGallery() {
  const layouts = [
    {
      id: 'corporate-clean',
      name: 'Corporate Clean',
      headline: 'IDEAS BECOME REAL TODAY',
      image: '/layouts/corporate-clean.png',
      lines: '1–2 Lines',
      textCase: 'Uppercase',
      box: 'None',
      fonts: 'Inter & Helvetica Bold',
      bestFor: 'Commercials, Podcasts & Keynotes'
    },
    {
      id: 'balanced',
      name: 'Balanced',
      headline: 'Most People Never Doing This',
      image: '/layouts/balanced.png',
      lines: '2–3 Lines',
      textCase: 'Mixed / Sentence Case',
      box: 'None',
      fonts: 'Syne & Garamond Italic',
      bestFor: 'Reels, Shorts & High-Retention Hooks'
    },
    {
      id: 'progressive-line',
      name: 'Progressive Line',
      headline: 'that are in English language.',
      image: '/layouts/progressive-line.png',
      lines: '1 Line',
      textCase: 'Mixed Case',
      box: 'Solid White Strip',
      fonts: 'Poppins SemiBold',
      bestFor: 'Podcasts, Tutorials & Explainers'
    },
    {
      id: 'simple-line',
      name: 'Simple Line',
      headline: 'toggle button below',
      image: '/layouts/simple-line.png',
      lines: '1 Line',
      textCase: 'Mixed Case',
      box: 'Translucent Dark Pill',
      fonts: 'Inter Medium',
      bestFor: 'Documentaries & Narrative Storytelling'
    },
    {
      id: 'clean-caption',
      name: 'Clean Caption',
      headline: 'this earth is beautiful but we human hate each other',
      image: '/layouts/clean-caption.png',
      lines: '2 Lines',
      textCase: 'Mixed Case',
      box: 'White Editorial Card',
      fonts: 'Archivo & Garamond',
      bestFor: 'Thought Leadership, Quotes & Stories'
    },
    {
      id: 'devin-style',
      name: 'Devin Style',
      headline: 'POWERFUL WAY TO START',
      image: '/layouts/devin-style.png',
      lines: '2 Lines Stacked',
      textCase: 'Uppercase',
      box: 'None (High Contrast)',
      fonts: 'Tactic Sans Ultra & Bold',
      bestFor: 'High-Impact Openers & Creator Videos'
    }
  ];

  return (
    <section className="styles-gallery-section" id="styles">
      <div className="container">
        {/* Section Header */}
        <div className="styles-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>Authoritative Reference Styles</span>
          </div>
          <h2 className="section-title">
            6 Production Caption Styles.<br />
            <span className="text-gradient-accent">Engineered for After Effects.</span>
          </h2>
          <p className="section-subtitle">
            Every style outputs 100% editable After Effects text and shape layers with authentic keyframes and typography controls.
          </p>
        </div>

        {/* 6 Layout Cards Grid */}
        <div className="layout-cards-grid">
          {layouts.map((layout) => (
            <div key={layout.id} className="layout-card panel-matte-elevated">
              <div className="layout-card-preview">
                <img
                  src={layout.image}
                  alt={`${layout.name} caption layout preview`}
                  className="layout-card-img"
                  loading="lazy"
                />
              </div>

              <div className="layout-card-body">
                <div className="layout-card-header">
                  <h3 className="layout-card-title">{layout.name}</h3>
                </div>

                <div className="layout-spec-matrix">
                  <div className="spec-row">
                    <span className="spec-label">Lines:</span>
                    <span className="spec-val">{layout.lines}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Case:</span>
                    <span className="spec-val">{layout.textCase}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Fonts:</span>
                    <span className="spec-val">{layout.fonts}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Box:</span>
                    <span className="spec-val">{layout.box}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Best for:</span>
                    <span className="spec-val highlight-val">{layout.bestFor}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Honest Output Disclaimer */}
        <div className="styles-disclaimer-card">
          <span className="disclaimer-icon">ℹ</span>
          <span className="disclaimer-text">
            Previews shown above reflect actual After Effects output generated by Zero Velocity layouts.
          </span>
        </div>
      </div>
    </section>
  );
}
