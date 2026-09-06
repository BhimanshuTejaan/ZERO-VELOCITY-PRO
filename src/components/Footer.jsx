import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-logo">
              <img src="/cep/assets/zero-velocity-logo.png" alt="Zero Velocity Logo" className="logo-small-img" />
              <span className="logo-text">Zero Velocity</span>
            </div>
            <p className="footer-tagline">
              The complete caption-production workflow for Adobe After Effects. Create, style, animate, edit, and sound-design captions without leaving your composition.
            </p>
            <div className="footer-compatibility-badge">
              <span className="compat-dot"></span>
              <span>AE 2020–2025 • Windows Only (macOS coming very soon)</span>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">V1.2 Architecture</h4>
            <ul className="footer-nav-list">
              <li><a href="#workflow">Workflow Studio</a></li>
              <li><a href="#styles">6 Signature Styles</a></li>
              <li><a href="#motion-sound">Motion &amp; Sound</a></li>
              <li><a href="#editing">In-Plugin Editing</a></li>
              <li><a href="#styling">Deeper Styling</a></li>
              <li><a href="#compatibility">Offline System</a></li>
              <li><a href="#comparison">V1.0 vs V1.2</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-col-title">Resources &amp; Support</h4>
            <ul className="footer-nav-list">
              <li>
                <a href="mailto:support@zerovelocitycaptions.com" className="footer-support-email" title="Official Support Email">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: '-2px' }}>
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22 6 12 13 2 6"></polyline>
                  </svg>
                  support@zerovelocitycaptions.com
                </a>
              </li>
              <li>
                <a href="https://youtu.be/a9_mlWnkiXs?si=4hbxWOXYLSHpYwnD" target="_blank" rel="noopener noreferrer">
                  Video Setup Guide &rarr;
                </a>
              </li>
              <li>
                <a href="https://youtu.be/avL82crHQVU?si=xjR9XZncFAaG20vh" target="_blank" rel="noopener noreferrer">
                  Feature Walkthrough &rarr;
                </a>
              </li>
              <li>
                <a href="https://aescripts.com/learn/zxp-installer/" target="_blank" rel="noopener noreferrer">
                  AEScripts ZXP Installer &rarr;
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/zero.velocity.ai/" target="_blank" rel="noopener noreferrer">
                  DM on Instagram &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-social-links">
            <a
              href="https://www.youtube.com/@ZEROVELOCITY-d2c"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn youtube-btn"
              aria-label="YouTube Channel"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube</span>
            </a>

            <a
              href="https://www.instagram.com/zero.velocity.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn instagram-btn"
              aria-label="Instagram Page"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Instagram</span>
            </a>
          </div>

          <div className="footer-meta">
            <span className="version-pill">v1.2.0 Production</span>
            <span className="copyright">&copy; {new Date().getFullYear()} Zero Velocity. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
