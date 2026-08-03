import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { useAuth } from '../AuthContext';

const SOLE_ADMIN_EMAIL = 'bhimanshutejaan@gmail.com';

export default function AdminDashboard({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'generator'

  // Directory state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Manual Generator Form State
  const [genName, setGenName] = useState('');
  const [genEmail, setGenEmail] = useState('');
  const [genType, setGenType] = useState('Lifetime');
  const [genMaxDevices, setGenMaxDevices] = useState('3');
  const [genNotes, setGenNotes] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState(null);

  const isSoleAdmin = currentUser?.email?.toLowerCase() === SOLE_ADMIN_EMAIL;

  const fetchAdminData = async () => {
    if (!isSoleAdmin) return;
    setLoading(true);

    try {
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch_all_licenses',
          adminEmail: currentUser.email
        })
      });

      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.licenses)) {
        setLicenses(data.licenses);
        if (selectedCustomer) {
          const updated = data.licenses.find(l => l.licenseKey === selectedCustomer.licenseKey);
          if (updated) setSelectedCustomer(updated);
        }
      } else {
        console.error("❌ Admin API Error:", data.error);
      }
    } catch (err) {
      console.error("❌ Error contacting admin API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isSoleAdmin) {
      fetchAdminData();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Strict Frontend Security Gate
  if (!isSoleAdmin) {
    return (
      <div className="admin-overlay-backdrop animate-fade-in" onClick={onClose}>
        <div className="admin-dashboard-container glass-panel access-denied-box" onClick={e => e.stopPropagation()}>
          <div className="error-icon-box">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2>HTTP 403 Access Denied</h2>
          <p>The Admin Dashboard is restricted exclusively to <code>bhimanshutejaan@gmail.com</code>.</p>
          <p className="subtext">Your account ({currentUser?.email || 'Anonymous'}) does not have administrator privileges.</p>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // Handle Admin Action (Enable, Disable, Reset Devices, Delete)
  const handleAdminAction = async (actionType, licenseKey) => {
    if (!isSoleAdmin || !licenseKey) return;
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          adminEmail: currentUser.email,
          licenseKey: licenseKey
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (actionType === 'delete_license') {
          setSelectedCustomer(null);
          setShowDeleteConfirm(false);
        }
        await fetchAdminData();
      } else {
        alert(`Admin Action Error: ${data.error || 'HTTP 403 Forbidden'}`);
      }
    } catch (err) {
      console.error(`❌ Admin action error (${actionType}):`, err);
      alert(`Network error performing action.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Manual License Generation Submission
  const handleGenerateLicenseSubmit = async (e) => {
    e.preventDefault();
    if (!isSoleAdmin) return;

    setGenLoading(true);
    try {
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_manual_license',
          adminEmail: currentUser.email,
          customerName: genName,
          email: genEmail,
          licenseType: genType,
          maxDevices: genMaxDevices,
          notes: genNotes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNewlyGeneratedKey(data.licenseKey);
        setGenName('');
        setGenEmail('');
        setGenNotes('');
        await fetchAdminData();
      } else {
        alert(`Failed to generate license: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("❌ Error generating manual license:", err);
      alert("Network error generating license.");
    } finally {
      setGenLoading(false);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Helper date functions
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isThisWeek = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    const diffDays = (today - d) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Compute Home Metrics
  const totalCustomers = licenses.length;
  const activeLicenses = licenses.filter(l => (l.status || 'active') === 'active').length;
  const disabledLicenses = licenses.filter(l => l.status === 'disabled').length;
  const totalRevenue = activeLicenses * 99; // Launch Price ₹99
  const todaysSales = licenses.filter(l => isToday(l.purchaseDate)).length;
  const todaysActivations = licenses.filter(l => isToday(l.activatedAt || l.purchaseDate)).length;
  const totalDevices = licenses.reduce((acc, l) => acc + (l.registeredDevices?.length || 0), 0);

  // Filter & Search Logic
  const filteredLicenses = licenses.filter(lic => {
    const matchesSearch = 
      (lic.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.licenseKey || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.firebaseUid || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const status = lic.status || 'active';
    const deviceCount = lic.registeredDevices?.length || 0;
    const maxDev = lic.maxDevices || 3;

    switch (activeFilter) {
      case 'active':
        return status === 'active';
      case 'disabled':
        return status === 'disabled';
      case 'limit_reached':
        return deviceCount >= maxDev;
      case 'today':
        return isToday(lic.purchaseDate);
      case 'this_week':
        return isThisWeek(lic.purchaseDate);
      default:
        return true;
    }
  });

  return (
    <div className="admin-overlay-backdrop animate-fade-in" onClick={onClose}>
      <div className="admin-dashboard-container glass-panel" onClick={e => e.stopPropagation()}>
        
        {/* Top Header Bar */}
        <div className="admin-header">
          <div className="admin-header-title">
            <div className="admin-badge">ADMIN CONTROL CENTER</div>
            <h2>Zero Velocity Console</h2>
          </div>
          <div className="admin-header-actions">
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
                onClick={() => setActiveTab('directory')}
              >
                📁 Customer Directory
              </button>
              <button 
                className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
                onClick={() => setActiveTab('generator')}
              >
                ✨ Admin Tools (License Generator)
              </button>
            </div>
            <button className="btn btn-secondary btn-sm refresh-btn" onClick={fetchAdminData} disabled={loading}>
              <svg className={loading ? 'spin' : ''} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              <span>Refresh</span>
            </button>
            <button className="admin-close-btn" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {/* Dashboard Home Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="metric-label">Total Customers</span>
            <span className="metric-value">{totalCustomers}</span>
          </div>
          <div className="metric-card active-card">
            <span className="metric-label">Active Licenses</span>
            <span className="metric-value">{activeLicenses}</span>
          </div>
          <div className="metric-card disabled-card">
            <span className="metric-label">Disabled Licenses</span>
            <span className="metric-value">{disabledLicenses}</span>
          </div>
          <div className="metric-card revenue-card">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Today's Sales</span>
            <span className="metric-value">{todaysSales}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Today's Activations</span>
            <span className="metric-value">{todaysActivations}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Registered Devices</span>
            <span className="metric-value">{totalDevices}</span>
          </div>
        </div>

        {/* TAB 1: Customer Directory View */}
        {activeTab === 'directory' && (
          <>
            {/* Search & Filter Bar */}
            <div className="controls-bar">
              <div className="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input 
                  type="text" 
                  placeholder="Search by email, name, or license key..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>
                )}
              </div>

              <div className="filter-pills">
                <button className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All ({licenses.length})</button>
                <button className={`filter-pill ${activeFilter === 'active' ? 'active' : ''}`} onClick={() => setActiveFilter('active')}>Active ({activeLicenses})</button>
                <button className={`filter-pill ${activeFilter === 'disabled' ? 'active' : ''}`} onClick={() => setActiveFilter('disabled')}>Disabled ({disabledLicenses})</button>
                <button className={`filter-pill ${activeFilter === 'limit_reached' ? 'active' : ''}`} onClick={() => setActiveFilter('limit_reached')}>Limit Reached</button>
                <button className={`filter-pill ${activeFilter === 'today' ? 'active' : ''}`} onClick={() => setActiveFilter('today')}>Today ({todaysSales})</button>
                <button className={`filter-pill ${activeFilter === 'this_week' ? 'active' : ''}`} onClick={() => setActiveFilter('this_week')}>This Week</button>
              </div>
            </div>

            {/* Customer Table */}
            <div className="table-container">
              {loading ? (
                <div className="admin-loading-state">
                  <div className="spinner"></div>
                  <span>Loading customer records from Firestore...</span>
                </div>
              ) : filteredLicenses.length === 0 ? (
                <div className="admin-empty-state">
                  <p>No licenses found matching your criteria.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Source</th>
                      <th>License Key</th>
                      <th>Status</th>
                      <th>Purchase Date</th>
                      <th>Devices</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLicenses.map(lic => {
                      const status = lic.status || 'active';
                      const deviceCount = lic.registeredDevices?.length || 0;
                      const maxDev = lic.maxDevices || 3;
                      const isManualAdmin = lic.source === 'admin' || lic.razorpayPaymentId === 'ADMIN_GENERATED';

                      return (
                        <tr key={lic.id || lic.licenseKey} className={selectedCustomer?.licenseKey === lic.licenseKey ? 'selected-row' : ''}>
                          <td>
                            <div className="customer-email-cell">
                              <span className="email-text">{lic.email || lic.customerName || 'N/A'}</span>
                              {lic.customerName && lic.email && <span className="name-subtext">{lic.customerName}</span>}
                              {lic.firebaseUid && <span className="uid-subtext">UID: {lic.firebaseUid.substring(0, 10)}...</span>}
                            </div>
                          </td>
                          <td>
                            <span className={`source-badge ${isManualAdmin ? 'admin' : 'razorpay'}`}>
                              {isManualAdmin ? 'Admin' : 'Razorpay'}
                            </span>
                          </td>
                          <td>
                            <div className="key-cell">
                              <code className="monospace">{lic.licenseKey}</code>
                              <button className="icon-copy-btn" title="Copy Key" onClick={() => copyToClipboard(lic.licenseKey, `table-${lic.licenseKey}`)}>
                                {copiedField === `table-${lic.licenseKey}` ? '✓' : '📋'}
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge-sm ${status === 'active' ? 'active' : 'disabled'}`}>
                              <span className="dot"></span>
                              {status}
                            </span>
                          </td>
                          <td className="date-cell">{formatDate(lic.purchaseDate)}</td>
                          <td>
                            <span className={`device-tag ${deviceCount >= maxDev ? 'limit' : ''}`}>
                              {deviceCount}/{maxDev} Devices
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-secondary btn-xs view-details-btn" onClick={() => setSelectedCustomer(lic)}>
                              Inspect Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* TAB 2: Admin Tools (Manual License Generator) */}
        {activeTab === 'generator' && (
          <div className="generator-tab-container">
            <div className="generator-card glass-panel">
              <div className="generator-header">
                <h3>✨ Manual License Generator</h3>
                <p>Create custom, active Zero Velocity license keys for lifetime accounts, reviewers, beta testers, and giveaways.</p>
              </div>

              <form onSubmit={handleGenerateLicenseSubmit} className="generator-form">
                <div className="form-row-two">
                  <div className="form-group">
                    <label>Customer Name (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. John Doe"
                      value={genName}
                      onChange={e => setGenName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Customer Email (Optional)</label>
                    <input 
                      type="email" 
                      placeholder="e.g. customer@example.com"
                      value={genEmail}
                      onChange={e => setGenEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label>License Type</label>
                    <select value={genType} onChange={e => setGenType(e.target.value)}>
                      <option value="Lifetime">Lifetime Account</option>
                      <option value="Beta Tester">Beta Tester</option>
                      <option value="Reviewer">Reviewer / Creator</option>
                      <option value="Giveaway">Giveaway Winner</option>
                      <option value="Internal">Internal / Testing</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Max Allowed Devices</label>
                    <select value={genMaxDevices} onChange={e => setGenMaxDevices(e.target.value)}>
                      <option value="1">1 Device</option>
                      <option value="2">2 Devices</option>
                      <option value="3">3 Devices (Standard)</option>
                      <option value="5">5 Devices (Pro / Team)</option>
                      <option value="10">10 Devices (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes / Justification (Optional)</label>
                  <textarea 
                    rows="2" 
                    placeholder="e.g. Granted key for YouTube reviewer video sponsorship"
                    value={genNotes}
                    onChange={e => setGenNotes(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary generate-submit-btn" disabled={genLoading}>
                    {genLoading ? 'Generating License...' : '✨ Generate Active License Key'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Generated Key Success Popup */}
        {newlyGeneratedKey && (
          <div className="new-key-modal-backdrop" onClick={() => setNewlyGeneratedKey(null)}>
            <div className="new-key-modal glass-panel animate-scale-up" onClick={e => e.stopPropagation()}>
              <div className="modal-icon">🎉</div>
              <h3>License Generated Successfully!</h3>
              <p>The manual license is active immediately and ready for device registration.</p>

              <div className="generated-key-box">
                <code className="monospace">{newlyGeneratedKey}</code>
                <button 
                  className={`btn btn-primary copy-key-btn ${copiedField === 'new-key' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(newlyGeneratedKey, 'new-key')}
                >
                  {copiedField === 'new-key' ? '✓ Copied!' : 'Copy License Key'}
                </button>
              </div>

              <div className="modal-footer-actions">
                <button className="btn btn-secondary" onClick={() => { setNewlyGeneratedKey(null); setActiveTab('directory'); }}>
                  View in Customer Directory
                </button>
                <button className="btn btn-secondary" onClick={() => setNewlyGeneratedKey(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Details Panel / Drawer */}
        {selectedCustomer && (
          <div className="customer-drawer-backdrop" onClick={() => setSelectedCustomer(null)}>
            <div className="customer-drawer glass-panel animate-slide-left" onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <h3>Customer Details</h3>
                <button className="drawer-close-btn" onClick={() => setSelectedCustomer(null)}>×</button>
              </div>

              <div className="drawer-body">
                {/* Status Banner */}
                <div className={`drawer-status-banner ${selectedCustomer.status === 'disabled' ? 'disabled' : 'active'}`}>
                  <span className="status-title">Status: {(selectedCustomer.status || 'active').toUpperCase()}</span>
                  <span className="status-sub">
                    Source: {selectedCustomer.source === 'admin' ? 'Admin Generated' : 'Razorpay Purchase'}
                  </span>
                </div>

                {/* Primary Data Grid */}
                <div className="drawer-section">
                  <h4>Account Metadata</h4>
                  {selectedCustomer.customerName && (
                    <div className="data-row">
                      <span className="label">Customer Name:</span>
                      <span className="value">{selectedCustomer.customerName}</span>
                    </div>
                  )}
                  <div className="data-row">
                    <span className="label">Customer Email:</span>
                    <span className="value selectable">{selectedCustomer.email || 'N/A'}</span>
                    <button className="btn-text-copy" onClick={() => copyToClipboard(selectedCustomer.email, 'drawer-email')}>
                      {copiedField === 'drawer-email' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="data-row">
                    <span className="label">Firebase UID:</span>
                    <span className="value monospace selectable">{selectedCustomer.firebaseUid || 'N/A'}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">License Key:</span>
                    <span className="value monospace highlight selectable">{selectedCustomer.licenseKey}</span>
                    <button className="btn-text-copy" onClick={() => copyToClipboard(selectedCustomer.licenseKey, 'drawer-key')}>
                      {copiedField === 'drawer-key' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="data-row">
                    <span className="label">License Type:</span>
                    <span className="value">{selectedCustomer.licenseType || 'Lifetime'}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Source / Ref ID:</span>
                    <span className="value monospace">{selectedCustomer.razorpayPaymentId || 'N/A'}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Purchase / Creation Date:</span>
                    <span className="value">{formatDate(selectedCustomer.purchaseDate)}</span>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="data-row">
                      <span className="label">Admin Notes:</span>
                      <span className="value italic">{selectedCustomer.notes}</span>
                    </div>
                  )}
                </div>

                {/* Registered Devices */}
                <div className="drawer-section">
                  <div className="section-title-row">
                    <h4>Registered Devices ({(selectedCustomer.registeredDevices || []).length}/{selectedCustomer.maxDevices || 3})</h4>
                    {(selectedCustomer.registeredDevices || []).length > 0 && (
                      <button 
                        className="btn btn-warning btn-xs" 
                        onClick={() => handleAdminAction('reset_devices', selectedCustomer.licenseKey)}
                        disabled={actionLoading}
                      >
                        Reset Devices
                      </button>
                    )}
                  </div>

                  {(selectedCustomer.registeredDevices || []).length === 0 ? (
                    <p className="empty-subtext">No devices activated yet.</p>
                  ) : (
                    <div className="devices-list">
                      {selectedCustomer.registeredDevices.map((dev, i) => (
                        <div className="device-card" key={dev.deviceId || i}>
                          <div className="device-header">
                            <span className="device-name">💻 {dev.deviceName || 'Desktop Computer'}</span>
                            <span className="device-id-code">{dev.deviceId?.substring(0, 12)}...</span>
                          </div>
                          <div className="device-meta">
                            <span>Activated: {formatDate(dev.activatedAt || dev.date)}</span>
                            <span>Last Seen: {formatDate(dev.lastSeen || dev.activatedAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Actions Panel */}
                <div className="drawer-section admin-actions-box">
                  <h4>Admin Actions</h4>
                  <div className="action-buttons-grid">
                    {selectedCustomer.status === 'disabled' ? (
                      <button 
                        className="btn btn-success btn-sm" 
                        onClick={() => handleAdminAction('enable_license', selectedCustomer.licenseKey)}
                        disabled={actionLoading}
                      >
                        Enable License
                      </button>
                    ) : (
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => handleAdminAction('disable_license', selectedCustomer.licenseKey)}
                        disabled={actionLoading}
                      >
                        Disable License
                      </button>
                    )}

                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => handleAdminAction('reset_devices', selectedCustomer.licenseKey)}
                      disabled={actionLoading}
                    >
                      Reset Registered Devices
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => copyToClipboard(selectedCustomer.licenseKey, 'btn-key')}
                    >
                      {copiedField === 'btn-key' ? 'Key Copied!' : 'Copy License Key'}
                    </button>

                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => copyToClipboard(selectedCustomer.email, 'btn-email')}
                    >
                      {copiedField === 'btn-email' ? 'Email Copied!' : 'Copy Email'}
                    </button>
                  </div>

                  <div className="delete-hazard-zone">
                    <button className="btn btn-outline-danger btn-xs" onClick={() => setShowDeleteConfirm(true)}>
                      🗑️ Delete Test License
                    </button>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="drawer-section">
                  <h4>Activity Timeline</h4>
                  <div className="activity-timeline">
                    <div className="timeline-item">
                      <span className="timeline-dot blue"></span>
                      <div className="timeline-content">
                        <strong>License Created ({selectedCustomer.source === 'admin' ? 'Admin' : 'Razorpay'})</strong>
                        <span>{formatDate(selectedCustomer.purchaseDate)}</span>
                      </div>
                    </div>

                    {(selectedCustomer.activityLog || []).map((log, idx) => (
                      <div className="timeline-item" key={idx}>
                        <span className="timeline-dot green"></span>
                        <div className="timeline-content">
                          <strong>{log.action}</strong>
                          <span>{formatDate(log.date)} {log.by ? `(by ${log.by})` : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Delete License */}
        {showDeleteConfirm && selectedCustomer && (
          <div className="confirm-modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
            <div className="confirm-modal glass-panel" onClick={e => e.stopPropagation()}>
              <h3>⚠️ Confirm Delete License</h3>
              <p>Are you sure you want to permanently delete license <code>{selectedCustomer.licenseKey}</code>?</p>
              <p className="warning-text">This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleAdminAction('delete_license', selectedCustomer.licenseKey)}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
