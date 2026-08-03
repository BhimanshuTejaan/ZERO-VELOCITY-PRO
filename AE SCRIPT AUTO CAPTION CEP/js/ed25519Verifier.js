(function () {
  "use strict";

  function hexToUint8(hex) {
    if (!hex || typeof hex !== "string") return new Uint8Array(0);
    var cleanHex = hex.replace(/[^0-9a-fA-F]/g, "");
    var arr = new Uint8Array(cleanHex.length / 2);
    for (var i = 0; i < cleanHex.length; i += 2) {
      arr[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return arr;
  }

  /**
   * Verifies an Ed25519 signature asynchronously using WebCrypto API.
   * Native in Chromium/CEF (Chrome 113+ / Node 18+).
   *
   * @param {string} publicKeyHex - 32-byte Ed25519 Public Key in hex format
   * @param {string} payloadStr - The UTF-8 string payload to verify
   * @param {string} signatureHex - 64-byte Ed25519 signature in hex format
   * @param {function(boolean)} callback - Returns true if signature is valid, false otherwise
   */
  function verifyAsync(publicKeyHex, payloadStr, signatureHex, callback) {
    try {
      if (!window.crypto || !window.crypto.subtle || typeof window.crypto.subtle.importKey !== "function") {
        console.warn("⚠️ WebCrypto Ed25519 unsupported in environment.");
        callback(false);
        return;
      }

      var pubBytes = hexToUint8(publicKeyHex);
      var sigBytes = hexToUint8(signatureHex);
      var encoder = new TextEncoder();
      var payloadBytes = encoder.encode(payloadStr);

      window.crypto.subtle.importKey(
        "raw",
        pubBytes,
        { name: "Ed25519" },
        false,
        ["verify"]
      ).then(function (cryptoKey) {
        return window.crypto.subtle.verify(
          { name: "Ed25519" },
          cryptoKey,
          sigBytes,
          payloadBytes
        );
      }).then(function (isValid) {
        callback(isValid === true);
      }).catch(function (errVerify) {
        console.error("❌ Ed25519 signature verification failed:", errVerify);
        callback(false);
      });
    } catch (err) {
      console.error("❌ Ed25519 setup exception:", err);
      callback(false);
    }
  }

  window.ZeroVelocityEd25519 = {
    verify: verifyAsync,
    hexToUint8: hexToUint8
  };
}());
