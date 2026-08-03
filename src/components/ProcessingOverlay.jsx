import React, { useState, useEffect } from 'react';
import './ProcessingOverlay.css';

export default function ProcessingOverlay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setIsProcessing(true);
      setErrorDetails(null);
      setIsRetrying(false);
    };

    const handleSuccess = () => {
      // Delay closing slightly for a smooth transition to LicenseModal
      setTimeout(() => {
        setIsProcessing(false);
        setErrorDetails(null);
        setIsRetrying(false);
      }, 400);
    };

    const handleError = (e) => {
      setIsProcessing(false);
      setErrorDetails(e.detail || { error: "Verification failed." });
      setIsRetrying(false);
    };

    window.addEventListener('zero-velocity-payment-processing-start', handleStart);
    window.addEventListener('zero-velocity-payment-processing-success', handleSuccess);
    window.addEventListener('zero-velocity-payment-processing-error', handleError);

    return () => {
      window.removeEventListener('zero-velocity-payment-processing-start', handleStart);
      window.removeEventListener('zero-velocity-payment-processing-success', handleSuccess);
      window.removeEventListener('zero-velocity-payment-processing-error', handleError);
    };
  }, []);

  const handleRetry = async () => {
    if (!errorDetails?.retryPayload) return;

    setIsRetrying(true);
    setIsProcessing(true);
    const payload = errorDetails.retryPayload;
    setErrorDetails(null);

    const startTime = performance.now();
    try {
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await verifyRes.json();
      const duration = Math.round(performance.now() - startTime);

      if (data.success) {
        console.log(`⏱️ Retry Payment Verification Duration: ${duration} ms`);
        console.log("🎉 License Created & Stored in Firestore:", data.licenseKey);
        
        window.dispatchEvent(new CustomEvent('zero-velocity-payment-processing-success', {
          detail: { licenseKey: data.licenseKey, duration }
        }));
        
        window.dispatchEvent(new CustomEvent('zero-velocity-license-issued', {
          detail: { licenseKey: data.licenseKey }
        }));
      } else {
        console.error(`⏱️ Retry Verification Failed after ${duration} ms:`, data.error);
        setIsProcessing(false);
        setErrorDetails({
          error: data.error || "Retry verification failed.",
          retryPayload: payload
        });
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      console.error(`⏱️ Network error during retry after ${duration} ms:`, err);
      setIsProcessing(false);
      setErrorDetails({
        error: "Network error contacting verification server.",
        retryPayload: payload
      });
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isProcessing && !errorDetails) return null;

  return (
    <div className="processing-overlay-backdrop animate-fade-in" tabIndex="-1">
      {isProcessing && (
        <div className="processing-card glass-panel animate-scale-up">
          {/* Animated Glowing Ring & Spinner */}
          <div className="spinner-container">
            <div className="pulse-glow-ring"></div>
            <div className="main-spinner"></div>
            <div className="inner-shield-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
          </div>

          <h2 className="processing-title">Activating your license...</h2>
          <div className="processing-subtitle-badge">
            <span className="warning-dot"></span>
            Please don't close this window.
          </div>
          <p className="processing-description">
            We're securely verifying your payment, generating your license, and preparing everything for you.
          </p>

          <div className="processing-steps">
            <div className="step-item active">
              <span className="step-check">✓</span>
              <span>Payment Authorized</span>
            </div>
            <div className="step-item active pulse">
              <span className="step-spinner-dot"></span>
              <span>Verifying Signature & Storing License</span>
            </div>
          </div>
        </div>
      )}

      {!isProcessing && errorDetails && (
        <div className="processing-error-card glass-panel animate-scale-up">
          <div className="error-icon-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>

          <h2 className="error-title">Payment Verification Issue</h2>
          <p className="error-description">
            {errorDetails.error || "We could not verify your payment signature. Please try clicking Retry below."}
          </p>

          <div className="error-actions">
            {errorDetails.retryPayload && (
              <button 
                className="btn btn-primary retry-btn" 
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? "Retrying..." : "Retry Verification"}
              </button>
            )}
            <button 
              className="btn btn-secondary close-error-btn" 
              onClick={() => setErrorDetails(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
