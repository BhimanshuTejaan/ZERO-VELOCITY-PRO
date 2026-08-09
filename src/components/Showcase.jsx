import React from 'react';
import './Showcase.css';

const showcases = [
  {
    id: 'transcribe',
    badge: 'NEW IN V1.1',
    title: 'One-Click Auto Transcribe',
    subtitle: 'English + Hinglish Support',
    description: 'No manual SRT creation required. Select your media in After Effects, select English or Hinglish, and click Auto Transcribe. Zero Velocity generates your timed transcription instantly.',
    quote: '“Built for the way Indian creators actually speak.” (Hindi बोलो, Roman captions पाओ.)',
    align: 'left',
    chips: ['Auto Transcribe', 'English', 'Hinglish Support'],
    placeholder: 'Visual: One-Click Auto Transcribe (English & Hinglish)'
  },
  {
    id: 'font-pairing',
    badge: 'V1.1 UPGRADE',
    title: 'Flexible Font Selection & Pairing',
    subtitle: 'Approved Combinations & Detection',
    description: 'Choose approved Support, Hero, and Accent font combinations or apply your own style. Missing system fonts are automatically detected inside the plugin panel.',
    align: 'right',
    chips: ['Font Pairing', 'Custom Fonts', 'Font Detection'],
    placeholder: 'Visual: Font selection & pairing controls'
  },
  {
    id: 'color-control',
    badge: 'V1.1 UPGRADE',
    title: 'Full Custom Color Palette',
    subtitle: 'Hero & Accent Pickers',
    description: 'Customize your Hero and Accent word colors using the built-in color picker. Match your channel branding without preset color restrictions.',
    align: 'left',
    chips: ['Hero Color', 'Accent Color', 'Color Picker'],
    placeholder: 'Visual: Custom Hero & Accent color pickers'
  },
  {
    id: 'accurate-preview',
    badge: 'V1.1 UPGRADE',
    title: 'Accurate In-Plugin Preview',
    subtitle: 'No More Guesswork',
    description: 'Preview your caption layout, sizing, and word highlighting directly inside the panel before generating. Much closer to your final After Effects composition result.',
    align: 'right',
    chips: ['Live Preview', 'Layout Engine', 'AE Alignment'],
    placeholder: 'Visual: Improved live panel preview engine'
  }
];

export default function Showcase() {
  return (
    <section className="showcase-section section-padding">
      <div className="container">
        <div className="showcase-header text-center">
          <div className="v11-badge">
            <span className="v11-dot"></span>
            Version 1.1 Major Features
          </div>
          <h2 className="section-title">Engineered for Speed &amp; Style</h2>
          <p className="section-subtitle">Auto transcribe, custom fonts, full color control, and accurate preview—all inside After Effects.</p>
        </div>
        
        <div className="showcase-list">
          {showcases.map((item) => (
            <div key={item.id} className={`showcase-block ${item.align === 'right' ? 'row-reverse' : ''}`}>
              <div className={`showcase-visual glass-panel showcase-card-${item.id}`}>
                <div className="visual-placeholder">
                  <span className="placeholder-text">{item.placeholder}</span>
                </div>
              </div>
              
              <div className="showcase-content">
                <div className="showcase-meta">
                  <span className="showcase-pill">{item.badge}</span>
                  <span className="showcase-subtitle">{item.subtitle}</span>
                </div>
                <h3 className="showcase-title">{item.title}</h3>
                <p className="showcase-description">{item.description}</p>
                
                {item.quote && (
                  <div className="showcase-hinglish-box">
                    <span className="hinglish-icon">🇮🇳</span>
                    <span className="hinglish-text">{item.quote}</span>
                  </div>
                )}

                <div className="showcase-chips">
                  {item.chips.map((c, i) => (
                    <span key={i} className="showcase-chip">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
