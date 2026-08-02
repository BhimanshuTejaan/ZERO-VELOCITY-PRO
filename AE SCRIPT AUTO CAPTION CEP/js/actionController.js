(function () {
  "use strict";

  function flash(button, text) {
    var original;
    if (!button) {
      return;
    }
    original = button.getAttribute("data-label") || button.textContent;
    button.setAttribute("data-label", original);
    button.textContent = text;
    window.setTimeout(function () {
      button.textContent = original;
    }, 1000);
  }

  function bind(options) {
    var generateButton = options.generateButton;
    var applyButtons = options.applyButtons || [options.applyButton];
    var getState = options.getState;
    var setBlocks = options.setBlocks;
    var onStatus = options.onStatus;
    var i;

    function bindApplyButton(button) {
      if (!button) {
        return;
      }
      button.setAttribute("data-label", button.textContent);
      button.addEventListener("click", function () {
        if (onStatus) {
          onStatus("Applying selected caption changes...");
        }
        window.ZeroVelocityAeBridge.applySelectedBlock(getState(), function (result) {
          flash(button, result.ok ? "Applied" : "Failed");
          if (onStatus) {
            onStatus(result.message || (result.ok ? "Applied selected block." : "Apply failed."));
          }
        });
      });
    }

    if (generateButton) {
      generateButton.setAttribute("data-label", generateButton.textContent);
      generateButton.addEventListener("click", function () {
        if (onStatus) {
          onStatus("Generating captions in After Effects...");
        }
        window.ZeroVelocityAeBridge.generate(getState(), function (result) {
          if (result.ok && result.blocks && setBlocks) {
            setBlocks(result.blocks);
          }
          flash(generateButton, result.ok ? "Generated" : "Failed");
          if (onStatus) {
            onStatus(result.message || (result.ok ? "Generated captions." : "Generate failed."));
          }
        });
      });
    }

    for (i = 0; i < applyButtons.length; i += 1) {
      bindApplyButton(applyButtons[i]);
    }
  }

  window.ZeroVelocityActionController = {
    bind: bind
  };
}());
