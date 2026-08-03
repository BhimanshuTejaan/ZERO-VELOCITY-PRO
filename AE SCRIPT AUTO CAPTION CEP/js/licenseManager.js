(function () {
  "use strict";

  var STORAGE_KEY = "zv_license_key";
  var OFFLINE_TOKEN_KEY = "zv_offline_token";
  var SECRET_SALT = "zv_offline_grace_secret_key_2026";

  /**
   * Pure JS SHA-256 implementation for offline token signature verification
   */
  function sha256(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var i, j;
    var result = '';
    var words = [];
    var asciiBitLength = ascii.length * 8;
    var hash = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    var k = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    ascii += '\x80';
    while (ascii.length % 64 !== 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return '';
      words[i >> 2] |= j << ((3 - i) % 4 * 8);
    }
    words[words.length] = ((asciiBitLength / maxWord) | 0);
    words[words.length] = (asciiBitLength | 0);

    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash.slice(0);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
            w[i - 16]
            + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
            + w[i - 7]
            + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
          ) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
        hash.pop();
      }
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += (b < 16 ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  function hexToAscii(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
  }

  function hmacSha256(key, message) {
    if (key.length > 64) {
      key = sha256(key);
    }
    var ipad = '', opad = '';
    for (var i = 0; i < 64; i++) {
      var k = i < key.length ? key.charCodeAt(i) : 0;
      ipad += String.fromCharCode(k ^ 0x36);
      opad += String.fromCharCode(k ^ 0x5c);
    }
    return sha256(opad + hexToAscii(sha256(ipad + message)));
  }

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

  function validateOfflineToken() {
    var rawToken = localStorage.getItem(OFFLINE_TOKEN_KEY);
    if (!rawToken) {
      return { valid: false, reason: "No offline validation token found." };
    }

    try {
      var token = JSON.parse(rawToken);
      if (!token || !token.licenseKey || !token.issuedAt || !token.signature) {
        return { valid: false, reason: "Corrupted offline token structure." };
      }

      var currentDeviceId = window.ZeroVelocityDeviceHelper ? window.ZeroVelocityDeviceHelper.getDeviceId() : "";
      if (token.deviceId && currentDeviceId && token.deviceId !== currentDeviceId) {
        return { valid: false, reason: "Offline token belongs to a different computer." };
      }

      var period = typeof token.gracePeriodDays === "number" ? token.gracePeriodDays : 7;
      var rawPayload = token.licenseKey + ":" + token.deviceId + ":" + token.issuedAt + ":" + period;
      var expectedSig = hmacSha256(SECRET_SALT, rawPayload);

      if (token.signature !== expectedSig) {
        return { valid: false, reason: "Offline token signature verification failed (tampered token)." };
      }

      var issuedTime = Date.parse(token.issuedAt);
      var nowTime = Date.now();

      if (nowTime < issuedTime) {
        return { valid: false, reason: "System clock manipulation detected." };
      }

      var elapsedDays = (nowTime - issuedTime) / (1000 * 60 * 60 * 24);
      if (elapsedDays > period) {
        return {
          valid: false,
          expired: true,
          reason: "Offline grace period expired. Please connect to the internet to verify your license."
        };
      }

      return { valid: true, token: token };
    } catch (_errToken) {
      return { valid: false, reason: "Failed to parse offline token." };
    }
  }

  function showOverlay() {
    var overlay = document.getElementById("licenseOverlay");
    if (overlay) {
      overlay.classList.remove("unlocking");
      overlay.classList.remove("hidden");
    }
  }

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
          // Network Error / Offline Mode -> Validate Offline Token Grace Period
          var offlineCheck = validateOfflineToken();
          if (offlineCheck.valid) {
            console.log("🟢 [Offline Grace Period] Valid token detected. Unlocking plugin offline.");
            setStatus("Offline Mode - License Verified", false);
            dispatchActivationEvent(offlineCheck.token);
            setTimeout(function () {
              hideOverlay();
            }, 400);
            return;
          } else {
            console.warn("❌ [Offline Grace Period] Fail:", offlineCheck.reason);
            if (offlineCheck.expired) {
              setStatus("Offline grace period expired. Please connect to the internet to verify your license.", true);
            } else {
              setStatus(errResult.error || "Network error: Unable to reach verification server.", true);
            }
            showOverlay();
            return;
          }
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
      setStatus("License verified! Unlocking plugin...", false);
      dispatchActivationEvent(licenseInfo);

      setTimeout(function () {
        hideOverlay();
      }, 400);
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
    validateOfflineToken: validateOfflineToken
  };
}());
