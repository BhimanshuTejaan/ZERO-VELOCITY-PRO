import React, { useState } from 'react';
import './StylesGallery.css';

const STYLES_DATA = [
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    headline: 'IDEAS BECOME REAL TODAY',
    image: '/layouts/corporate-clean.png',
    fonts: 'Inter & Helvetica Bold',
    bestFor: 'Commercials, Podcasts & Keynotes',
    format: 'Uppercase · 1–2 Lines',
    description: 'Clean, authoritative sans-serif typography engineered for executive video, business presentations, and polished brand content.'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    headline: 'Most People Never Doing This',
    image: '/layouts/balanced.png',
    fonts: 'Syne & Garamond Italic',
    bestFor: 'Reels, Shorts & High-Retention Hooks',
    format: 'Mixed Case · 2–3 Lines Stack',
    description: 'Dynamic font-pairing that blends high-energy sans-serif bold lines with elegant italic accents to maximize viewer retention.'
  },
  {
    id: 'progressive-line',
    name: 'Progressive Line',
    headline: 'that are in English language.',
    image: '/layouts/progressive-line.png',
    fonts: 'Poppins SemiBold',
    bestFor: 'Podcasts, Tutorials & Explainers',
    format: 'Solid White Strip · 1 Line Focus',
    description: 'High-contrast single-line caption with solid geometric background strip for razor-sharp readability over noisy video footage.'
  },
  {
    id: 'simple-line',
    name: 'Simple Line',
    headline: 'toggle button below',
    image: '/layouts/simple-line.png',
    fonts: 'Inter Medium',
    bestFor: 'Documentaries & Narrative Storytelling',
    format: 'Translucent Dark Pill · 1 Line',
    description: 'Unobtrusive, cinematic subtitle presentation with frosted glass backing that never distracts from documentary footage.'
  },
  {
    id: 'clean-caption',
    name: 'Clean Caption',
    headline: 'this earth is beautiful but we human hate each other',
    image: '/layouts/clean-caption.png',
    fonts: 'Archivo & Garamond',
    bestFor: 'Thought Leadership, Quotes & Stories',
    format: 'White Editorial Card · 2 Lines',
    description: 'Sophisticated editorial card layout inspired by modern print typography, ideal for long-form interviews and thought leadership.'
  },
  {
    id: 'devin-style',
    name: 'Devin Style',
    headline: 'POWERFUL WAY TO START',
    image: '/layouts/devin-style.png',
    fonts: 'Tactic Sans Ultra & Bold',
    bestFor: 'High-Impact Openers & Creator Videos',
    format: 'High Contrast · Stacked Emphasis',
    description: 'The authoritative creator style. Ultra-bold kinetic typography with high-impact word emphasis and instant visual punch.'
  }
];

export default function StylesGallery() {
  const [selectedStyleId, setSelectedStyleId] = useState('corporate-clean');
  const activeStyle = STYLES_DATA.find((s) => s.id === selectedStyleId) || STYLES_DATA[0];

  return (
    <section className="styles-gallery-section" id="styles">
      <div className="container">
        {/* Section Header */}
        <div className="styles-header text-center">
          <div className="styles-eyebrow">
            <span className="styles-eyebrow-dot" aria-hidden="true"></span>
            <span>SIGNATURE OUTPUT STYLES</span>
          </div>
          <h2 className="styles-section-title">
            6 Production Styles.<br />
            <span className="styles-title-accent">Built for High Retention.</span>
          </h2>
          <p className="styles-section-subtitle">
            Zero Velocity generates genuine editable text and shape layers inside After Effects. Select a style to view its authentic timeline output.
          </p>
        </div>

        {/* 6-Style Segmented Selector Pill Strip */}
        <div className="styles-selector-strip" role="tablist" aria-label="Caption Style Selector">
          {STYLES_DATA.map((style) => {
            const isSelected = style.id === selectedStyleId;
            return (
              <button
                key={style.id}
                role="tab"
                aria-selected={isSelected}
                aria-controls={`style-panel-${style.id}`}
                id={`style-tab-${style.id}`}
                tabIndex={isSelected ? 0 : -1}
                className={`style-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedStyleId(style.id)}
              >
                <span className="pill-dot" aria-hidden="true"></span>
                <span className="pill-name">{style.name}</span>
              </button>
            );
          })}
        </div>

        {/* Cinematic Single-Showcase Stage (Outcome over Specifications) */}
        <div
          className="style-showcase-stage"
          id={`style-panel-${activeStyle.id}`}
          role="tabpanel"
          aria-labelledby={`style-tab-${activeStyle.id}`}
        >
          {/* Main Visual Image Display */}
          <div className="showcase-preview-frame">
            <img
              src={activeStyle.image}
              alt={`${activeStyle.name} caption layout preview in After Effects`}
              className="showcase-active-img"
              key={activeStyle.id}
              loading="lazy"
            />
            <div className="showcase-frame-overlay" aria-hidden="true">
              <span className="frame-pill">{activeStyle.format}</span>
            </div>
          </div>

          {/* Clean Editorial Style Context */}
          <div className="showcase-meta-bar">
            <div className="meta-info-col">
              <span className="meta-label">Selected Style</span>
              <h3 className="meta-title">{activeStyle.name}</h3>
              <p className="meta-desc">{activeStyle.description}</p>
            </div>

            <div className="meta-spec-pills">
              <div className="spec-pill-item">
                <span className="spec-label">Calibrated Fonts</span>
                <span className="spec-value">{activeStyle.fonts}</span>
              </div>
              <div className="spec-pill-item">
                <span className="spec-label">Best Suited For</span>
                <span className="spec-value">{activeStyle.bestFor}</span>
              </div>
              <div className="spec-pill-item">
                <span className="spec-label">Timeline Format</span>
                <span className="spec-value">100% Vector AE Layers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
