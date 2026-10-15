import React, { useState } from 'react';
import './Installation.css';

const FAQ_ITEMS = [
  {
    q: 'Does Zero Velocity support macOS?',
    a: 'No. Zero Velocity v1.2 currently supports Windows only. A macOS version is in active development.'
  },
  {
    q: 'Which versions of Adobe After Effects are supported?',
    a: 'Zero Velocity supports Adobe After Effects 2020 through 2025 on Windows 10 and Windows 11.'
  },
  {
    q: 'How many machines can I use my license on?',
    a: 'Each license includes 2 simultaneous device activations, ideal for your primary editing workstation and laptop.'
  },
  {
    q: 'Are there monthly subscriptions or hidden cloud fees?',
    a: 'No. Zero Velocity is a one-time purchase of ₹299. Speech recognition runs locally on your PC, meaning zero monthly fees and zero render minute tokens.'
  },
  {
    q: 'How do I retrieve my download or license key later?',
    a: 'Simply sign in with your Google account on this website anytime. Click "My License & Download" to copy your key or download the latest .ZXP package.'
  }
];

export default function Installation() {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <section id="installation" className="installation-section">
      <div className="container">
        {/* Setup Guide Header */}
        <div className="install-header text-center">
          <div className="install-eyebrow">
            <span className="install-dot" aria-hidden="true"></span>
            <span>QUICK SETUP</span>
          </div>
          <h2 className="install-title">Get Running in 4 Simple Steps</h2>
          <p className="install-subtitle">
            Zero complicated configuration. Fully integrated with Adobe After Effects 2020 through 2025 on Windows.
          </p>

          <div className="install-actions-strip">
            <div className="install-os-pill">
              <span className="ios-dot" aria-hidden="true"></span>
              <span><strong>Windows Only — macOS Version in Development</strong></span>
            </div>

            <a
              href="https://youtu.be/a9_mlWnkiXs?si=4hbxWOXYLSHpYwnD"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-install-video"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Watch Video Setup Guide</span>
            </a>
          </div>
        </div>

        {/* 4-Step Editorial Progression */}
        <div className="install-steps-track">
          <div className="install-step-item">
            <div className="step-num-bubble">01</div>
            <div className="step-details">
              <div className="step-title-line">
                <h3 className="step-head">Download Plugin Package</h3>
                <span className="step-tag">.ZXP Format</span>
              </div>
              <p className="step-desc">
                Download your <code>ZeroVelocity.zxp</code> file instantly after checkout, or access it anytime from your account dashboard.
              </p>
            </div>
          </div>

          <div className="install-step-item">
            <div className="step-num-bubble">02</div>
            <div className="step-details">
              <div className="step-title-line">
                <h3 className="step-head">Install via ZXP Manager</h3>
                <a
                  href="https://aescripts.com/learn/zxp-installer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="step-action-link"
                >
                  Get ZXP Installer &rarr;
                </a>
              </div>
              <p className="step-desc">
                Drag and drop the <code>ZeroVelocity.zxp</code> file into the free AEScripts ZXP Installer to install automatically in 5 seconds.
              </p>
            </div>
          </div>

          <div className="install-step-item">
            <div className="step-num-bubble">03</div>
            <div className="step-details">
              <div className="step-title-line">
                <h3 className="step-head">Open in After Effects</h3>
                <span className="step-tag">Window &gt; Extensions</span>
              </div>
              <p className="step-desc">
                Launch Adobe After Effects, navigate to <strong>Window &rarr; Extensions &rarr; Zero Velocity</strong>, and dock the panel into your workspace.
              </p>
            </div>
          </div>

          <div className="install-step-item">
            <div className="step-num-bubble">04</div>
            <div className="step-details">
              <div className="step-title-line">
                <h3 className="step-head">Activate License Key</h3>
                <span className="step-tag tag-success">✓ 2 Workstations</span>
              </div>
              <p className="step-desc">
                Paste your unique license key from checkout or your account dashboard to unlock full lifetime features.
              </p>
            </div>
          </div>
        </div>

        {/* Consolidated Creator Support Bar */}
        <div className="support-unified-bar">
          <div className="support-bar-info">
            <span className="support-badge">DIRECT CREATOR SUPPORT</span>
            <h4 className="support-bar-title">Need Help with Setup or Workflow?</h4>
            <p className="support-bar-desc">We personally answer creator questions and help you resolve setup issues promptly.</p>
          </div>

          <div className="support-links-group">
            <a href="mailto:support@zerovelocitycaptions.com" className="support-link-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22 6 12 13 2 6"></polyline>
              </svg>
              <span>support@zerovelocitycaptions.com</span>
            </a>

            <a
              href="https://youtu.be/a9_mlWnkiXs?si=4hbxWOXYLSHpYwnD"
              target="_blank"
              rel="noopener noreferrer"
              className="support-link-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Installation Video Guide</span>
            </a>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="faq-unified-container">
          <div className="faq-header text-center">
            <span className="faq-eyebrow">COMMON QUESTIONS</span>
            <h3 className="faq-title">Frequently Asked Questions</h3>
          </div>

          <div className="faq-accordion-list">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`faq-row-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-q-text">{item.q}</span>
                    <span className="faq-toggle-icon" aria-hidden="true">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-pane">
                      <p className="faq-a-text">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
