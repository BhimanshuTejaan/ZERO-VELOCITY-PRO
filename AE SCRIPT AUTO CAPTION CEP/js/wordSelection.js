(function () {
  "use strict";

  function checkLicense(actionName) {
    if (window.ZeroVelocityLicenseManager && typeof window.ZeroVelocityLicenseManager.isAuthorized === "function") {
      if (!window.ZeroVelocityLicenseManager.isAuthorized()) {
        console.warn("🔒 Blocked unauthorized action:", actionName);
        if (typeof window.ZeroVelocityLicenseManager.showOverlay === "function") {
          window.ZeroVelocityLicenseManager.showOverlay();
        }
        return false;
      }
    }
    return true;
  }

  function bind(options) {
    var chipRoot = options.chipRoot;
    var modeRoot = options.modeRoot;
    var model = options.model;

    if (modeRoot) {
      modeRoot.addEventListener("click", function (event) {
        if (!checkLicense("switch styling modes")) {
          return;
        }
        var button = event.target;
        if (!button || !button.getAttribute("data-mode")) {
          return;
        }
        model.setActiveMode(button.getAttribute("data-mode"));
      });
    }

    if (chipRoot) {
      chipRoot.addEventListener("click", function (event) {
        if (!checkLicense("edit word styles")) {
          return;
        }
        var button = event.target;
        if (!button || !button.getAttribute("data-word-id")) {
          return;
        }
        model.selectWord(button.getAttribute("data-word-id"));
      });
    }
  }

  function render(chipRoot, modeRoot, state) {
    var block = getActiveBlock(state);
    var words = block ? block.words : [];
    var i;
    var chip;
    var modeButtons;

    if (modeRoot) {
      modeButtons = modeRoot.querySelectorAll("[data-mode]");
      for (i = 0; i < modeButtons.length; i += 1) {
        modeButtons[i].className = modeButtons[i].getAttribute("data-mode") === state.activeMode ? "active" : "";
      }
    }

    if (!chipRoot) {
      return;
    }

    chipRoot.innerHTML = "";
    for (i = 0; i < words.length; i += 1) {
      chip = document.createElement("button");
      chip.type = "button";
      chip.className = "word-chip " + words[i].role;
      chip.setAttribute("data-word-id", words[i].id);
      chip.textContent = words[i].text;
      chipRoot.appendChild(chip);
    }
  }

  window.ZeroVelocityWordSelection = {
    bind: bind,
    render: render
  };

  function getActiveBlock(state) {
    var blocks = state.blocks || [];
    var i;
    for (i = 0; i < blocks.length; i += 1) {
      if (blocks[i].id === state.activeBlockId) {
        return blocks[i];
      }
    }
    return blocks.length > 0 ? blocks[0] : null;
  }
}());
