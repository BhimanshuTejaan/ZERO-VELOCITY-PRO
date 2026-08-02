(function () {
  "use strict";

  var STORAGE_KEY = "zv_license_key";

  /**
   * Fetch backend endpoint URL from central window.ZeroVelocityConfig
   */
  function getBackendEndpoint() {
    if (window.ZeroVelocityConfig && typeof window.ZeroVelocityConfig.getApiEndpoint === "function") {
      return window.ZeroVelocityConfig.getApiEndpoint("/api/verify-license");
    }
    if (window.ZV_BACKEND_URL) {
      var base = window.ZV_BACKEND_URL.replace(/\/$/, "");
      return base.endsWith("/api/verify-license") ? base : base + "/api/verify-license";
    }
    return "https://zero-velocity-eta.vercel.app/api/verify-license";
  }

  function getStoredKey() {
    return localStorage.getItem(STORAGE_KEY) || "";
  }

  function saveActivationLocally(key) {
    localStorage.setItem(STORAGE_KEY, key.trim().toUpperCase());
  }

  function removeStoredActivation() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function showOverlay() {
    var overlay = document.getElementById("licenseOverlay");
    if (overlay) {
      overlay.classList.remove("unlocking");
      overlay.classList.remove("hidden");
    }
  }

  /**
   * Smoothly hide overlay using CSS transition before setting display: none
   */
  function hideOverlay() {
    var overlay = document.getElementById("licenseOverlay");
    if (!overlay) return;
    if (overlay.classList.contains("hidden")) return;

    overlay.classList.add("unlocking");
    setTimeout(function () {
      overlay.classList.add("hidden");
      overlay.classList.remove("unlocking");
    }, 350);
  }

  function setStatus(msg, isError) {
    var statusEl = document.getElementById("licenseStatusMsg");
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "license-status-msg " + (isError ? "error" : "success");
    if (!msg) {
      statusEl.className = "license-status-msg";
    }
  }

  function setButtonLoading(loading) {
    var btn = document.getElementById("activateLicenseBtn");
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Verifying..." : "Activate License";
  }

  /**
   * Broadcast custom event 'zv:activated' on window for transparent listeners
   */
  function dispatchActivationEvent(licenseData) {
    try {
      if (typeof window.CustomEvent === "function") {
        var event = new CustomEvent("zv:activated", {
          detail: licenseData || {},
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(event);
      }
    } catch (_errEvt) {
      // Gracefully ignore event dispatch if environment does not support CustomEvent
    }
  }

  function verifyWithBackend(licenseKey, callback) {
    var endpoint = getBackendEndpoint();
    var deviceId = "";
    var deviceName = "";

    if (window.ZeroVelocityDeviceHelper) {
      deviceId = window.ZeroVelocityDeviceHelper.getDeviceId();
      deviceName = window.ZeroVelocityDeviceHelper.getDeviceName();
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var data = JSON.parse(xhr.responseText);
            if (data.success) {
              callback(null, data);
            } else {
              callback(data.error || "License verification failed.");
            }
          } catch (_errParse) {
            callback("Invalid server response format.");
          }
        } else {
          try {
            var errData = JSON.parse(xhr.responseText);
            callback(errData.error || "Verification failed (HTTP " + xhr.status + ").");
          } catch (_errHttp) {
            callback("Failed to connect to verification server (HTTP " + xhr.status + ").");
          }
        }
      }
    };
    xhr.onerror = function () {
      callback("Network error: Unable to reach verification server. Please check connection.");
    };
    xhr.send(JSON.stringify({
      licenseKey: licenseKey,
      deviceId: deviceId,
      deviceName: deviceName
    }));
  }

  function activate(licenseKey, isAutomaticCheck) {
    var cleanKey = (licenseKey || "").trim().toUpperCase();
    if (!cleanKey) {
      setStatus("Please enter your license key.", true);
      return;
    }

    setButtonLoading(true);
    setStatus(isAutomaticCheck ? "Verifying saved license..." : "Verifying license with server...", false);

    verifyWithBackend(cleanKey, function (err, data) {
      setButtonLoading(false);
      if (err) {
        // Backend rejected license -> purge local cache and keep overlay locked
        removeStoredActivation();
        setStatus(err, true);
        showOverlay();
        return;
      }
      // Backend confirmed license -> cache key, emit event, and unlock plugin smoothly
      var licenseInfo = (data && data.license) || { licenseKey: cleanKey, status: "active" };
      saveActivationLocally(licenseInfo.licenseKey || cleanKey);
      setStatus("License verified! Unlocking plugin...", false);
      dispatchActivationEvent(licenseInfo);

      setTimeout(function () {
        hideOverlay();
      }, 400);
    });
  }

  /**
   * Startup verification flow:
   * 1. Show overlay (plugin starts locked).
   * 2. Read stored key from localStorage (convenience cache).
   * 3. Send stored key + deviceId to /api/verify-license for real-time proof.
   * 4. Unlock smoothly on backend confirmation; clear cache & show error on rejection/limit.
   */
  function init() {
    showOverlay();

    var activateBtn = document.getElementById("activateLicenseBtn");
    var keyInput = document.getElementById("licenseKeyInput");

    if (activateBtn && keyInput) {
      activateBtn.addEventListener("click", function () {
        activate(keyInput.value, false);
      });
      keyInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          activate(keyInput.value, false);
        }
      });
    }

    var cachedKey = getStoredKey();
    if (cachedKey) {
      if (keyInput) {
        keyInput.value = cachedKey;
      }
      activate(cachedKey, true);
    }
  }

  window.ZeroVelocityLicenseManager = {
    init: init,
    getStoredKey: getStoredKey,
    activate: activate,
    showOverlay: showOverlay,
    hideOverlay: hideOverlay
  };
}());
