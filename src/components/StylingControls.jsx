import React, { useState } from 'react';
import './StylingControls.css';

export default function StylingControls() {
  const [activeLayout, setActiveLayout] = useState('balanced');
  const [primaryFont, setPrimaryFont] = useState('Syne');
  const [accentFont, setAccentFont] = useState('Playfair Display');
  const [isAllCaps, setIsAllCaps] = useState(true);
  const [wordsPerLine, setWordsPerLine] = useState(3);
  const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
  const [accentColor, setAccentColor] = useState('#38BDF8');
  const [heroColor, setHeroColor] = useState('#FACC15');

  const layoutList = [
    { id: 'balanced', name: 'Balanced' },
    { id: 'corporate', name: 'Corporate Clean' },
    { id: 'progressive', name: 'Progressive Line' },
    { id: 'simple', name: 'Simple Line' },
    { id: 'clean', name: 'Clean Caption' },
    { id: 'devin', name: 'Devin Style' }
  ];

  const primaryFonts = ['Tactic Sans', 'Syne', 'Montserrat', 'Inter', 'Poppins'];
  const accentFonts = [
    { name: 'Tactic Sans', label: 'Tactic Sans (Ultra/Bold)', italic: false },
    { name: 'Playfair Display', label: 'Playfair (Italic Serif)', italic: true },
    { name: 'Syne ExtraBold', label: 'Syne ExtraBold', italic: false },
    { name: 'Montserrat Black', label: 'Montserrat Black', italic: false }
  ];

  return (
    <section className="styling-controls-section" id="styling">
      <div className="container">
        {/* Section Header */}
        <div className="styling-header text-center">
          <div className="section-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>Precision Typographic Controls</span>
          </div>
          <h2 className="section-title">
            Deep Styling Controls.<br />
            <span className="text-gradient-accent">Complete Design Authority.</span>
          </h2>
          <p className="section-subtitle">
            Configure layouts, typography hierarchy, word pacing, and calibrated color palettes with live After Effects output visualization.
          </p>
        </div>

        {/* 2-Column Desktop Matrix */}
        <div className="styling-matrix panel-matte-elevated">
          {/* Left: Clean Control Panel */}
          <div className="controls-column">
            {/* Control 1: Layout Selector */}
            <div className="control-group">
              <label className="control-label">01 / Caption Layout</label>
              <div className="layout-pills-grid">
                {layoutList.map((layout) => (
                  <button
                    key={layout.id}
                    className={`layout-pill-btn ${activeLayout === layout.id ? 'active' : ''}`}
                    onClick={() => setActiveLayout(layout.id)}
                  >
                    {layout.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 2: Font Pairing */}
            <div className="control-dual-row">
              <div className="control-group half">
                <label className="control-label">02 / Primary Font</label>
                <div className="font-options-row">
                  {primaryFonts.map((font) => (
                    <button
                      key={font}
                      className={`font-select-btn ${primaryFont === font ? 'active' : ''}`}
                      onClick={() => setPrimaryFont(font)}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group half">
                <label className="control-label">03 / Accent Font</label>
                <div className="font-options-row">
                  {accentFonts.map((font) => (
                    <button
                      key={font.name}
                      className={`font-select-btn ${accentFont === font.name ? 'active' : ''}`}
                      onClick={() => setAccentFont(font.name)}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Control 3: Uppercase & Word Pacing */}
            <div className="control-dual-row">
              <div className="control-group half">
                <label className="control-label">04 / Character Case</label>
                <div className="toggle-switch-wrapper">
                  <button
                    className={`case-toggle-btn ${isAllCaps ? 'active' : ''}`}
                    onClick={() => setIsAllCaps(true)}
                  >
                    ALL CAPS
                  </button>
                  <button
                    className={`case-toggle-btn ${!isAllCaps ? 'active' : ''}`}
                    onClick={() => setIsAllCaps(false)}
                  >
                    Mixed Case
                  </button>
                </div>
              </div>

              <div className="control-group half">
                <div className="label-with-val">
                  <label className="control-label">05 / Word Pacing</label>
                  <span className="slider-val-badge">{wordsPerLine} Words</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={wordsPerLine}
                  onChange={(e) => setWordsPerLine(Number(e.target.value))}
                  className="styling-slider"
                />
              </div>
            </div>

            {/* Control 4: Color Swatches */}
            <div className="control-group">
              <label className="control-label">06 / Color Palette</label>
              <div className="palette-grid">
                <div className="palette-picker-item">
                  <span className="picker-label">Primary Text</span>
                  <label className="color-input-wrapper" title="Change Primary Text Color">
                    <input
                      type="color"
                      aria-label="Primary Text Color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="color-input-dot"
                    />
                    <span className="color-hex-text">{primaryColor.toUpperCase()}</span>
                  </label>
                </div>

                <div className="palette-picker-item">
                  <span className="picker-label">Accent Highlight</span>
                  <label className="color-input-wrapper" title="Change Accent Highlight Color">
                    <input
                      type="color"
                      aria-label="Accent Highlight Color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="color-input-dot"
                    />
                    <span className="color-hex-text">{accentColor.toUpperCase()}</span>
                  </label>
                </div>

                <div className="palette-picker-item">
                  <span className="picker-label">Hero Emphasis</span>
                  <label className="color-input-wrapper" title="Change Hero Emphasis Color">
                    <input
                      type="color"
                      aria-label="Hero Emphasis Color"
                      value={heroColor}
                      onChange={(e) => setHeroColor(e.target.value)}
                      className="color-input-dot"
                    />
                    <span className="color-hex-text">{heroColor.toUpperCase()}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Large Visual Layout Preview */}
          <div className="preview-column">
            <div className="preview-top-status">
              <div className="preview-status-indicator">
                <span className="status-dot"></span>
                <span className="status-title">Interactive Composition Canvas</span>
              </div>
              <span className="status-font-info">
                {primaryFont} + {accentFont.includes('Playfair') ? 'Playfair' : accentFont}
              </span>
            </div>

            <div className="preview-rendered-stage">
              {/* Layout 1: Balanced */}
              {activeLayout === 'balanced' && (
                <div
                  className="preview-layout-balanced"
                  style={{ textTransform: isAllCaps ? 'uppercase' : 'none' }}
                >
                  <div className="balanced-top" style={{ color: primaryColor }}>
                    Most People Never
                  </div>
                  <div className="balanced-hero">
                    <span
                      className="font-serif italic"
                      style={{ color: heroColor }}
                    >
                      Doing
                    </span>
                    <span style={{ color: accentColor }}> This</span>
                  </div>
                </div>
              )}

              {/* Layout 2: Corporate Clean */}
              {activeLayout === 'corporate' && (
                <div
                  className="preview-layout-corporate"
                  style={{ textTransform: isAllCaps ? 'uppercase' : 'none' }}
                >
                  <div className="corp-line-top" style={{ color: primaryColor }}>
                    IDEAS BECOME
                  </div>
                  <div className="corp-line-mid" style={{ color: accentColor }}>
                    REAL
                  </div>
                  <div className="corp-line-bot" style={{ color: heroColor }}>
                    TODAY
                  </div>
                </div>
              )}

              {/* Layout 3: Progressive Line */}
              {activeLayout === 'progressive' && (
                <div className="preview-layout-progressive">
                  <div className="progressive-strip">
                    <span className="prog-dim">that are in </span>
                    <span className="prog-active" style={{ color: '#090d16' }}>
                      English language.
                    </span>
                  </div>
                </div>
              )}

              {/* Layout 4: Simple Line */}
              {activeLayout === 'simple' && (
                <div className="preview-layout-simple">
                  <div className="simple-strip">
                    <span style={{ color: primaryColor }}>toggle </span>
                    <span style={{ color: accentColor, fontWeight: 700 }}>button below</span>
                  </div>
                </div>
              )}

              {/* Layout 5: Clean Caption */}
              {activeLayout === 'clean' && (
                <div className="preview-layout-clean">
                  <div className="clean-card">
                    <p style={{ color: '#090d16' }}>
                      this earth is beautiful but we <span style={{ color: '#2563eb', fontWeight: 800 }}>human hate</span> each other
                    </p>
                  </div>
                </div>
              )}

              {/* Layout 6: Devin Style */}
              {activeLayout === 'devin' && (
                <div
                  className="preview-layout-devin"
                  style={{ textTransform: isAllCaps ? 'uppercase' : 'none' }}
                >
                  <div className="devin-top" style={{ color: primaryColor }}>
                    POWERFUL
                  </div>
                  <div className="devin-bot" style={{ color: accentColor }}>
                    WAY TO START
                  </div>
                </div>
              )}
            </div>

            {/* Parameter Inspector Bar */}
            <div className="preview-metrics-box">
              <div className="metric-item">
                <span className="metric-label">Layout</span>
                <span className="metric-val">{layoutList.find((l) => l.id === activeLayout)?.name}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Font Binding</span>
                <span className="metric-val">{primaryFont}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Pacing</span>
                <span className="metric-val">{wordsPerLine} W / Block</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Output</span>
                <span className="metric-val text-accent">100% Vector AE Layers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
