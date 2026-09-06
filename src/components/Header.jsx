import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import { useAuth } from '../AuthContext';
import LicenseModal from './LicenseModal';
import ProcessingOverlay from './ProcessingOverlay';
import AdminDashboard from './AdminDashboard';

// STRICT SINGLE ADMINISTRATOR ALLOWLIST
const SOLE_ADMIN_EMAIL = 'bhimanshutejaan@gmail.com';

export default function Header() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [imgError, setImgError] = useState(false);
  const menuRef = useRef(null);
  const mobileNavRef = useRef(null);

  // Track page scroll progress for the editing playhead track
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (currentScrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
      if (Math.abs(currentScrollY - lastScrollY) > 20) {
        setIsMobileNavOpen(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Authentication failed", error);
    }
  };

  const isSoleAdmin = currentUser?.email?.toLowerCase() === SOLE_ADMIN_EMAIL;
  const firstName = currentUser?.displayName ? currentUser.displayName.split(' ')[0] : 'User';
  const firstInitial = firstName.charAt(0).toUpperCase();

  // Auto-Redirect / Auto-Open Admin Dashboard when bhimanshutejaan@gmail.com signs in
  useEffect(() => {
    if (isSoleAdmin) {
      console.log("⚡ Sole Administrator signed in. Auto-redirecting to Admin Control Center...");
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminDashboardOpen(false);
    }
  }, [currentUser?.email]);

  // Close dropdown or mobile nav on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(event.target) && !event.target.closest('.mobile-nav-toggle')) {
        setIsMobileNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Listen for automatic license issuance after successful payment verification
  useEffect(() => {
    const handleLicenseIssued = (e) => {
      setNewlyCreatedKey(e.detail?.licenseKey || null);
      setDownloadUrl(e.detail?.downloadUrl || null);
      setIsLicenseModalOpen(true);
    };

    const handleOpenAdmin = () => {
      setIsAdminDashboardOpen(true);
    };

    const handleOpenLicense = () => {
      setNewlyCreatedKey(null);
      setDownloadUrl(null);
      setIsLicenseModalOpen(true);
    };

    window.addEventListener('zero-velocity-license-issued', handleLicenseIssued);
    window.addEventListener('zero-velocity-open-admin-dashboard', handleOpenAdmin);
    window.addEventListener('zero-velocity-open-license-modal', handleOpenLicense);

    return () => {
      window.removeEventListener('zero-velocity-license-issued', handleLicenseIssued);
      window.removeEventListener('zero-velocity-open-admin-dashboard', handleOpenAdmin);
      window.removeEventListener('zero-velocity-open-license-modal', handleOpenLicense);
    };
  }, []);


  return (
    <>
      <header className="header-wrapper">
        <div className="header container">
          <div className="header-left">
            <a href="#" className="brand-link">
              <img src="/cep/assets/zero-velocity-logo.png" alt="Zero Velocity Logo" className="logo-icon-img" />
              <div className="brand-text-group">
                <span className="logo-text">Zero Velocity</span>
                <span className="brand-host-badge">AE CEP</span>
              </div>
            </a>
          </div>

          <nav className="header-nav">
            <a href="#styles" className="nav-link">Styles</a>
            <a href="#styling" className="nav-link">Styling</a>
            <a href="#workflow" className="nav-link">Workflow</a>
            <a href="#comparison" className="nav-link">Comparison</a>
            <a href="#pricing" className="nav-link">Pricing</a>
          </nav>

          <div className="header-right">
            <a href="#pricing" className="header-cta-link">
              <span>Lifetime Access</span>
              <span className="header-cta-price">₹99</span>
            </a>
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
                {isSoleAdmin && <span className="admin-pill-tag">ADMIN</span>}
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
                    {/* Admin Dashboard Item: Only rendered if email is bhimanshutejaan@gmail.com */}
                    {isSoleAdmin ? (
                      <button
                        className="dropdown-item admin-menu-item"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsAdminDashboardOpen(true);
                        }}
                      >
                        <div className="item-left">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                          <span>Admin Dashboard</span>
                        </div>
                        <span className="admin-badge-sm">Access</span>
                      </button>
                    ) : (
                      <button className="dropdown-item disabled" disabled>
                        <div className="item-left">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                          <span>Dashboard</span>
                        </div>
                        <span className="disabled-badge">Soon</span>
                      </button>
                    )}

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setNewlyCreatedKey(null);
                        setDownloadUrl(null);
                        setIsLicenseModalOpen(true);
                      }}
                    >
                      <div className="item-left">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        <span>Manage License</span>
                      </div>
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setNewlyCreatedKey(null);
                        setDownloadUrl(null);
                        setIsLicenseModalOpen(true);
                      }}
                    >
                      <div className="item-left">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        <span>Downloads</span>
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

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-label="Toggle Navigation"
            aria-expanded={isMobileNavOpen}
          >
            <span className={`toggle-bar ${isMobileNavOpen ? 'open' : ''}`}></span>
          </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileNavOpen && (
          <div className="mobile-nav-drawer" ref={mobileNavRef}>
            <nav className="mobile-nav-links">
              <a href="#styles" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
                <span>Caption Styles</span>
              </a>
              <a href="#styling" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
                <span>Styling Controls</span>
              </a>
              <a href="#workflow" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
                <span>Workflow</span>
              </a>
              <a href="#comparison" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
                <span>V1.0 vs V1.2</span>
              </a>
              <a href="#pricing" className="mobile-nav-link" onClick={() => setIsMobileNavOpen(false)}>
                <span>Pricing</span>
              </a>
            </nav>
            <div className="mobile-drawer-cta">
              <a href="#pricing" className="btn-mobile-drawer-cta" onClick={() => setIsMobileNavOpen(false)}>
                <span>Get Lifetime Access</span>
                <span className="mobile-cta-badge">₹99</span>
              </a>
            </div>
          </div>
        )}

        {/* Page Reading Progress Bar */}
        <div
          className="header-timeline-track"
          role="progressbar"
          aria-valuenow={Math.round(scrollProgress)}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div className="header-timeline-fill" style={{ width: `${scrollProgress}%` }}></div>
        </div>
      </header>

      {/* Full-Screen Payment Processing Overlay */}
      <ProcessingOverlay />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      {/* Modern License Modal */}
      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        newlyCreatedLicenseKey={newlyCreatedKey}
        downloadUrl={downloadUrl}
      />
    </>
  );
}
