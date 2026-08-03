import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { useAuth } from '../AuthContext';
import LicenseModal from './LicenseModal';
import ProcessingOverlay from './ProcessingOverlay';

export default function Header() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef(null);

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Authentication failed", error);
    }
  };

  const firstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'User';
  const firstInitial = firstName.charAt(0).toUpperCase();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for automatic license issuance after successful payment verification
  useEffect(() => {
    const handleLicenseIssued = (e) => {
      setNewlyCreatedKey(e.detail?.licenseKey || null);
      setIsLicenseModalOpen(true);
    };

    window.addEventListener('zero-velocity-license-issued', handleLicenseIssued);
    return () => window.removeEventListener('zero-velocity-license-issued', handleLicenseIssued);
  }, []);

  return (
    <>
      <header className="header container">
        <div className="header-left">
          <div className="logo-icon"></div>
          <span className="logo-text">Zero Velocity</span>
        </div>
        <div className="header-right">
          {currentUser ? (
            <div className="user-menu-container" ref={menuRef}>
              <button 
                className="user-profile-trigger" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
              >
                {!imgError && currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={firstName} 
                    className="profile-avatar" 
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="profile-avatar-fallback">{firstInitial}</div>
                )}
                <span className="user-first-name">{firstName}</span>
                <svg 
                  className={`dropdown-chevron ${isMenuOpen ? 'open' : ''}`} 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {isMenuOpen && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-user-info">
                    <span className="info-label">Signed in as</span>
                    <span className="info-name">{currentUser.displayName || 'User'}</span>
                    <span className="info-email">{currentUser.email}</span>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-section">
                    <button className="dropdown-item disabled" disabled>
                      <div className="item-left">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <span>Dashboard</span>
                      </div>
                      <span className="disabled-badge">Soon</span>
                    </button>
                    <button className="dropdown-item disabled" disabled>
                      <div className="item-left">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>Downloads</span>
                      </div>
                      <span className="disabled-badge">Soon</span>
                    </button>
                    <button 
                      className="dropdown-item" 
                      onClick={() => {
                        setIsMenuOpen(false);
                        setNewlyCreatedKey(null);
                        setIsLicenseModalOpen(true);
                      }}
                    >
                      <div className="item-left">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        <span>License</span>
                      </div>
                    </button>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button 
                    className="dropdown-item logout-item" 
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-secondary sign-in-btn" onClick={handleSignIn}>Sign In</button>
          )}
        </div>
      </header>

      {/* Full-Screen Payment Processing Overlay */}
      <ProcessingOverlay />

      {/* Modern License Modal */}
      <LicenseModal 
        isOpen={isLicenseModalOpen} 
        onClose={() => setIsLicenseModalOpen(false)} 
        newlyCreatedLicenseKey={newlyCreatedKey}
      />
    </>
  );
}
