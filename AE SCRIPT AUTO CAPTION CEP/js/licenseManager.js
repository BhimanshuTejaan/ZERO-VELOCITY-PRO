(function () {
  "use strict";

  var STORAGE_KEY = "zv_license_key";
  var OFFLINE_TOKEN_KEY = "zv_offline_token";

  // Ed25519 Public Key (Public verification key embedded in client)
  var ED25519_PUBLIC_KEY = "8f906e546a99bccf5e25f6a268e1c9cd013a8e53ef34ea98a0a7810b05c46b27";

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

  function saveOfflineToken(tokenObj) {
    if (tokenObj) {
      localStorage.setItem(OFFLINE_TOKEN_KEY, JSON.stringify(tokenObj));
    }
  }

  function removeStoredActivation() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OFFLINE_TOKEN_KEY);
  }

  /**
   * Asynchronously validates the cached offline token using Ed25519 Public Key.
   */
  function validateOfflineToken(callback) {
    var rawToken = localStorage.getItem(OFFLINE_TOKEN_KEY);
    if (!rawToken) {
      callback({ valid: false, reason: "No offline validation token found." });
      return;
    }

    try {
      var token = JSON.parse(rawToken);
      if (!token || !token.licenseKey || !token.issuedAt || !token.signature) {
        callback({ valid: false, reason: "Corrupted offline token structure." });
        return;
      }

      var currentDeviceId = window.ZeroVelocityDeviceHelper ? window.ZeroVelocityDeviceHelper.getDeviceId() : "";
      if (token.deviceId && currentDeviceId && token.deviceId !== currentDeviceId) {
        callback({ valid: false, reason: "Offline token belongs to a different computer." });
        return;
      }

      var period = typeof token.gracePeriodDays === "number" ? token.gracePeriodDays : 7;
      var rawPayload = token.licenseKey + ":" + token.deviceId + ":" + token.issuedAt + ":" + period;

      var issuedTime = Date.parse(token.issuedAt);
      var nowTime = Date.now();

      if (nowTime < issuedTime) {
        callback({ valid: false, reason: "System clock manipulation detected." });
        return;
      }

      var elapsedDays = (nowTime - issuedTime) / (1000 * 60 * 60 * 24);
      if (elapsedDays > period) {
        callback({
          valid: false,
          expired: true,
          reason: "Offline grace period expired. Please connect to the internet to verify your license."
        });
        return;
      }

      // Perform Ed25519 Asymmetric Public Key Verification
      if (window.ZeroVelocityEd25519 && typeof window.ZeroVelocityEd25519.verify === "function") {
        window.ZeroVelocityEd25519.verify(ED25519_PUBLIC_KEY, rawPayload, token.signature, function (isValid) {
          if (isValid) {
            callback({ valid: true, token: token });
          } else {
            console.warn("❌ Ed25519 signature verification failed (tampered token).");
            callback({ valid: false, reason: "Offline token signature verification failed (tampered token)." });
          }
        });
      } else {
        console.warn("⚠️ Ed25519 verifier unavailable.");
        callback({ valid: false, reason: "Offline verification module unavailable." });
      }
    } catch (_errToken) {
      callback({ valid: false, reason: "Failed to parse offline token." });
    }
  }

  function showOverlay() {
    var overlay = document.getElementById("licenseOverlay");
    if (overlay) {
      overlay.classList.remove("unlocking");
      overlay.classList.remove("hidden");
    }
    var successOverlay = document.getElementById("licenseSuccessOverlay");
    if (successOverlay) {
      successOverlay.classList.add("hidden");
    }
  }

  function hideOverlay() {
    var overlay = document.getElementById("licenseOverlay");
    if (overlay && !overlay.classList.contains("hidden")) {
      overlay.classList.add("unlocking");
      setTimeout(function () {
        overlay.classList.add("hidden");
        overlay.classList.remove("unlocking");
      }, 350);
    }
    var successOverlay = document.getElementById("licenseSuccessOverlay");
    if (successOverlay && !successOverlay.classList.contains("hidden")) {
      successOverlay.classList.add("unlocking");
      setTimeout(function () {
        successOverlay.classList.add("hidden");
        successOverlay.classList.remove("unlocking");
      }, 350);
    }
  }

  /**
   * Displays the premium License Activation Success Modal
   */
  function showSuccessModal(licenseInfo, callbackOnClose) {
    var overlay = document.getElementById("licenseSuccessOverlay");
    if (!overlay) {
      if (typeof callbackOnClose === "function") callbackOnClose();
      return;
    }

    var prodEl = document.getElementById("successProduct");
    var keyEl = document.getElementById("successLicenseKey");
    var verEl = document.getElementById("successVersion");
    var dateEl = document.getElementById("successPurchaseDate");
    var devEl = document.getElementById("successDeviceName");

    if (prodEl) prodEl.textContent = licenseInfo.product || "Zero Velocity Caption Designer";
    if (keyEl) keyEl.textContent = licenseInfo.licenseKey || "ZV-ACTIVE";
    if (verEl) verEl.textContent = licenseInfo.version || "1.0.0";
    if (dateEl) {
      if (licenseInfo.purchaseDate) {
        try {
          var d = new Date(licenseInfo.purchaseDate);
          dateEl.textContent = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        } catch (_errD) {
          dateEl.textContent = "Active";
        }
      } else {
        dateEl.textContent = "Active";
      }
    }
    if (devEl) {
      devEl.textContent = (window.ZeroVelocityDeviceHelper && window.ZeroVelocityDeviceHelper.getDeviceName()) || "Computer";
    }

    // Hide input activation overlay
    var inputOverlay = document.getElementById("licenseOverlay");
    if (inputOverlay) {
      inputOverlay.classList.add("hidden");
    }

    // Show success overlay smoothly
    overlay.classList.remove("unlocking");
    overlay.classList.remove("hidden");

    var continueBtn = document.getElementById("continueToPluginBtn");
    var copyBtn = document.getElementById("copyLicenseKeyBtn");

    if (copyBtn) {
      copyBtn.onclick = function () {
        var keyToCopy = licenseInfo.licenseKey || (keyEl && keyEl.textContent) || "";
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          navigator.clipboard.writeText(keyToCopy).then(function () {
            var copyText = document.getElementById("copyKeyText");
            if (copyText) {
              copyText.textContent = "Copied!";
              setTimeout(function () { copyText.textContent = "Copy"; }, 2000);
            }
          });
        }
      };
    }

    if (continueBtn) {
      continueBtn.onclick = function () {
        overlay.classList.add("unlocking");
        setTimeout(function () {
          overlay.classList.add("hidden");
          overlay.classList.remove("unlocking");
          if (typeof callbackOnClose === "function") callbackOnClose();
        }, 350);
      };
    }
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
      // Gracefully ignore
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

    var payload = {
      licenseKey: licenseKey,
      deviceId: deviceId,
      deviceName: deviceName
    };

    console.log("==========================================");
    console.log("🚀 [Plugin License Manager] Sending Request");
    console.log("URL:", endpoint);
    console.log("Method: POST");
    console.log("Body Payload:", JSON.stringify(payload, null, 2));
    console.log("==========================================");

    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var data = JSON.parse(xhr.responseText);
            console.log("📥 [Plugin License Manager] Received Response:", JSON.stringify(data, null, 2));
            if (data.success) {
              callback(null, data);
            } else {
              callback({ isServerError: true, error: data.error || "License verification failed." });
            }
          } catch (_errParse) {
            callback({ isServerError: true, error: "Invalid server response format." });
          }
        } else {
          try {
            var errData = JSON.parse(xhr.responseText);
            console.warn("⚠️ [Plugin License Manager] Server Error Response (HTTP " + xhr.status + "):", JSON.stringify(errData, null, 2));
            callback({ isServerError: true, error: errData.error || ("Verification failed (HTTP " + xhr.status + ").") });
          } catch (_errHttp) {
            callback({ isServerError: true, error: "Failed to connect to verification server (HTTP " + xhr.status + ")." });
          }
        }
      }
    };
    xhr.onerror = function () {
      console.warn("🌐 [Plugin License Manager] Network unreachable. Triggering offline grace period check.");
      callback({ isNetworkError: true, error: "Network error: Unable to reach verification server." });
    };
    xhr.send(JSON.stringify(payload));
  }

  function activate(licenseKey, isAutomaticCheck) {
    var cleanKey = (licenseKey || "").trim().toUpperCase();
    if (!cleanKey) {
      setStatus("Please enter your license key.", true);
      return;
    }

    setButtonLoading(true);
    setStatus(isAutomaticCheck ? "Verifying saved license..." : "Verifying license with server...", false);

    verifyWithBackend(cleanKey, function (errResult, data) {
      setButtonLoading(false);

      if (errResult) {
        if (errResult.isNetworkError) {
          // Network Error / Offline Mode -> Validate Offline Token Grace Period asynchronously via Ed25519
          validateOfflineToken(function (offlineCheck) {
            if (offlineCheck.valid) {
              console.log("🟢 [Offline Grace Period] Valid Ed25519 token signature verified. Unlocking plugin offline.");
              setStatus("Offline Mode - License Verified", false);
              dispatchActivationEvent(offlineCheck.token);
              setTimeout(function () {
                hideOverlay();
              }, 400);
            } else {
              console.warn("❌ [Offline Grace Period] Fail:", offlineCheck.reason);
              if (offlineCheck.expired) {
                setStatus("Offline grace period expired. Please connect to the internet to verify your license.", true);
              } else {
                setStatus(errResult.error || "Network error: Unable to reach verification server.", true);
              }
              showOverlay();
            }
          });
          return;
        } else {
          // Server Rejection (HTTP 403 Revoked / 404 Invalid) -> Purge Local Token
          console.warn("❌ [Server Rejection] Purging local token cache.");
          removeStoredActivation();
          setStatus(errResult.error || "License verification failed.", true);
          showOverlay();
          return;
        }
      }

      // Online Backend Verification Success
      var licenseInfo = (data && data.license) || { licenseKey: cleanKey, status: "active" };
      saveActivationLocally(licenseInfo.licenseKey || cleanKey);
      if (data && data.offlineToken) {
        saveOfflineToken(data.offlineToken);
      }
      dispatchActivationEvent(licenseInfo);

      if (isAutomaticCheck) {
        // Automatic startup check -> seamless unlock
        setStatus("License verified! Unlocking plugin...", false);
        setTimeout(function () {
          hideOverlay();
        }, 400);
      } else {
        // Manual user activation -> display professional Success Modal
        showSuccessModal(licenseInfo, function () {
          hideOverlay();
        });
      }
    });
  }

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
    hideOverlay: hideOverlay,
    showSuccessModal: showSuccessModal,
    validateOfflineToken: validateOfflineToken
  };
}());
