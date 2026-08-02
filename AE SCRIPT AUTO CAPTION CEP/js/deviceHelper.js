(function () {
  "use strict";

  var DEVICE_STORAGE_KEY = "zv_device_id";

  /**
   * Generates a deterministic 32-bit alphanumeric string hash from a string.
   */
  function getSimpleHash(str) {
    var hash = 0;
    if (!str || str.length === 0) return "000000";
    for (var i = 0; i < str.length; i += 1) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36).toUpperCase();
  }

  /**
   * Obtains or generates a stable hardware-bound device ID.
   * Uses Node.js 'os' module in CEP environment to form a deterministic fingerprint.
   */
  function getDeviceId() {
    var cachedId = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (cachedId) {
      return cachedId;
    }

    var rawFingerprint = "";
    try {
      if (typeof require === "function") {
        var os = require("os");
        var hostname = os.hostname() || "";
        var platform = os.platform() || "";
        var arch = os.arch() || "";
        var username = "";
        if (typeof os.userInfo === "function") {
          try {
            var info = os.userInfo();
            username = (info && info.username) || "";
          } catch (_errInfo) {
            username = "";
          }
        }
        rawFingerprint = hostname + ":" + platform + ":" + arch + ":" + username;
      }
    } catch (_errNode) {
      rawFingerprint = "";
    }

    if (!rawFingerprint) {
      rawFingerprint = (navigator.userAgent || "") + ":" + (navigator.language || "");
    }

    var generatedId = "DEV-" + getSimpleHash(rawFingerprint) + "-" + getSimpleHash(rawFingerprint + "ZV");
    localStorage.setItem(DEVICE_STORAGE_KEY, generatedId);
    return generatedId;
  }

  /**
   * Obtains a human-readable device name (e.g. "Bhimanshu-PC (Windows)").
   */
  function getDeviceName() {
    try {
      if (typeof require === "function") {
        var os = require("os");
        var hostname = os.hostname() || "Computer";
        var platform = os.platform() || "";
        var platformName = platform === "win32" ? "Windows" : (platform === "darwin" ? "macOS" : platform);
        return hostname + " (" + platformName + ")";
      }
    } catch (_errName) {
      // Fallback
    }
    return "Adobe CEP Client";
  }

  window.ZeroVelocityDeviceHelper = {
    getDeviceId: getDeviceId,
    getDeviceName: getDeviceName
  };
}());
