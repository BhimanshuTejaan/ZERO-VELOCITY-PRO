import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { useAuth } from '../AuthContext';

const SOLE_ADMIN_EMAIL = 'bhimanshutejaan@gmail.com';

export default function AdminDashboard({ isOpen, onClose }) {
  const { currentUser } = useAuth();

  // Test harness support in local dev mode (eliminated in production builds)
  const isSoleAdmin = currentUser?.email?.toLowerCase() === SOLE_ADMIN_EMAIL ||
    (import.meta.env.DEV && typeof window !== 'undefined' && window.__ZV_ADMIN_TEST_ACTIVE__ === true);

  const [licenses, setLicenses] = useState(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined' && Array.isArray(window.__ZV_ADMIN_TEST_LICENSES__)) {
      return window.__ZV_ADMIN_TEST_LICENSES__;
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'generator'
  const [mobileMetricsExpanded, setMobileMetricsExpanded] = useState(false);

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
  const [genMaxDevices, setGenMaxDevices] = useState('1');
  const [genNotes, setGenNotes] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [newlyGeneratedKey, setNewlyGeneratedKey] = useState(null);

  // Sync test licenses if updated dynamically during dev testing
  useEffect(() => {
    if (import.meta.env.DEV && typeof window !== 'undefined' && Array.isArray(window.__ZV_ADMIN_TEST_LICENSES__)) {
      setLicenses(window.__ZV_ADMIN_TEST_LICENSES__);
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    if (!isSoleAdmin) return;
    setLoading(true);

    try {
      if (import.meta.env.DEV && typeof window !== 'undefined' && window.__ZV_ADMIN_TEST_ACTIVE__ && Array.isArray(window.__ZV_ADMIN_TEST_LICENSES__)) {
        setLicenses(window.__ZV_ADMIN_TEST_LICENSES__);
        if (selectedCustomer) {
          const updated = window.__ZV_ADMIN_TEST_LICENSES__.find(l => l.licenseKey === selectedCustomer.licenseKey);
          if (updated) setSelectedCustomer(updated);
        }
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'fetch_all_licenses'
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
        if (import.meta.env.DEV && typeof window !== 'undefined' && Array.isArray(window.__ZV_ADMIN_TEST_LICENSES__)) {
          // Dev fallback
          setLicenses(window.__ZV_ADMIN_TEST_LICENSES__);
        }
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
  }, [isOpen, currentUser, isSoleAdmin]);

  // Lock body scroll when dashboard is open, restore when closed
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

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
      if (import.meta.env.DEV && typeof window !== 'undefined' && window.__ZV_ADMIN_TEST_ACTIVE__) {
        // Optimistic update for safe dev testing
        setLicenses(prev => {
          if (actionType === 'delete_license') {
            return prev.filter(l => l.licenseKey !== licenseKey);
          }
          return prev.map(l => {
            if (l.licenseKey !== licenseKey) return l;
            if (actionType === 'enable_license') return { ...l, status: 'active' };
            if (actionType === 'disable_license') return { ...l, status: 'disabled' };
            if (actionType === 'reset_devices') return { ...l, registeredDevices: [] };
            return l;
          });
        });
        if (actionType === 'delete_license') {
          setSelectedCustomer(null);
          setShowDeleteConfirm(false);
        } else if (selectedCustomer && selectedCustomer.licenseKey === licenseKey) {
          setSelectedCustomer(prev => {
            if (!prev) return null;
            if (actionType === 'enable_license') return { ...prev, status: 'active' };
            if (actionType === 'disable_license') return { ...prev, status: 'disabled' };
            if (actionType === 'reset_devices') return { ...prev, registeredDevices: [] };
            return prev;
          });
        }
        setActionLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: actionType,
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
      if (import.meta.env.DEV && typeof window !== 'undefined' && window.__ZV_ADMIN_TEST_ACTIVE__) {
        const dummyKey = `ZV-TEST-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newLic = {
          licenseKey: dummyKey,
          customerName: genName || 'Test User',
          email: genEmail || 'test@example.com',
          firebaseUid: 'test-uid-' + Date.now(),
          razorpayPaymentId: 'ADMIN_GENERATED',
          razorpayOrderId: null,
          source: 'admin',
          licenseType: genType,
          maxDevices: parseInt(genMaxDevices || '1', 10),
          notes: genNotes || null,
          purchaseDate: new Date().toISOString(),
          status: 'active',
          registeredDevices: [],
          activityLog: [{ action: `License Generated via Admin Tools (${genType})`, date: new Date().toISOString(), by: SOLE_ADMIN_EMAIL }]
        };
        setLicenses(prev => [newLic, ...prev]);
        setNewlyGeneratedKey(dummyKey);
        setGenName('');
        setGenEmail('');
        setGenNotes('');
        setGenLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const res = await fetch('/api/admin-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'generate_manual_license',
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
    if (!text) return;
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

  const formatShortDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      if (isToday(dateStr)) return 'Today';
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to determine authentic transaction source & verified amount
  const getSourceInfo = (lic) => {
    if (!lic) return { label: 'Unknown', badgeClass: 'admin', amount: 0, isPaid: false, type: 'unknown' };
    const isManualAdmin = lic.source === 'admin' || lic.razorpayPaymentId === 'ADMIN_GENERATED';
    if (isManualAdmin) {
      return {
        type: 'admin',
        badgeClass: 'admin',
        label: 'Admin Grant',
        amount: 0,
        isPaid: false
      };
    }

    if (lic.isTestTransaction || lic.paymentVerified === false) {
      return {
        type: 'unverified',
        badgeClass: 'unverified',
        label: 'Unverified / Test',
        amount: null,
        isPaid: false
      };
    }

    const amt = lic.amount !== undefined && lic.amount !== null
      ? (lic.amount > 1000 ? Math.round(lic.amount / 100) : Number(lic.amount))
      : null;

    if (amt !== null && amt > 0) {
      return {
        type: 'razorpay',
        badgeClass: 'razorpay',
        label: `Razorpay ₹${amt}`,
        amount: amt,
        isPaid: true
      };
    }

    return {
      type: 'unverified',
      badgeClass: 'unverified',
      label: 'Razorpay (Unverified)',
      amount: null,
      isPaid: false
    };
  };

  // Compute Home Metrics from Verified Historical Transactions
  const totalCustomers = licenses.length;
  const isGrant = (l) => l.source === 'admin' || l.razorpayPaymentId === 'ADMIN_GENERATED';
  const isPaidOrder = (l) => {
    if (isGrant(l)) return false;
    if (!l.razorpayPaymentId) return false;
    if (l.isTestTransaction || l.paymentVerified === false) return false;
    const amt = l.amount !== undefined && l.amount !== null
      ? (l.amount > 1000 ? Math.round(l.amount / 100) : Number(l.amount))
      : null;
    return amt !== null && amt > 0;
  };

  const paidLicenses = licenses.filter(isPaidOrder);
  const adminLicenses = licenses.filter(isGrant);
  const unverifiedLicenses = licenses.filter(l => !isGrant(l) && !isPaidOrder(l));
  const activeLicenses = licenses.filter(l => (l.status || 'active') === 'active').length;
  const disabledLicenses = licenses.filter(l => l.status === 'disabled').length;

  // Sum verified historical payment amounts only (never multiply by arbitrary price)
  const totalRevenue = paidLicenses.reduce((sum, l) => {
    const amt = l.amount > 1000 ? Math.round(l.amount / 100) : Number(l.amount || 0);
    return sum + amt;
  }, 0);

  const todaysSales = paidLicenses.filter(l => isToday(l.purchaseDate)).length;
  const thisWeekSales = paidLicenses.filter(l => isThisWeek(l.purchaseDate)).length;
  const todaysActivations = licenses.filter(l => isToday(l.activatedAt || l.purchaseDate)).length;
  const totalDevices = licenses.reduce((acc, l) => acc + (l.registeredDevices?.length || 0), 0);
  const limitReachedLicenses = licenses.filter(l => (l.registeredDevices?.length || 0) >= (l.maxDevices || 1)).length;

  // Filter & Search Logic
  const filteredLicenses = licenses.filter(lic => {
    const matchesSearch =
      (lic.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.licenseKey || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.firebaseUid || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.razorpayPaymentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lic.razorpayOrderId || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const status = lic.status || 'active';
    const deviceCount = lic.registeredDevices?.length || 0;
    const maxDev = lic.maxDevices || 1;

    switch (activeFilter) {
      case 'active':
        return status === 'active';
      case 'disabled':
        return status === 'disabled';
      case 'limit_reached':
        return deviceCount >= maxDev;
      case 'today':
        return isPaidOrder(lic) && isToday(lic.purchaseDate);
      case 'this_week':
        return isPaidOrder(lic) && isThisWeek(lic.purchaseDate);
      case 'paid':
      case 'razorpay':
        return isPaidOrder(lic);
      case 'admin':
        return isGrant(lic);
      case 'unverified':
        return !isGrant(lic) && !isPaidOrder(lic);
      default:
        return true;
    }
  });

  return (
    <div className="admin-overlay-backdrop animate-fade-in" onClick={onClose}>
      <div className="admin-dashboard-container glass-panel" onClick={e => e.stopPropagation()}>

        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="admin-header-top-row">
            <div className="admin-header-title">
              <div className="admin-brand-tag">
                <span className="admin-badge-dot"></span>
                <span>ADMIN CONSOLE</span>
              </div>
              <h2 className="admin-title">Zero Velocity</h2>
            </div>
            <div className="admin-quick-actions">
              <button
                className="btn btn-secondary btn-sm refresh-btn"
                onClick={fetchAdminData}
                disabled={loading}
                title="Refresh Records"
                aria-label="Refresh Records"
              >
                <svg className={loading ? 'spin' : ''} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                <span className="refresh-label">Refresh</span>
              </button>
              <button
                className="admin-close-btn"
                onClick={onClose}
                aria-label="Close Admin Dashboard"
                title="Close"
              >
                <span className="close-text-mobile">Done</span>
                <svg className="close-icon-desktop" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Segmented Navigation Tab Bar */}
          <nav className="admin-segmented-nav" role="tablist" aria-label="Admin Sections">
            <button
              role="tab"
              aria-selected={activeTab === 'directory'}
              className={`segmented-tab ${activeTab === 'directory' ? 'active' : ''}`}
              onClick={() => setActiveTab('directory')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Buyers & Licenses</span>
              <span className="segmented-tab-count">{licenses.length}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'generator'}
              className={`segmented-tab ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => setActiveTab('generator')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Generate Key</span>
            </button>
          </nav>
        </header>

        {/* Home Metrics KPI Bar */}
        <section className={`metrics-grid ${activeTab === 'generator' ? 'metrics-grid--hide-mobile' : ''}`} aria-label="Business Metrics Overview">
          {/* Primary Cards (Always visible on mobile & desktop) */}
          <div className="metric-card revenue-card">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-value">₹{totalRevenue.toLocaleString('en-IN')}</span>
            <span className="metric-hint">
              {paidLicenses.length} paid orders
              {unverifiedLicenses.length > 0 ? ` · ${unverifiedLicenses.length} unverified` : ''}
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Total Buyers</span>
            <span className="metric-value">{totalCustomers}</span>
            <span className="metric-hint">{adminLicenses.length} grants</span>
          </div>
          <div className="metric-card active-card">
            <span className="metric-label">Active Licenses</span>
            <span className="metric-value">{activeLicenses}</span>
            <span className="metric-hint">{disabledLicenses} disabled</span>
          </div>
          <div className="metric-card sales-today-card">
            <span className="metric-label">Today's Sales</span>
            <span className="metric-value">{todaysSales}</span>
            <span className="metric-hint">{thisWeekSales} this week</span>
          </div>

          {/* Secondary Cards (Desktop always, Mobile toggleable) */}
          <div className={`metric-card ${mobileMetricsExpanded ? 'metric-card--expanded-mobile' : 'metric-card--secondary-mobile'}`}>
            <span className="metric-label">Disabled</span>
            <span className="metric-value disabled-val">{disabledLicenses}</span>
            <span className="metric-hint">revoked</span>
          </div>
          <div className={`metric-card ${mobileMetricsExpanded ? 'metric-card--expanded-mobile' : 'metric-card--secondary-mobile'}`}>
            <span className="metric-label">Today's Activations</span>
            <span className="metric-value">{todaysActivations}</span>
            <span className="metric-hint">devices active</span>
          </div>
          <div className={`metric-card ${mobileMetricsExpanded ? 'metric-card--expanded-mobile' : 'metric-card--secondary-mobile'}`}>
            <span className="metric-label">Registered Devices</span>
            <span className="metric-value">{totalDevices}</span>
            <span className="metric-hint">{limitReachedLicenses} at limit</span>
          </div>

          {/* Mobile More Stats Toggle Pill */}
          <button
            type="button"
            className="mobile-metrics-toggle-pill"
            onClick={() => setMobileMetricsExpanded(!mobileMetricsExpanded)}
            aria-expanded={mobileMetricsExpanded}
          >
            <span>{mobileMetricsExpanded ? 'Show fewer stats' : 'More metrics (Devices, Revoked)'}</span>
            <svg
              className={`toggle-arrow ${mobileMetricsExpanded ? 'rotated' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </section>

        {/* TAB 1: Customer Directory View */}
        {activeTab === 'directory' && (
          <div className="directory-content-wrapper">
            {/* Search & Filter Bar */}
            <div className="controls-bar">
              <div className="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search email, name, key, UID, pay ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  aria-label="Search records"
                />
                {searchTerm && (
                  <button
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="filter-pills" role="toolbar" aria-label="Filter records">
                <button
                  className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All ({licenses.length})
                </button>
                <button
                  className={`filter-pill ${activeFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('active')}
                >
                  Active ({activeLicenses})
                </button>
                <button
                  className={`filter-pill ${activeFilter === 'paid' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('paid')}
                >
                  Paid ({paidLicenses.length})
                </button>
                <button
                  className={`filter-pill ${activeFilter === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('admin')}
                >
                  Grants ({adminLicenses.length})
                </button>
                {unverifiedLicenses.length > 0 && (
                  <button
                    className={`filter-pill ${activeFilter === 'unverified' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('unverified')}
                  >
                    Unverified ({unverifiedLicenses.length})
                  </button>
                )}
                <button
                  className={`filter-pill ${activeFilter === 'limit_reached' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('limit_reached')}
                >
                  Limit Reached ({limitReachedLicenses})
                </button>
                <button
                  className={`filter-pill ${activeFilter === 'disabled' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('disabled')}
                >
                  Disabled ({disabledLicenses})
                </button>
                <button
                  className={`filter-pill ${activeFilter === 'today' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('today')}
                >
                  Today ({todaysSales})
                </button>
                <button
                  className={`filter-pill ${activeFilter === 'this_week' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('this_week')}
                >
                  This Week ({thisWeekSales})
                </button>
              </div>
            </div>

            {/* Customer Table / Mobile Card List */}
            <div className="table-container">
              {loading ? (
                <div className="admin-loading-state">
                  <div className="spinner"></div>
                  <span>Loading records from secure database...</span>
                </div>
              ) : filteredLicenses.length === 0 ? (
                <div className="admin-empty-state">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <p>No licenses found matching your filter criteria.</p>
                  {(searchTerm || activeFilter !== 'all') && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setSearchTerm(''); setActiveFilter('all'); }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View (>= 769px) */}
                  <table className="admin-table desktop-only-table">
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
                        const maxDev = lic.maxDevices || 1;

                        return (
                          <tr key={lic.id || lic.licenseKey} className={selectedCustomer?.licenseKey === lic.licenseKey ? 'selected-row' : ''}>
                            <td>
                              <div className="customer-email-cell">
                                <span className="email-text">{lic.email || lic.customerName || 'Unassigned'}</span>
                                {lic.customerName && lic.email && <span className="name-subtext">{lic.customerName}</span>}
                                {lic.firebaseUid && <span className="uid-subtext">UID: {lic.firebaseUid.substring(0, 10)}...</span>}
                              </div>
                            </td>
                            <td>
                              {(() => {
                                const sourceInfo = getSourceInfo(lic);
                                return (
                                  <span className={`source-badge ${sourceInfo.badgeClass}`}>
                                    {sourceInfo.label}
                                  </span>
                                );
                              })()}
                            </td>
                            <td>
                              <div className="key-cell">
                                <code className="monospace">{lic.licenseKey}</code>
                                <button
                                  className="icon-copy-btn"
                                  title="Copy Key"
                                  onClick={() => copyToClipboard(lic.licenseKey, `table-${lic.licenseKey}`)}
                                >
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
                                Inspect Details →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Mobile Customer Cards View (<= 768px) */}
                  <div className="mobile-cards-list mobile-only-cards" role="feed" aria-label="Customer records list">
                    {filteredLicenses.map(lic => {
                      const status = lic.status || 'active';
                      const deviceCount = lic.registeredDevices?.length || 0;
                      const maxDev = lic.maxDevices || 1;

                      return (
                        <div
                          key={lic.id || lic.licenseKey}
                          className={`mobile-customer-card ${selectedCustomer?.licenseKey === lic.licenseKey ? 'selected-card' : ''} ${status === 'disabled' ? 'is-disabled' : ''}`}
                          onClick={() => setSelectedCustomer(lic)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Inspect ${lic.customerName || lic.email || lic.licenseKey}`}
                        >
                          {/* Top Identity & Status Row */}
                          <div className="mobile-card-header">
                            <div className="mobile-card-identity">
                              <span className="mobile-card-name">
                                {lic.customerName || lic.email || 'Unassigned License'}
                              </span>
                              {lic.customerName && lic.email && (
                                <span className="mobile-card-subemail">{lic.email}</span>
                              )}
                            </div>
                            <div className="mobile-card-status-col">
                              <span className={`status-badge-sm ${status === 'active' ? 'active' : 'disabled'}`}>
                                <span className="dot"></span>
                                {status === 'active' ? 'Active' : 'Disabled'}
                              </span>
                              <span className="mobile-card-shortdate">{formatShortDate(lic.purchaseDate)}</span>
                            </div>
                          </div>

                          {/* Quick Key Pill with 1-Tap Copy */}
                          <div className="mobile-card-key-pill" onClick={e => e.stopPropagation()}>
                            <div className="key-pill-content">
                              <span className="key-pill-prefix">KEY:</span>
                              <code className="monospace key-pill-code">{lic.licenseKey}</code>
                            </div>
                            <button
                              type="button"
                              className={`key-copy-touch-btn ${copiedField === `card-${lic.licenseKey}` ? 'copied' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(lic.licenseKey, `card-${lic.licenseKey}`);
                              }}
                              title="Copy License Key"
                              aria-label="Copy License Key"
                            >
                              {copiedField === `card-${lic.licenseKey}` ? (
                                <span className="copy-label">✓ Copied</span>
                              ) : (
                                <>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                  </svg>
                                  <span className="copy-label">Copy</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Meta Tags & Details Button */}
                          <div className="mobile-card-footer">
                            <div className="mobile-card-badges">
                              {(() => {
                                const sourceInfo = getSourceInfo(lic);
                                return (
                                  <span className={`source-badge ${sourceInfo.badgeClass}`}>
                                    {sourceInfo.label}
                                  </span>
                                );
                              })()}
                              <span className={`device-tag ${deviceCount >= maxDev ? 'limit' : ''}`}>
                                📱 {deviceCount}/{maxDev} Dev
                              </span>
                            </div>
                            <div className="mobile-inspect-arrow">
                              <span>Inspect Details</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Admin Tools (Manual License Generator) */}
        {activeTab === 'generator' && (
          <div className="generator-tab-container">
            <div className="generator-card glass-panel">
              <div className="generator-header">
                <div className="generator-icon-wrap">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div>
                  <h3>Manual License Generator</h3>
                  <p>Issue active Zero Velocity license keys for lifetime accounts, reviewers, beta testers, and customer support.</p>
                </div>
              </div>

              <form onSubmit={handleGenerateLicenseSubmit} className="generator-form">
                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="gen-customer-name">Customer Name (Optional)</label>
                    <input
                      id="gen-customer-name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={genName}
                      onChange={e => setGenName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="gen-customer-email">Customer Email (Optional)</label>
                    <input
                      id="gen-customer-email"
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={genEmail}
                      onChange={e => setGenEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="gen-license-type">License Type</label>
                    <select id="gen-license-type" value={genType} onChange={e => setGenType(e.target.value)}>
                      <option value="Lifetime">Lifetime Account</option>
                      <option value="Beta Tester">Beta Tester</option>
                      <option value="Reviewer">Reviewer / Creator</option>
                      <option value="Giveaway">Giveaway Winner</option>
                      <option value="Internal">Internal / Testing</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gen-max-devices">Max Allowed Devices</label>
                    <select id="gen-max-devices" value={genMaxDevices} onChange={e => setGenMaxDevices(e.target.value)}>
                      <option value="1">1 Device (Default)</option>
                      <option value="2">2 Devices</option>
                      <option value="3">3 Devices</option>
                      <option value="5">5 Devices</option>
                      <option value="10">10 Devices (Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="gen-notes">Notes / Justification (Optional)</label>
                  <textarea
                    id="gen-notes"
                    rows="2"
                    placeholder="e.g. Granted key for YouTube reviewer video sponsorship"
                    value={genNotes}
                    onChange={e => setGenNotes(e.target.value)}
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary generate-submit-btn" disabled={genLoading}>
                    {genLoading ? (
                      <span className="submit-loading-text">
                        <span className="spinner-inline"></span>
                        Generating License...
                      </span>
                    ) : (
                      '✨ Generate Active License Key'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Generated Key Success Modal */}
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
                  {copiedField === 'new-key' ? '✓ Copied to Clipboard!' : 'Copy License Key'}
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

        {/* Customer Details Drawer / Mobile Bottom Sheet */}
        {selectedCustomer && (
          <div className="customer-drawer-backdrop" onClick={() => setSelectedCustomer(null)}>
            <div className="customer-drawer glass-panel animate-slide-left" onClick={e => e.stopPropagation()}>
              {/* Drawer Sticky Header */}
              <div className="drawer-header">
                <button
                  className="drawer-back-btn"
                  onClick={() => setSelectedCustomer(null)}
                  aria-label="Back to Customer Directory"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  <span>Back to List</span>
                </button>

                <h3 className="drawer-title">Customer Details</h3>

                <button
                  className="drawer-close-btn"
                  onClick={() => setSelectedCustomer(null)}
                  aria-label="Close details"
                  title="Close"
                >
                  ×
                </button>
              </div>

              <div className="drawer-body">
                {/* Status Banner */}
                <div className={`drawer-status-banner ${selectedCustomer.status === 'disabled' ? 'disabled' : 'active'}`}>
                  <div className="drawer-status-main">
                    <span className="status-indicator-dot"></span>
                    <span className="status-title">
                      {selectedCustomer.status === 'disabled' ? 'LICENSE REVOKED / DISABLED' : 'ACTIVE LICENSE'}
                    </span>
                  </div>
                  <span className="status-sub">
                    {(() => {
                      const sInfo = getSourceInfo(selectedCustomer);
                      if (sInfo.type === 'admin') return 'Source: Admin Grant';
                      if (sInfo.isPaid && sInfo.amount !== null) return `Source: Razorpay Purchase (₹${sInfo.amount})`;
                      return 'Source: Unverified / Test Record';
                    })()}
                  </span>
                </div>

                {/* Primary Data Section */}
                <div className="drawer-section">
                  <h4>Account & Purchase Information</h4>
                  {selectedCustomer.customerName && (
                    <div className="data-row">
                      <span className="label">Customer Name:</span>
                      <span className="value">{selectedCustomer.customerName}</span>
                    </div>
                  )}
                  <div className="data-row">
                    <span className="label">Customer Email:</span>
                    <div className="value-with-copy">
                      <span className="value selectable">{selectedCustomer.email || 'N/A'}</span>
                      {selectedCustomer.email && (
                        <button
                          type="button"
                          className="btn-text-copy"
                          onClick={() => copyToClipboard(selectedCustomer.email, 'drawer-email')}
                        >
                          {copiedField === 'drawer-email' ? '✓ Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="data-row">
                    <span className="label">Firebase UID:</span>
                    <div className="value-with-copy">
                      <span className="value monospace selectable">{selectedCustomer.firebaseUid || 'N/A'}</span>
                      {selectedCustomer.firebaseUid && (
                        <button
                          type="button"
                          className="btn-text-copy"
                          onClick={() => copyToClipboard(selectedCustomer.firebaseUid, 'drawer-uid')}
                        >
                          {copiedField === 'drawer-uid' ? '✓ Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="data-row highlight-row">
                    <span className="label">License Key:</span>
                    <div className="value-with-copy">
                      <code className="value monospace highlight selectable">{selectedCustomer.licenseKey}</code>
                      <button
                        type="button"
                        className="btn-text-copy"
                        onClick={() => copyToClipboard(selectedCustomer.licenseKey, 'drawer-key')}
                      >
                        {copiedField === 'drawer-key' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="data-row">
                    <span className="label">License Type:</span>
                    <span className="value">{selectedCustomer.licenseType || 'Lifetime'}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Payment ID:</span>
                    <div className="value-with-copy">
                      <span className="value monospace">{selectedCustomer.razorpayPaymentId || 'N/A'}</span>
                      {selectedCustomer.razorpayPaymentId && (
                        <button
                          type="button"
                          className="btn-text-copy"
                          onClick={() => copyToClipboard(selectedCustomer.razorpayPaymentId, 'drawer-payid')}
                        >
                          {copiedField === 'drawer-payid' ? '✓ Copied' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                  {selectedCustomer.razorpayOrderId && (
                    <div className="data-row">
                      <span className="label">Order ID:</span>
                      <div className="value-with-copy">
                        <span className="value monospace">{selectedCustomer.razorpayOrderId}</span>
                        <button
                          type="button"
                          className="btn-text-copy"
                          onClick={() => copyToClipboard(selectedCustomer.razorpayOrderId, 'drawer-orderid')}
                        >
                          {copiedField === 'drawer-orderid' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="data-row">
                    <span className="label">Purchase Date:</span>
                    <span className="value">{formatDate(selectedCustomer.purchaseDate)}</span>
                  </div>
                  {(() => {
                    const sInfo = getSourceInfo(selectedCustomer);
                    if (sInfo.isPaid && sInfo.amount !== null) {
                      return (
                        <div className="data-row">
                          <span className="label">Payment Amount:</span>
                          <span className="value highlight font-semibold">₹{sInfo.amount} {selectedCustomer.currency ? `(${selectedCustomer.currency})` : '(INR)'}</span>
                        </div>
                      );
                    }
                    if (sInfo.type === 'unverified') {
                      return (
                        <div className="data-row">
                          <span className="label">Payment Verification:</span>
                          <span className="value unverified-text">⚠️ Unverified Transaction (Excluded from revenue)</span>
                        </div>
                      );
                    }
                    return null;
                  })()}
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
                    <h4>Registered Devices ({(selectedCustomer.registeredDevices || []).length}/{selectedCustomer.maxDevices || 1})</h4>
                    {(selectedCustomer.registeredDevices || []).length > 0 && (
                      <button
                        className="btn btn-warning btn-xs reset-devices-top-btn"
                        onClick={() => handleAdminAction('reset_devices', selectedCustomer.licenseKey)}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Resetting...' : 'Reset Devices'}
                      </button>
                    )}
                  </div>

                  {(selectedCustomer.registeredDevices || []).length === 0 ? (
                    <div className="empty-devices-box">
                      <p className="empty-subtext">No devices activated yet. Ready for first installation.</p>
                    </div>
                  ) : (
                    <div className="devices-list">
                      {selectedCustomer.registeredDevices.map((dev, i) => (
                        <div className="device-card" key={dev.deviceId || i}>
                          <div className="device-header">
                            <span className="device-name">💻 {dev.deviceName || 'Desktop Computer'}</span>
                            <span className="device-id-code">{dev.deviceId?.substring(0, 14)}...</span>
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
                  <h4>Admin Controls</h4>
                  <div className="action-buttons-grid">
                    {selectedCustomer.status === 'disabled' ? (
                      <button
                        className="btn btn-success action-btn-touch"
                        onClick={() => handleAdminAction('enable_license', selectedCustomer.licenseKey)}
                        disabled={actionLoading}
                      >
                        ✓ Enable License
                      </button>
                    ) : (
                      <button
                        className="btn btn-danger action-btn-touch"
                        onClick={() => handleAdminAction('disable_license', selectedCustomer.licenseKey)}
                        disabled={actionLoading}
                      >
                        ⛔ Disable / Revoke License
                      </button>
                    )}

                    <button
                      className="btn btn-secondary action-btn-touch"
                      onClick={() => handleAdminAction('reset_devices', selectedCustomer.licenseKey)}
                      disabled={actionLoading}
                    >
                      🔄 Reset Device Slots
                    </button>

                    <button
                      className="btn btn-secondary action-btn-touch"
                      onClick={() => copyToClipboard(selectedCustomer.licenseKey, 'btn-key')}
                    >
                      {copiedField === 'btn-key' ? '✓ Key Copied!' : '📋 Copy License Key'}
                    </button>

                    <button
                      className="btn btn-secondary action-btn-touch"
                      onClick={() => copyToClipboard(selectedCustomer.email, 'btn-email')}
                    >
                      {copiedField === 'btn-email' ? '✓ Email Copied!' : '✉️ Copy Customer Email'}
                    </button>
                  </div>

                  <div className="delete-hazard-zone">
                    <button
                      className="btn btn-outline-danger btn-sm delete-btn-touch"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      🗑️ Delete Test License
                    </button>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="drawer-section">
                  <h4>Activity Audit Trail</h4>
                  <div className="activity-timeline">
                    <div className="timeline-item">
                      <span className="timeline-dot blue"></span>
                      <div className="timeline-content">
                        <strong>License Created ({selectedCustomer.source === 'admin' ? 'Admin Grant' : 'Razorpay Purchase'})</strong>
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
              <div className="confirm-warning-icon">⚠️</div>
              <h3>Confirm Delete License</h3>
              <p>Are you sure you want to permanently delete license:</p>
              <code className="monospace confirm-key-preview">{selectedCustomer.licenseKey}</code>
              <p className="warning-text">This action cannot be undone. Any active installations using this key will immediately be deactivated.</p>
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
