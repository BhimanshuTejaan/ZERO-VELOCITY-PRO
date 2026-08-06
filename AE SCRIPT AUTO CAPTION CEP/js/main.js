(function () {
  "use strict";

  var importButton = document.getElementById("importSrtButton");
  var fileInput = document.getElementById("srtFileInput");
  var sourceStatus = document.getElementById("sourceStatus");
  var generateButton = document.getElementById("generateCaptionsButton");
  var applyButton = document.getElementById("applyButton");
  var applyButtonWords = document.getElementById("applyButtonWords");
  var previewTarget = document.getElementById("captionPreview");
  var previewTargetWords = document.getElementById("captionPreviewWords");
  var controlsRoot = document.getElementById("layoutControls");
  var chipRoot = document.getElementById("wordChips");
  var modeRoot = document.getElementById("selectionModes");
  var blockListRoot = document.getElementById("captionBlockList");
  var instagramLink = document.getElementById("instagramLink");
  var model = window.ZeroVelocityCaptionModel.create();
  model._lastWordsPerCaption = model.getState().controls.wordsPerCaption;

  function setStatus(text) {
    if (sourceStatus) {
      sourceStatus.textContent = text;
    }
  }

  function bindImport() {
    if (!importButton || !fileInput) {
      return;
    }
    importButton.addEventListener("click", function () {
      fileInput.click();
    });
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      var reader;
      if (!file) {
        return;
      }
      reader = new FileReader();
      reader.onload = function () {
        var srtText = reader.result || "";
        var state = model.getState();
        var blocks = window.ZeroVelocitySrtParser.parseToBlocks(srtText, state.controls.wordsPerCaption);
        model._lastWordsPerCaption = state.controls.wordsPerCaption;
        model.setImportedSrt(file.name, srtText, blocks);
        setStatus(file.name + " imported - " + blocks.length + " blocks");
      };
      reader.onerror = function () {
        setStatus("Could not read SRT file.");
      };
      reader.readAsText(file);
    });
  }

  function bindWorkspaces() {
    var tabs = document.querySelectorAll("[data-workspace]");
    var panels = document.querySelectorAll("[data-workspace-panel]");
    var i;

    function activate(name) {
      var j;
      for (j = 0; j < tabs.length; j += 1) {
        tabs[j].className = tabs[j].getAttribute("data-workspace") === name ? "active" : "";
      }
      for (j = 0; j < panels.length; j += 1) {
        panels[j].className = panels[j].getAttribute("data-workspace-panel") === name ? "workspace active" : "workspace";
      }
    }

    for (i = 0; i < tabs.length; i += 1) {
      tabs[i].addEventListener("click", function () {
        activate(this.getAttribute("data-workspace"));
      });
    }
  }

  function bindInstagramLink() {
    var url = "https://www.instagram.com/zero.velocity.ai/";
    if (!instagramLink) {
      return;
    }
    instagramLink.addEventListener("click", function () {
      if (window.cep && window.cep.util && window.cep.util.openURLInDefaultBrowser) {
        window.cep.util.openURLInDefaultBrowser(url);
        return;
      }
      window.open(url, "_blank");
    });
  }

  function renderPreviews(layoutData) {
    window.CaptionPreviewRenderer.render(previewTarget, layoutData);
    window.CaptionPreviewRenderer.render(previewTargetWords, layoutData);
  }

  bindImport();
  bindWorkspaces();
  bindInstagramLink();

  if (window.__adobe_cep__ && window.ZeroVelocityAeBridge) {
    window.ZeroVelocityAeBridge.ping(function (result) {
      if (!result.ok) {
        setStatus(result.message || "After Effects bridge is not ready.");
      }
    });
  }

  window.ZeroVelocityActionController.bind({
    generateButton: generateButton,
    applyButton: applyButton,
    applyButtons: [applyButton, applyButtonWords],
    getState: function () {
      return model.getState();
    },
    setBlocks: function (blocks) {
      model.setBlocks(blocks);
    },
    onStatus: setStatus
  });

  window.ZeroVelocityCaptionBlockList.bind(blockListRoot, model);
  window.ZeroVelocityLayoutControls.bind(controlsRoot, model);
  window.ZeroVelocityWordSelection.bind({
    chipRoot: chipRoot,
    modeRoot: modeRoot,
    model: model
  });

  model.subscribe(function (state) {
    if (state.sourceText && state.controls.wordsPerCaption !== model._lastWordsPerCaption) {
      model._lastWordsPerCaption = state.controls.wordsPerCaption;
      model.setBlocks(window.ZeroVelocitySrtParser.parseToBlocks(state.sourceText, state.controls.wordsPerCaption));
      return;
    }
    var layoutData = window.ZeroVelocityPreviewLayoutEngine.calculate(state);
    renderPreviews(layoutData);
    window.ZeroVelocityCaptionBlockList.render(blockListRoot, state);
    window.ZeroVelocityWordSelection.render(chipRoot, modeRoot, state);
  });

  if (window.ZeroVelocityLicenseManager && typeof window.ZeroVelocityLicenseManager.init === "function") {
    window.ZeroVelocityLicenseManager.init();
  }

  window.ZeroVelocityCEP = {
    version: "1.0.0",
    model: model
  };
}());
