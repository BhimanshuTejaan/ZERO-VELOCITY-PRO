import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer section-padding">
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-icon logo-small"></div>
            <span className="logo-text">Zero Velocity</span>
          </div>
          
          <div className="footer-links">
            <a href="#" className="footer-link">Instagram</a>
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
