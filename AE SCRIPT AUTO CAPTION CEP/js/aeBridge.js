(function () {
  "use strict";

  function createInterface() {
    if (!window.CSInterface || !window.__adobe_cep__) {
      return null;
    }
    try {
      return new window.CSInterface();
    } catch (error) {
      return null;
    }
  }

  function quoteForExtendScript(value) {
    return JSON.stringify(String(value || ""));
  }

  function getExtensionRootPath() {
    var path = decodeURI(window.location.pathname || "");
    if (path.charAt(0) === "/" && path.charAt(2) === ":") {
      path = path.substring(1);
    }
    path = path.replace(/\//g, "\\");
    return path.replace(/\\index\.html$/i, "");
  }

  function ensureHostLoaded(csInterface, callback) {
    var basePath = getExtensionRootPath() + "\\jsx\\";
    var script = "var __zvHostLoadResult = " + quoteForExtendScript("") + ";" +
      "try {" +
      "var fBin = new File(" + quoteForExtendScript(basePath + "host.jsxbin") + ");" +
      "var fJsx = new File(" + quoteForExtendScript(basePath + "host.jsx") + ");" +
      "if (fBin.exists) { $.evalFile(fBin); }" +
      "else if (fJsx.exists) { $.evalFile(fJsx); }" +
      "else { throw new Error('Host script file not found.'); }" +
      "__zvHostLoadResult = ($.global.ZeroVelocityHost && $.global.ZeroVelocityHost.ping) ? " +
      quoteForExtendScript("READY") + " : " + quoteForExtendScript("HOST_NOT_READY") + ";" +
      "} catch (e) {__zvHostLoadResult = " + quoteForExtendScript("HOST_LOAD_ERROR: ") + " + e.message;}" +
      "__zvHostLoadResult;";

    csInterface.evalScript(script, function (result) {
      callback(result === "READY", result || "No host load result.");
    });
  }

  function callHost(functionName, payload, callback) {
    var csInterface = createInterface();
    var json = JSON.stringify(payload || {});
    var script;

    if (!csInterface) {
      if (typeof callback === "function") {
        callback({ ok: false, message: "CEP bridge is not available." });
      }
      return;
    }

    ensureHostLoaded(csInterface, function (ready, message) {
      if (!ready) {
        if (typeof callback === "function") {
          callback({ ok: false, message: "host script was not loaded: " + message });
        }
        return;
      }

      script = "$.global.ZeroVelocityHost." + functionName + "(" + quoteForExtendScript(json) + ")";
      csInterface.evalScript(script, function (result) {
        var parsed;
        try {
          parsed = JSON.parse(result || "{}");
        } catch (error) {
          parsed = { ok: false, message: result || error.message };
        }
        if (typeof callback === "function") {
          callback(parsed);
        }
      });
    });
  }

  function generate(state, callback) {
    callHost("generateCaptions", { state: state }, callback);
  }

  function ping(callback) {
    callHost("ping", {}, callback);
  }

  function applySelectedBlock(state, callback) {
    callHost("applyChanges", { state: state }, callback);
  }

  window.ZeroVelocityAeBridge = {
    ping: ping,
    generate: generate,
    applySelectedBlock: applySelectedBlock
  };
}());
