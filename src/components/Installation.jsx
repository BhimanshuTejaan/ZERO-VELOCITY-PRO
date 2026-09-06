import React from 'react';
import './Installation.css';

export default function Installation() {
  return (
    <section id="installation" className="installation section-padding">
      <div className="container">
        <div className="installation-box glass-panel">
          <div className="section-header text-center">
            <div className="workflow-badge">
              <span className="wf-dot"></span>
              <span>SETUP WORKFLOW</span>
            </div>
            <h2 className="section-title">Get Running in 4 Simple Steps</h2>
            <p className="section-subtitle">Zero complicated configuration. Works seamlessly with Adobe After Effects 2020 through 2025 on Windows (macOS coming very soon).</p>

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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Watch Video Setup Guide</span>
            </button>
          </div>

          <div className="install-steps">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-content">
                <div className="step-title-row">
                  <h4 className="step-title">Download Plugin Package</h4>
                  <span className="step-format-tag">.ZXP Format</span>
                </div>
                <p className="step-text">Download your <code>ZeroVelocity.zxp</code> file immediately after checkout, or access it anytime from your account under <strong>Manage License</strong>.</p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-content">
                <div className="step-title-row">
                  <h4 className="step-title">Install via ZXP Manager</h4>
                  <a
                    href="https://aescripts.com/learn/zxp-installer/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="step-link-badge"
                  >
                    Get ZXP Installer &rarr;
                  </a>
                </div>
                <p className="step-text">Drag and drop the <code>ZeroVelocity.zxp</code> file into the AEScripts ZXP Installer to install automatically.</p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-content">
                <div className="step-title-row">
                  <h4 className="step-title">Open in After Effects</h4>
                  <span className="step-shortcut-tag">Window &rarr; Extensions</span>
                </div>
                <p className="step-text">Launch Adobe After Effects, go to <strong>Window &rarr; Extensions &rarr; Zero Velocity</strong>, and dock the panel anywhere.</p>
              </div>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-content">
                <div className="step-title-row">
                  <h4 className="step-title">Activate License Key</h4>
                  <span className="step-active-tag">✓ 2 Devices</span>
                </div>
                <p className="step-text">Copy your key on-screen after checkout or retrieve it anytime from <strong>Manage License</strong> in your account, then paste to activate.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
