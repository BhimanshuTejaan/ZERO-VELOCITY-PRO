import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer section-padding">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/cep/assets/zero-velocity-logo.png" alt="Zero Velocity Logo" className="logo-small-img" />
            <span className="logo-text">Zero Velocity</span>
          </div>
          
          <div className="footer-social-links">
            <a 
              href="https://www.youtube.com/@ZEROVELOCITY-d2c" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-btn youtube-btn"
              aria-label="YouTube Channel"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Instagram</span>
            </a>
          </div>

          <div className="footer-support-message">
            <span className="support-icon">💬</span>
            <span>Need help? <a href="https://www.instagram.com/zero.velocity.ai/" target="_blank" rel="noopener noreferrer" className="support-link">DM us on Instagram.</a></span>
          </div>

          <div className="footer-meta">
            <span className="version">Version 1.0</span>
            <span className="copyright">&copy; {new Date().getFullYear()} Zero Velocity. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
