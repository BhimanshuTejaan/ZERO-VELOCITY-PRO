(function () {
  "use strict";

  function CSInterface() {
  }

  CSInterface.prototype.evalScript = function (script, callback) {
    if (window.__adobe_cep__ && window.__adobe_cep__.evalScript) {
      window.__adobe_cep__.evalScript(script, callback);
    } else if (callback) {
      callback("");
    }
  };

  window.CSInterface = window.CSInterface || CSInterface;
}());
