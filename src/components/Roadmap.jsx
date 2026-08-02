import React from 'react';
import './Roadmap.css';

const roadmapFeatures = [
  {
    id: 1,
    title: "Hero Color Picker",
    description: "Choose exact hex codes or sample colors directly from your composition for your Hero words.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5"></circle>
        <circle cx="17.5" cy="10.5" r=".5"></circle>
        <circle cx="8.5" cy="7.5" r=".5"></circle>
        <circle cx="6.5" cy="12.5" r=".5"></circle>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
      </svg>
    )
  },
  {
    id: 2,
    title: "Animation Presets",
    description: "Apply complex 1-click pop, slide, and fade animations to your captions automatically.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    )
  },
  {
    id: 3,
    title: "Built-in SRT Generator",
    description: "Auto-transcribe your sequence audio to SRT text directly inside After Effects using local AI.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
      </svg>
    )
  },
  {
    id: 4,
    title: "Saved Presets",
    description: "Save your custom layouts, colors, and timing settings to reuse across different projects.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
    )
  },
  {
    id: 5,
    title: "Font Selection",
    description: "Quickly browse and apply any font installed on your system directly from the plugin panel.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 7 4 4 20 4 20 7"></polyline>
        <line x1="9" y1="20" x2="15" y2="20"></line>
        <line x1="12" y1="4" x2="12" y2="20"></line>
      </svg>
    )
  },
  {
    id: 6,
    title: "More Layout Styles",
    description: "Unlock new layout templates optimized specifically for TikTok, Reels, and YouTube Shorts.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    )
  }
];

export default function Roadmap() {
  return (
    <section id="roadmap" className="roadmap section-padding">
      <div className="container">
        <div className="section-header text-center">
          <div className="launch-badge coming-soon-badge">
            <span className="badge-dot dot-orange"></span>
            Active Development
          </div>
          <h2 className="section-title">The journey has just begun.</h2>
          <p className="section-subtitle">Lock in your Founder's price today and get all Version 1.x features for free.</p>
        </div>
        
        <div className="roadmap-cards">
          {roadmapFeatures.map((feature) => (
            <div key={feature.id} className="roadmap-card glass-panel">
              <div className="roadmap-card-header">
                <div className="roadmap-icon">
                  {feature.icon}
                </div>
                <div className="coming-soon-label">Coming Soon v1.1</div>
              </div>
              <h3 className="roadmap-card-title">{feature.title}</h3>
              <p className="roadmap-card-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
