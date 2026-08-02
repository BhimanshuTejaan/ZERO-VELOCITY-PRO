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
    var hostPath = getExtensionRootPath() + "\\jsx\\host.jsx";
    var script = "var __zvHostLoadResult = " + quoteForExtendScript("") + ";" +
      "try {" +
      "$.evalFile(new File(" + quoteForExtendScript(hostPath) + "));" +
      "__zvHostLoadResult = ($.global.ZeroVelocityHost && $.global.ZeroVelocityHost.generateFromSrt && $.global.ZeroVelocityHost.applyBlock) ? " +
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
      callback({ ok: false, message: "CEP bridge is not available." });
      return;
    }

    ensureHostLoaded(csInterface, function (ready, message) {
      if (!ready) {
        callback({ ok: false, message: "host.jsx was not loaded: " + message });
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
        callback(parsed);
      });
    });
  }

  function generate(state, callback) {
    callHost("generateFromSrt", {
      srtText: state.sourceText,
      wordsPerCaption: state.controls.wordsPerCaption,
      layoutMode: state.controls.layoutMode,
      animationMode: state.controls.animationMode,
      controls: state.controls
    }, callback);
  }

  function ping(callback) {
    callHost("ping", {}, callback);
  }

  function applySelectedBlock(state, callback) {
    var blocks = state.blocks || [];
    var block = null;
    var i;
    for (i = 0; i < blocks.length; i += 1) {
      if (blocks[i].id === state.activeBlockId) {
        block = blocks[i];
        break;
      }
    }
    callHost("applyBlock", {
      block: block,
      controls: state.controls
    }, callback);
  }

  window.ZeroVelocityAeBridge = {
    ping: ping,
    generate: generate,
    applySelectedBlock: applySelectedBlock
  };
}());
