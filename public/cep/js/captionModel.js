(function () {
  "use strict";

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function createDemoBlock() {
    return {
      id: "demo-001",
      start: 0,
      end: 1.8,
      text: "the bird is flying in sky",
      words: [
        { id: "demo-001-w1", text: "the", start: 0, end: 0.2, role: "support" },
        { id: "demo-001-w2", text: "bird", start: 0.2, end: 0.5, role: "hero" },
        { id: "demo-001-w3", text: "is", start: 0.5, end: 0.72, role: "support" },
        { id: "demo-001-w4", text: "flying", start: 0.72, end: 1.1, role: "accent" },
        { id: "demo-001-w5", text: "in", start: 1.1, end: 1.32, role: "support" },
        { id: "demo-001-w6", text: "sky", start: 1.32, end: 1.8, role: "support" }
      ]
    };
  }

  function createInitialState() {
    var demoBlock = createDemoBlock();
    return {
      activeMode: "hero",
      activeBlockId: demoBlock.id,
      sourceText: "",
      importedFileName: "",
      controls: {
        verticalSpacing: 1,
        heroSizeRatio: 1,
        wordsPerCaption: "Auto",
        layoutMode: "Balanced Layout",
        animationMode: "None"
      },
      blocks: [demoBlock]
    };
  }

  function CaptionModel(initialState) {
    this.state = cloneState(initialState || createInitialState());
    this.listeners = [];
  }

  CaptionModel.prototype.subscribe = function (listener) {
    this.listeners.push(listener);
    listener(this.getState());
  };

  CaptionModel.prototype.notify = function () {
    var snapshot = this.getState();
    var i;
    for (i = 0; i < this.listeners.length; i += 1) {
      this.listeners[i](snapshot);
    }
  };

  CaptionModel.prototype.getState = function () {
    return cloneState(this.state);
  };

  CaptionModel.prototype.getActiveBlock = function () {
    var blocks = this.state.blocks;
    var i;
    for (i = 0; i < blocks.length; i += 1) {
      if (blocks[i].id === this.state.activeBlockId) {
        return blocks[i];
      }
    }
    return blocks.length > 0 ? blocks[0] : null;
  };

  CaptionModel.prototype.setImportedSrt = function (fileName, srtText, blocks) {
    this.state.sourceText = String(srtText || "");
    this.state.importedFileName = String(fileName || "");
    this.state.blocks = cloneState(blocks || []);
    this.state.activeBlockId = this.state.blocks.length > 0 ? this.state.blocks[0].id : null;
    this.state.activeMode = "hero";
    this.notify();
  };

  CaptionModel.prototype.setBlocks = function (blocks) {
    this.state.blocks = cloneState(blocks || []);
    this.state.activeBlockId = this.state.blocks.length > 0 ? this.state.blocks[0].id : null;
    this.notify();
  };

  CaptionModel.prototype.selectBlock = function (blockId) {
    this.state.activeBlockId = blockId;
    this.notify();
  };

  CaptionModel.prototype.setControl = function (name, value) {
    if (name === "verticalSpacing" || name === "heroSizeRatio") {
      this.state.controls[name] = Number(value);
    } else {
      this.state.controls[name] = String(value);
    }
    this.notify();
  };

  CaptionModel.prototype.setActiveMode = function (mode) {
    this.state.activeMode = mode;
    this.notify();
  };

  CaptionModel.prototype.selectWord = function (wordId) {
    var mode = this.state.activeMode;
    var block = this.getActiveBlock();
    var words = block ? block.words : [];
    var i;
    for (i = 0; i < words.length; i += 1) {
      if (words[i].id === wordId) {
        words[i].role = mode;
      } else if (words[i].role === mode) {
        words[i].role = "support";
      }
    }
    this.notify();
  };

  window.ZeroVelocityCaptionModel = {
    create: function () {
      return new CaptionModel(createInitialState());
    }
  };
}());
