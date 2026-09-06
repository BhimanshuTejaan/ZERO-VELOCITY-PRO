import React, { useState } from 'react';
import './Showcase.css';

export default function Showcase() {
  const [selectedLanguage, setSelectedLanguage] = useState('hinglish');
  const [activeFontPair, setActiveFontPair] = useState('bold-mont');
  const [heroColor, setHeroColor] = useState('#38bdf8');
  const [accentColor, setAccentColor] = useState('#f59e0b');
  const [showSafeGuides, setShowSafeGuides] = useState(true);

  return (
    <section className="showcase-section section-padding" id="features">
      <div className="container">
        <div className="showcase-header text-center">
          <div className="v11-badge">
            <span className="v11-dot"></span>
            Version 1.1 Major Features
          </div>
          <h2 className="section-title">Engineered for Speed &amp; Style</h2>
          <p className="section-subtitle">Auto transcribe, custom fonts, full color control, and frame-accurate preview—all inside After Effects.</p>
        </div>

        <div className="showcase-list">
          {/* Feature 1: One-Click Auto Transcribe */}
          <div className="showcase-block">
            <div className="showcase-visual glass-panel showcase-card-transcribe">
              <div className="micro-ui-card">
                <div className="micro-ui-header">
                  <div className="micro-ui-title">
                    <span className="live-dot"></span>
                    <span>AI Speech Transcription Engine</span>
                  </div>
                  <div className="lang-toggle-pills">
                    <button
                      className={`lang-pill ${selectedLanguage === 'english' ? 'active' : ''}`}
                      onClick={() => setSelectedLanguage('english')}
                    >
                      English
                    </button>
                    <button
                      className={`lang-pill ${selectedLanguage === 'hinglish' ? 'active' : ''}`}
                      onClick={() => setSelectedLanguage('hinglish')}
                    >
                      Hinglish 🇮🇳
                    </button>
                  </div>
                </div>

                {/* Animated Audio Waveform */}
                <div className="audio-wave-visualizer">
                  {[40, 75, 95, 60, 30, 85, 100, 70, 50, 90, 65, 45, 80, 95, 40, 70, 85, 60, 35, 90, 75, 50].map((height, i) => (
                    <span
                      key={i}
                      className="wave-bar"
                      style={{ height: `${height}%`, animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>

                {/* Live SRT Output Simulation */}
                <div className="srt-stream-box">
                  <div className="srt-item active-srt">
                    <span className="srt-time">00:00:01,200 &rarr; 00:00:02,650</span>
                    <p className="srt-words">
                      {selectedLanguage === 'hinglish'
                        ? '“Ab captions banana hua superfast directly in AE”'
                        : '“Generating accurate captions directly in After Effects”'}
                    </p>
                  </div>
                  <div className="srt-item">
                    <span className="srt-time">00:00:02,700 &rarr; 00:00:04,150</span>
                    <p className="srt-words">
                      {selectedLanguage === 'hinglish'
                        ? '“No manual timing sync required. Ek click mein done.”'
                        : '“Zero manual timing required. Word-level alignment done.”'}
                    </p>
                  </div>
                </div>

                <div className="micro-ui-footer">
                  <span className="stat-chip">⚡ 0.8s Generation</span>
                  <span className="stat-chip">100% Local Processing</span>
                </div>
              </div>
            </div>

            <div className="showcase-content">
              <div className="showcase-meta">
                <span className="showcase-pill">NEW IN V1.1</span>
                <span className="showcase-subtitle">English + Hinglish Support</span>
              </div>
              <h3 className="showcase-title">One-Click Auto Transcribe</h3>
              <p className="showcase-description">
                No manual SRT creation or external transcription tools required. Select your audio track inside After Effects, pick English or Hinglish, and click Auto Transcribe. Zero Velocity generates word-level timed captions in seconds.
              </p>

              <div className="showcase-hinglish-box">
                <span className="hinglish-icon">🇮🇳</span>
                <span className="hinglish-text">“Built for how modern creators actually speak: Hindi bolo, Roman captions pao.”</span>
              </div>

              <div className="showcase-chips">
                <span className="showcase-chip">Auto Transcribe</span>
                <span className="showcase-chip">English</span>
                <span className="showcase-chip">Hinglish Support</span>
                <span className="showcase-chip">Direct Audio Extract</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Flexible Font Selection & Pairing */}
          <div className="showcase-block row-reverse">
            <div className="showcase-visual glass-panel showcase-card-font-pairing">
              <div className="micro-ui-card">
                <div className="micro-ui-header">
                  <div className="micro-ui-title">Typography &amp; Pair Inspector</div>
                  <span className="font-status-tag">✓ Detected in After Effects</span>
                </div>

                <div className="font-pair-selector">
                  <div
                    className={`font-preset-card ${activeFontPair === 'bold-mont' ? 'selected' : ''}`}
                    onClick={() => setActiveFontPair('bold-mont')}
                  >
                    <div className="fp-row">
                      <span className="fp-role">HERO:</span>
                      <span className="fp-family font-the-bold">The Bold Font</span>
                    </div>
                    <div className="fp-row">
                      <span className="fp-role">SUPPORT:</span>
                      <span className="fp-family font-montserrat">Montserrat Black</span>
                    </div>
                  </div>

                  <div
                    className={`font-preset-card ${activeFontPair === 'impact-inter' ? 'selected' : ''}`}
                    onClick={() => setActiveFontPair('impact-inter')}
                  >
                    <div className="fp-row">
                      <span className="fp-role">HERO:</span>
                      <span className="fp-family font-impact">Impact Grotesk</span>
                    </div>
                    <div className="fp-row">
                      <span className="fp-role">SUPPORT:</span>
                      <span className="fp-family font-inter">Inter SemiBold</span>
                    </div>
                  </div>
                </div>

                {/* Specimen Preview */}
                <div className="font-specimen-display">
                  <span className="specimen-hero">STOP WASTING</span>
                  <span className="specimen-accent">HOURS ON CAPTIONS</span>
                </div>

                <div className="micro-ui-footer">
                  <span className="stat-chip">Auto System Detection</span>
                  <span className="stat-chip">Dual-Weight Hierarchy</span>
                </div>
              </div>
            </div>

            <div className="showcase-content">
              <div className="showcase-meta">
                <span className="showcase-pill">V1.1 UPGRADE</span>
                <span className="showcase-subtitle">Approved Combinations &amp; Detection</span>
              </div>
              <h3 className="showcase-title">Flexible Font Selection &amp; Pairing</h3>
              <p className="showcase-description">
                Elevate your visual storytelling with curated typography pairings. Set distinct fonts for your base captions, Hero words, and emphasis tags. Zero Velocity scans your system fonts automatically so you never get missing font warnings.
              </p>

              <div className="showcase-chips">
                <span className="showcase-chip">Font Pairing</span>
                <span className="showcase-chip">Custom Fonts</span>
                <span className="showcase-chip">System Font Scanner</span>
                <span className="showcase-chip">Weight Balancing</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Full Custom Color Palette */}
          <div className="showcase-block">
            <div className="showcase-visual glass-panel showcase-card-color-control">
              <div className="micro-ui-card">
                <div className="micro-ui-header">
                  <div className="micro-ui-title">Channel Color Engine</div>
                  <span className="color-mode-badge">RGBA 8-bit &amp; 16-bit</span>
                </div>

                <div className="color-swatches-grid">
                  <div className="color-slot">
                    <label className="slot-label">HERO WORD COLOR</label>
                    <div className="slot-input-group">
                      <input
                        type="color"
                        value={heroColor}
                        onChange={(e) => setHeroColor(e.target.value)}
                        className="color-picker-input"
                      />
                      <span className="slot-hex-code">{heroColor.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="color-slot">
                    <label className="slot-label">ACCENT WORD COLOR</label>
                    <div className="slot-input-group">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="color-picker-input"
                      />
                      <span className="slot-hex-code">{accentColor.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Preview */}
                <div className="color-caption-testbench">
                  <span className="cct-base">Create</span>{' '}
                  <span className="cct-hero" style={{ color: heroColor, textShadow: `0 0 16px ${heroColor}66` }}>VIRAL</span>{' '}
                  <span className="cct-base">Content</span>{' '}
                  <span className="cct-accent" style={{ color: accentColor, textShadow: `0 0 16px ${accentColor}66` }}>TODAY</span>
                </div>

                <div className="micro-ui-footer">
                  <span className="stat-chip">Instant Live Update</span>
                  <span className="stat-chip">No Preset Lock</span>
                </div>
              </div>
            </div>

            <div className="showcase-content">
              <div className="showcase-meta">
                <span className="showcase-pill">V1.1 UPGRADE</span>
                <span className="showcase-subtitle">Hero &amp; Accent Pickers</span>
              </div>
              <h3 className="showcase-title">Full Custom Color Palette</h3>
              <p className="showcase-description">
                Break free from rigid preset templates. Choose custom hex colors for your base words, Hero highlights, and kinetic accents. Match your personal brand, YouTube channel look, or client identity instantly.
              </p>

              <div className="showcase-chips">
                <span className="showcase-chip">Hero Color</span>
                <span className="showcase-chip">Accent Color</span>
                <span className="showcase-chip">HEX &amp; Eye-dropper</span>
                <span className="showcase-chip">Brand Consistency</span>
              </div>
            </div>
          </div>

          {/* Feature 4: Accurate In-Plugin Preview */}
          <div className="showcase-block row-reverse">
            <div className="showcase-visual glass-panel showcase-card-accurate-preview">
              <div className="micro-ui-card">
                <div className="micro-ui-header">
                  <div className="micro-ui-title">Live Composition Align</div>
                  <button
                    className={`safe-margin-tag ${showSafeGuides ? 'active' : 'inactive'}`}
                    onClick={() => setShowSafeGuides(!showSafeGuides)}
                    title="Toggle Safe Margins (9:16)"
                  >
                    <span className="toggle-dot"></span>
                    <span>Safe Zone: {showSafeGuides ? 'ON' : 'OFF'}</span>
                  </button>
                </div>

                <div className="preview-canvas-box">
                  <div className={`safe-margin-overlay ${showSafeGuides ? 'visible' : 'hidden'}`}>
                    <div className="safe-zone-box">
                      <div className="center-anchor-mark"></div>
                      <div className="mock-reel-caption">
                        <span className="mrc-hero">ZERO VELOCITY</span>
                        <span className="mrc-sub">100% Frame-Accurate Positioning</span>
                      </div>
                    </div>
                  </div>
                  <div className="comp-grid-stats">
                    <span>X: 540px</span>
                    <span>Y: 1420px</span>
                    <span>Scale: 100%</span>
                  </div>
                </div>

                <div className="micro-ui-footer">
                  <span className="stat-chip">Pixel-Perfect Scale</span>
                  <span className="stat-chip">Zero Positioning Guesswork</span>
                </div>
              </div>
            </div>

            <div className="showcase-content">
              <div className="showcase-meta">
                <span className="showcase-pill">V1.1 UPGRADE</span>
                <span className="showcase-subtitle">No More Guesswork</span>
              </div>
              <h3 className="showcase-title">Accurate In-Plugin Preview</h3>
              <p className="showcase-description">
                What you see in the panel is exactly what renders in your composition. Preview word layout, multi-line breaking, and emphasis bounding boxes with real safe-zone margins before touching your After Effects timeline.
              </p>

              <div className="showcase-chips">
                <span className="showcase-chip">Live Preview</span>
                <span className="showcase-chip">Safe Zone Guides</span>
                <span className="showcase-chip">Word Bounding Box</span>
                <span className="showcase-chip">Direct AE Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
