import React from 'react';
import './SupportCard.css';

export default function SupportCard() {
  return (
    <section id="support" className="support-section">
      <div className="container">
        <div className="support-card glass-panel">
          <div className="support-left">
            <div className="support-icon-badge">
              <span className="chat-emoji">💬</span>
            </div>
            <div className="support-header-text">
              <h3 className="support-title">Need Help?</h3>
              <p className="support-subtitle">
                We're here to assist you with installation, license activation, and workflow questions.
              </p>
            </div>
          </div>

          <div className="support-actions">
            <a
              href="mailto:support@zerovelocitycaptions.com"
              className="support-btn btn-email"
              title="Official Creator Support Email"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22 6 12 13 2 6"></polyline>
              </svg>
              <span>support@zerovelocitycaptions.com</span>
            </a>

            <a
              href="https://youtu.be/a9_mlWnkiXs?si=4hbxWOXYLSHpYwnD"
              target="_blank"
              rel="noopener noreferrer"
              className="support-btn btn-guide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Installation Guide</span>
            </a>

            <a
              href="https://www.youtube.com/watch?v=pxf3k0pU-oE"
              target="_blank"
              rel="noopener noreferrer"
              className="support-btn btn-youtube"
              title="Watch Zero Velocity v1.2 Full Feature Breakdown on YouTube"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>Watch Full Breakdown</span>
            </a>

            <a
              href="https://www.instagram.com/zero.velocity.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="support-btn btn-instagram"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>DM us on Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
