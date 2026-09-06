import React from 'react';
import './EditorBackground.css';

export default function EditorBackground() {
  return (
    <div className="editor-bg-layer" aria-hidden="true">
      {/* Restrained Ambient Studio Lighting */}
      <div className="ambient-blue-glow hero-light"></div>
      <div className="ambient-blue-glow section-light-1"></div>
    </div>
  );
}
