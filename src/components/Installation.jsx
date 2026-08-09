import React from 'react';
import './Installation.css';

export default function Installation() {
  return (
    <section id="installation" className="installation section-padding">
      <div className="container">
        <div className="installation-box glass-panel">
          <div className="section-header text-center">
            <h2 className="section-title">How to Install V1.1</h2>
            <p className="section-subtitle">Get up and running in less than 60 seconds.</p>

            <button 
              type="button"
              className="btn btn-secondary install-video-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(
                  "https://youtu.be/a9_mlWnkiXs?si=4hbxWOXYLSHpYwnD",
                  "_blank",
                  "noopener,noreferrer"
                );
              }}
            >
              ▶ Watch V1.1 Installation Guide
            </button>
          </div>
          
          <div className="install-steps">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-content">
                <h4 className="step-title">Install ZXP Installer</h4>
                <p className="step-text">Download AEScripts ZXP Installer or Anastasiy's Extension Manager.</p>
              </div>
            </div>
            
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-content">
                <h4 className="step-title">Open Extension</h4>
                <p className="step-text">Open After Effects → Window → Extensions → Zero Velocity.</p>
              </div>
            </div>
            
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-content">
                <h4 className="step-title">Activate License</h4>
                <p className="step-text">Paste the license key sent to your email to unlock instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
