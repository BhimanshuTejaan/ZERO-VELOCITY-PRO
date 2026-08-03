(function () {
  "use strict";

  var instagramLink = document.getElementById("instagramLink");
  var model = window.ZeroVelocityCaptionModel.create();
  model._lastWordsPerCaption = model.getState().controls.wordsPerCaption;

  var WORKSPACE_TEMPLATE = [
    '<section class="import-panel" aria-label="Import SRT">',
    '  <div>',
    '    <p class="import-kicker">Start Here</p>',
    '    <p id="sourceStatus" class="source-status">Import your one-word SRT file.</p>',
    '  </div>',
    '  <button id="importSrtButton" class="import-button" type="button">Import SRT</button>',
    '  <input id="srtFileInput" class="visually-hidden" type="file" accept=".srt">',
    '</section>',
    '',
    '<nav class="workspace-tabs" aria-label="Workspace">',
    '  <button class="active" type="button" data-workspace="design">Design</button>',
    '  <button type="button" data-workspace="words">Edit Words</button>',
    '</nav>',
    '',
    '<section id="designWorkspace" class="workspace active" data-workspace-panel="design" aria-label="Design Workspace">',
    '  <section class="panel-section preview-section" aria-label="Live Preview Area">',
    '    <div class="section-title-row">',
    '      <h2>Preview</h2>',
    '      <span class="status-dot"></span>',
    '    </div>',
    '    <div id="captionPreview" class="preview-box"></div>',
    '  </section>',
    '',
    '  <section class="action-strip" aria-label="Generate Captions">',
    '    <button id="generateCaptionsButton" class="generate-button" type="button">Generate Captions</button>',
    '  </section>',
    '',
    '  <section class="panel-section" aria-label="Layout Controls">',
    '    <h2>Layout Controls</h2>',
    '    <div id="layoutControls" class="control-stack">',
    '      <label class="range-control">',
    '        <span>',
    '          Vertical Spacing',
    '          <strong data-value-for="verticalSpacing">1.00</strong>',
    '        </span>',
    '        <input id="verticalSpacing" type="range" min="0.25" max="3" step="0.05" value="1">',
    '      </label>',
    '      <label class="range-control">',
    '        <span>',
    '          Hero Size Ratio',
    '          <strong data-value-for="heroSizeRatio">1.00</strong>',
    '        </span>',
    '        <input id="heroSizeRatio" type="range" min="0.45" max="2.75" step="0.05" value="1">',
    '      </label>',
    '      <label class="select-control">',
    '        Words Per Caption',
    '        <select id="wordsPerCaption">',
    '          <option>Auto</option>',
    '          <option>3</option>',
    '          <option>4</option>',
    '        </select>',
    '      </label>',
    '      <label class="select-control">',
    '        Layout',
    '        <select id="layoutMode">',
    '          <option>Balanced Layout</option>',
    '          <option>Corporate Clean Style</option>',
    '        </select>',
    '      </label>',
    '      <label class="select-control">',
    '        Animation',
    '        <select id="animationMode">',
    '          <option>None</option>',
    '        </select>',
    '      </label>',
    '    </div>',
    '  </section>',
    '',
    '  <footer class="footer-actions">',
    '    <button id="applyButton" class="apply-button" type="button">Apply Changes</button>',
    '  </footer>',
    '</section>',
    '',
    '<section id="wordsWorkspace" class="workspace" data-workspace-panel="words" aria-label="Edit Words Workspace">',
    '  <section class="panel-section preview-section edit-preview-section" aria-label="Word Edit Preview Area">',
    '    <div class="section-title-row">',
    '      <h2>Preview</h2>',
    '      <span class="pill">Live</span>',
    '    </div>',
    '    <div id="captionPreviewWords" class="preview-box"></div>',
    '  </section>',
    '',
    '  <section class="panel-section word-section" aria-label="Word Selection Area">',
    '    <h2>Word Style</h2>',
    '    <div id="selectionModes" class="mode-toggle">',
    '      <button type="button" data-mode="hero" class="active">Hero</button>',
    '      <button type="button" data-mode="accent">Accent</button>',
    '    </div>',
    '    <p class="editor-hint">Choose a mode, then click a word to update the preview.</p>',
    '    <div id="wordChips" class="word-chip-list"></div>',
    '  </section>',
    '',
    '  <footer class="footer-actions">',
    '    <button id="applyButtonWords" class="apply-button" type="button">Apply Changes</button>',
    '  </footer>',
    '</section>',
    '',
    '<section class="panel-section" aria-label="Caption Block List">',
    '  <div class="section-title-row">',
    '    <h2>Caption Blocks</h2>',
    '    <span class="pill">Browser Preview</span>',
    '  </div>',
    '  <div id="captionBlockList" class="caption-list"></div>',
    '</section>'
  ].join("\n");

  var isWorkspaceMounted = false;

  function bindInstagramLink() {
    var url = "https://www.instagram.com/grounded_bhim";
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

  function mountWorkspace() {
    if (isWorkspaceMounted) {
      return;
    }
    var container = document.getElementById("appWorkspaceContainer");
    if (!container) {
      return;
    }

    container.innerHTML = WORKSPACE_TEMPLATE;
    isWorkspaceMounted = true;

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
      var tabs = container.querySelectorAll("[data-workspace]");
      var panels = container.querySelectorAll("[data-workspace-panel]");
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

    function renderPreviews(layoutData) {
      window.CaptionPreviewRenderer.render(previewTarget, layoutData);
      window.CaptionPreviewRenderer.render(previewTargetWords, layoutData);
    }

    bindImport();
    bindWorkspaces();

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
  }

  bindInstagramLink();

  // Listen for transparent 'zv:activated' event to mount workspace DOM dynamically
  window.addEventListener("zv:activated", function () {
    mountWorkspace();
  });

  if (window.ZeroVelocityLicenseManager) {
    window.ZeroVelocityLicenseManager.init();
  }

  window.ZeroVelocityCEP = {
    version: "1.0.0",
    model: model
  };
}());
