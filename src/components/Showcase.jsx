import React from 'react';
import './Showcase.css';

const showcases = [
  {
    id: 'workflow',
    title: 'The Fastest Workflow',
    subtitle: 'Import → Edit → Apply',
    description: 'Stop wasting hours manually placing text. Just import your SRT, adjust the style, and hit apply. Zero Velocity handles the complex keyframing instantly.',
    align: 'left',
    placeholder: 'Visual: Timeline workflow demonstration'
  },
  {
    id: 'corporate',
    title: 'Corporate Clean Layout',
    subtitle: 'Professional & Understated',
    description: 'Perfect for LinkedIn, corporate interviews, and professional documentaries. Maintain readability without the flashy distraction of social media styles.',
    align: 'right',
    placeholder: 'Visual: Clean layout style example'
  },
  {
    id: 'preview',
    title: 'True Live Preview',
    subtitle: 'No more guessing',
    description: 'See exactly what your captions will look like before you apply them. Tweak spacing, size, and layout with immediate visual feedback.',
    align: 'left',
    placeholder: 'Visual: Live preview engine in action'
  },
  {
    id: 'hero',
    title: 'Hero Word Editing',
    subtitle: 'Emphasize what matters',
    description: 'Click any word to instantly make it a Hero or Accent word. Zero Velocity automatically adjusts the sizing and colors to make your key points pop.',
    align: 'right',
    placeholder: 'Visual: Word selection and coloring'
  }
];

export default function Showcase() {
  return (
    <section className="showcase-section section-padding">
      <div className="container">
        <div className="showcase-header text-center">
          <h2 className="section-title">Engineered for Speed</h2>
          <p className="section-subtitle">Every feature is designed to cut down your editing time.</p>
        </div>
        
        <div className="showcase-list">
          {showcases.map((item, index) => (
            <div key={item.id} className={`showcase-block ${item.align === 'right' ? 'row-reverse' : ''}`}>
              <div className="showcase-visual glass-panel">
                <div className="visual-placeholder">
                  <span className="placeholder-text">{item.placeholder}</span>
                </div>
              </div>
              
              <div className="showcase-content">
                <div className="showcase-subtitle">{item.subtitle}</div>
                <h3 className="showcase-title">{item.title}</h3>
                <p className="showcase-description">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
