import React, { useState, useEffect } from 'react';
import './LicenseModal.css';
import { useAuth } from '../AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { CUSTOMER_DOWNLOAD_URL } from '../utils/razorpay';

export default function LicenseModal({ isOpen, onClose, newlyCreatedLicenseKey, downloadUrl }) {
  const { currentUser } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const downloadTargetUrl = downloadUrl || CUSTOMER_DOWNLOAD_URL;

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    let isMounted = true;
    setLoading(true);

    const fetchLicenses = async () => {
      try {
        const db = getFirestore();
        const licensesRef = collection(db, 'licenses');
        
        let q = query(licensesRef, where('firebaseUid', '==', currentUser.uid));
        let querySnapshot = await getDocs(q);

        let list = [];
        querySnapshot.forEach(doc => {
          list.push(doc.data());
        });

        if (list.length === 0 && currentUser.email) {
          const qEmail = query(licensesRef, where('email', '==', currentUser.email));
          const snapEmail = await getDocs(qEmail);
          snapEmail.forEach(doc => {
            list.push(doc.data());
          });
        }

        list.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));

        if (isMounted) {
          setLicenses(list);
        }
      } catch (err) {
        console.error("❌ Firestore Read Error:", err.code, err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLicenses();

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUser, newlyCreatedLicenseKey]);

  if (!isOpen) return null;

  const handleCopy = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="license-modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-title-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <h2>My Licenses</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {newlyCreatedLicenseKey && (
          <div className="new-license-banner animate-fade-in">
            <span className="party-icon">🎉</span>
            <div className="banner-text">
              <strong>Payment Verified!</strong>
              <span>Your license has been activated successfully. It has been securely saved to your account.</span>
            </div>
            {downloadTargetUrl && (
              <a
                href={downloadTargetUrl}
                download
                className="btn btn-primary btn-sm banner-download-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Zero Velocity v1.0
              </a>
            )}
          </div>
        )}

        <div className="modal-body">
          {loading ? (
            <div className="license-loading-state">
              <div className="spinner"></div>
              <span>Fetching licenses from Firestore...</span>
            </div>
          ) : licenses.length === 0 ? (
            <div className="license-empty-state">
              <div className="empty-icon">🔑</div>
              <h3>No Active Licenses Found</h3>
              <p>You haven't purchased Zero Velocity Version 1.0 yet.</p>
              <a href="#pricing" onClick={onClose} className="btn btn-primary btn-sm">
                Buy Version 1.0 (₹99)
              </a>
            </div>
          ) : (
            <div className="licenses-list">
              {licenses.map((lic, index) => (
                <div className="license-card" key={lic.licenseKey || index}>
                  <div className="license-card-header">
                    <span className="product-name">Zero Velocity v1.0 (Founder Launch)</span>
                    <span className={`status-badge ${lic.status === 'active' ? 'active' : ''}`}>
                      <span className="status-dot"></span>
                      {lic.status || 'active'}
                    </span>
                  </div>

                  <div className="license-key-label">Your License Key</div>

                  <div className="license-key-box">
                    <code className="license-code">{lic.licenseKey}</code>
                    <button 
                      className={`copy-btn ${copiedKey === lic.licenseKey ? 'copied' : ''}`} 
                      onClick={() => handleCopy(lic.licenseKey)}
                    >
                      {copiedKey === lic.licenseKey ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Customer Action Buttons */}
                  <div className="license-action-row">
                    <a
                      href={downloadTargetUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm license-action-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Plugin
                    </a>
                    <a
                      href="#installation"
                      onClick={() => {
                        onClose();
                        const el = document.getElementById('installation');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="btn btn-secondary btn-sm license-action-btn"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                      Installation Guide
                    </a>
                  </div>

                  {/* Metadata Grid: Purchase Date, Plugin Version, Device Count */}
                  <div className="license-card-footer">
                    <div className="meta-item">
                      <span className="meta-label">Purchased:</span>
                      <span className="meta-value">{formatDate(lic.purchaseDate)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Version:</span>
                      <span className="meta-value">v1.0.0</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Devices:</span>
                      <span className="meta-value">{(lic.registeredDevices?.length || 0)} / 2</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
