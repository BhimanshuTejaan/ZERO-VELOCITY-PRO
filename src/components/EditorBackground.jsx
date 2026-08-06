import React from 'react';
import './EditorBackground.css';

export default function EditorBackground() {
  return (
    <div className="editor-bg-layer" aria-hidden="true">
      {/* Ambient Radial Blue Lighting */}
      <div className="ambient-blue-glow hero-light"></div>
      <div className="ambient-blue-glow section-light-1"></div>
      <div className="ambient-blue-glow section-light-2"></div>

      {/* Floating Keyframe Diamonds */}
      <div className="keyframe-floating keyframe-1">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 22 12 12 22 2 12" />
        </svg>
      </div>

      <div className="keyframe-floating keyframe-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 22 12 12 22 2 12" />
        </svg>
      </div>

      <div className="keyframe-floating keyframe-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 22 12 12 22 2 12" />
        </svg>
      </div>

      {/* Timeline Ruler Vector Line */}
      <div className="timeline-ruler-overlay">
        <svg width="100%" height="40" viewBox="0 0 1200 40" fill="none">
          <line x1="0" y1="20" x2="1200" y2="20" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
          {[...Array(30)].map((_, i) => (
            <line 
              key={i} 
              x1={i * 40} 
              y1={i % 5 === 0 ? "10" : "15"} 
              x2={i * 40} 
              y2="20" 
              stroke="rgba(255, 255, 255, 0.05)" 
              strokeWidth="1" 
            />
          ))}
        </svg>
      </div>

      {/* Bezier Velocity Graph Curve Vector */}
      <div className="velocity-curve-overlay">
        <svg width="300" height="150" viewBox="0 0 300 150" fill="none">
          <path 
            d="M 10 140 C 90 140, 140 10, 290 10" 
            stroke="rgba(59, 130, 246, 0.07)" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
          />
          <circle cx="90" cy="140" r="3" fill="rgba(59, 130, 246, 0.12)" />
          <circle cx="140" cy="10" r="3" fill="rgba(59, 130, 246, 0.12)" />
          <line x1="10" y1="140" x2="90" y2="140" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
          <line x1="290" y1="10" x2="140" y2="10" stroke="rgba(59, 130, 246, 0.08)" strokeWidth="1" />
        </svg>
      </div>

      {/* Composition Safe Area Bounding Box Guides */}
      <div className="safe-margin-guide left-guide"></div>
      <div className="safe-margin-guide right-guide"></div>
    </div>
  );
}
