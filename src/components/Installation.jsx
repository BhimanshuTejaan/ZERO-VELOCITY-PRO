import React from 'react';
import './Installation.css';

export default function Installation() {
  return (
    <section id="installation" className="installation section-padding">
      <div className="container">
        <div className="installation-box glass-panel">
          <div className="section-header text-center">
            <h2 className="section-title">How to Install</h2>
            <p className="section-subtitle">Get up and running in less than 60 seconds.</p>
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
