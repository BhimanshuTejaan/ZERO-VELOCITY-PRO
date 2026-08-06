$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.UI = {
    state: {
        srtFile: null,
        captions: [],
        blocks: []
    },

    build: function (thisObj) {
        var isDockablePanel = (typeof Panel !== "undefined" && thisObj instanceof Panel);
        var win = isDockablePanel ? thisObj : new Window("palette", CS.Config.pluginName, undefined, { resizeable: true });
        var ui = CS.UI.createControls(win);

        CS.UI.window = win;
        CS.UI.controls = ui;
        CS.UI.bindEvents(ui);

        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () {
            this.layout.resize();
        };

        if (win instanceof Window) {
            win.center();
            win.show();
        }

        return win;
    },

    createControls: function (win) {
        var ui = {};
        var row;
        var setupPanel;
        var optionsPanel;
        var listPanel;
        var manualPanel;
        var statusPanel;

        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 10;

        CS.UI.applyWindowTheme(win);

        CS.UI.addBrandHeader(win, ui);

        setupPanel = CS.UI.addSection(win, "SRT SOURCE");
        row = CS.UI.addRow(setupPanel);
        row.orientation = "row";
        ui.importButton = row.add("button", undefined, "IMPORT SRT");
        ui.fileLabel = row.add("statictext", undefined, "No file selected");
        ui.fileLabel.characters = 22;
        CS.UI.styleMutedText(ui.fileLabel);

        optionsPanel = CS.UI.addSection(win, "CAPTION DESIGN");
        row = CS.UI.addRow(optionsPanel);
        CS.UI.addFieldLabel(row, "Words Per Caption");
        ui.wordsDropdown = row.add("dropdownlist", undefined, ["Auto", "3", "4"]);
        ui.wordsDropdown.selection = 0;

        row = CS.UI.addRow(optionsPanel);
        CS.UI.addFieldLabel(row, "Layout Mode");
        ui.layoutDropdown = row.add("dropdownlist", undefined, ["Balanced Layout", "Corporate Clean Style"]);
        ui.layoutDropdown.selection = 0;

        row = CS.UI.addRow(optionsPanel);
        CS.UI.addFieldLabel(row, "Animation");
        ui.animationDropdown = row.add("dropdownlist", undefined, ["None"]);
        ui.animationDropdown.selection = 0;

        row = CS.UI.addRow(optionsPanel);
        CS.UI.addFieldLabel(row, "Hero Selection");
        ui.heroMode = row.add("dropdownlist", undefined, ["Auto"]);
        ui.heroMode.selection = 0;
        CS.UI.addFieldLabel(row, "Accent Selection");
        ui.accentMode = row.add("dropdownlist", undefined, ["Auto"]);
        ui.accentMode.selection = 0;

        ui.generateButton = win.add("button", undefined, "GENERATE CAPTIONS");

        listPanel = CS.UI.addSection(win, "GENERATED CAPTIONS");
        ui.blockList = listPanel.add("listbox", undefined, [], { multiselect: false });
        ui.blockList.preferredSize.height = 160;

        manualPanel = CS.UI.addSection(win, "MANUAL EDITING");
        manualPanel.orientation = "column";
        manualPanel.alignChildren = ["fill", "top"];
        manualPanel.margins = 10;

        row = CS.UI.addRow(manualPanel);
        CS.UI.addFieldLabel(row, "Hero Word");
        ui.heroInput = row.add("edittext", undefined, "");
        ui.heroInput.characters = 18;

        row = CS.UI.addRow(manualPanel);
        CS.UI.addFieldLabel(row, "Accent Word");
        ui.accentInput = row.add("edittext", undefined, "");
        ui.accentInput.characters = 18;

        ui.updateButton = manualPanel.add("button", undefined, "UPDATE SELECTED CAPTION");

        statusPanel = win.add("panel", undefined, "");
        statusPanel.orientation = "row";
        statusPanel.alignChildren = ["fill", "center"];
        statusPanel.margins = 8;
        CS.UI.stylePanel(statusPanel, true);
        ui.status = statusPanel.add("statictext", undefined, "Ready");
        ui.status.characters = 42;
        CS.UI.styleAccentText(ui.status);

        return ui;
    },

    addSection: function (parent, title) {
        var panel = parent.add("panel", undefined, title);
        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.margins = 10;
        panel.spacing = 8;
        CS.UI.stylePanel(panel, false);
        return panel;
    },

    addRow: function (parent) {
        var row = parent.add("group");
        row.orientation = "row";
        row.alignChildren = ["left", "center"];
        row.spacing = 8;
        return row;
    },

    addFieldLabel: function (parent, text) {
        var label = parent.add("statictext", undefined, text);
        label.characters = 15;
        CS.UI.styleLabel(label);
        return label;
    },

    addBrandHeader: function (win, ui) {
        var panel = win.add("panel", undefined, "");
        var title;
        var subtitle;
        var follow;
        var handle;

        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.margins = 12;
        panel.spacing = 4;

        title = panel.add("statictext", undefined, "Caption Styler V1");
        subtitle = panel.add("statictext", undefined, "Clean caption layouts for After Effects");
        follow = panel.add("group");
        follow.orientation = "row";
        follow.alignChildren = ["left", "center"];
        follow.spacing = 4;
        follow.add("statictext", undefined, "Follow -");
        handle = follow.add("statictext", undefined, "@grounded_bhim");

        ui.brandPanel = panel;
        ui.brandTitle = title;
        ui.brandSubtitle = subtitle;
        ui.brandHandle = handle;

        CS.UI.applyPremiumStyle(panel, title, subtitle, handle);
    },

    applyWindowTheme: function (win) {
        try {
            win.graphics.backgroundColor = win.graphics.newBrush(win.graphics.BrushType.SOLID_COLOR, [0.025, 0.07, 0.045, 1]);
        } catch (styleError) {
            CS.Utils.log("Window theme skipped: " + styleError.message);
        }
    },

    stylePanel: function (panel, darker) {
        try {
            panel.graphics.backgroundColor = panel.graphics.newBrush(
                panel.graphics.BrushType.SOLID_COLOR,
                darker ? [0.025, 0.11, 0.065, 1] : [0.035, 0.13, 0.08, 1]
            );
        } catch (styleError) {
            CS.Utils.log("Panel styling skipped: " + styleError.message);
        }
    },

    styleLabel: function (textControl) {
        try {
            textControl.graphics.foregroundColor = textControl.graphics.newPen(textControl.graphics.PenType.SOLID_COLOR, [0.72, 0.95, 0.78], 1);
        } catch (styleError) {
            CS.Utils.log("Label styling skipped: " + styleError.message);
        }
    },

    styleMutedText: function (textControl) {
        try {
            textControl.graphics.foregroundColor = textControl.graphics.newPen(textControl.graphics.PenType.SOLID_COLOR, [0.72, 0.82, 0.74], 1);
        } catch (styleError) {
            CS.Utils.log("Muted text styling skipped: " + styleError.message);
        }
    },

    styleAccentText: function (textControl) {
        try {
            textControl.graphics.foregroundColor = textControl.graphics.newPen(textControl.graphics.PenType.SOLID_COLOR, [0.42, 1, 0.48], 1);
        } catch (styleError) {
            CS.Utils.log("Accent text styling skipped: " + styleError.message);
        }
    },

    applyPremiumStyle: function (panel, title, subtitle, handle) {
        try {
            title.graphics.font = ScriptUI.newFont(title.graphics.font.name, "BOLD", 15);
            subtitle.graphics.font = ScriptUI.newFont(subtitle.graphics.font.name, "REGULAR", 10);
            handle.graphics.font = ScriptUI.newFont(handle.graphics.font.name, "BOLD", 13);
            title.graphics.foregroundColor = title.graphics.newPen(title.graphics.PenType.SOLID_COLOR, [1, 1, 1], 1);
            subtitle.graphics.foregroundColor = subtitle.graphics.newPen(subtitle.graphics.PenType.SOLID_COLOR, [0.72, 0.9, 0.76], 1);
            handle.graphics.foregroundColor = handle.graphics.newPen(handle.graphics.PenType.SOLID_COLOR, [0.42, 1, 0.48], 1);
            panel.graphics.backgroundColor = panel.graphics.newBrush(panel.graphics.BrushType.SOLID_COLOR, [0.02, 0.18, 0.09, 1]);
        } catch (styleError) {
            CS.Utils.log("Premium UI styling skipped: " + styleError.message);
        }
    },

    bindEvents: function (ui) {
        ui.importButton.onClick = function () {
            CS.UI.importSRT(ui);
        };

        ui.generateButton.onClick = function () {
            CS.UI.generateCaptions(ui);
        };

        ui.blockList.onChange = function () {
            CS.UI.syncManualFields(ui);
        };

        ui.updateButton.onClick = function () {
            CS.UI.updateSelectedCaption(ui);
        };
    },

    importSRT: function (ui) {
        var file = File.openDialog("Select SRT file", "*.srt");
        var text;

        if (!file) {
            return;
        }

        try {
            text = CS.SRTParser.readFile(file);
            CS.UI.state.captions = CS.SRTParser.parse(text);
            CS.UI.state.srtFile = file;
            ui.fileLabel.text = file.name;
            ui.status.text = "Imported " + CS.UI.state.captions.length + " SRT entries.";
        } catch (error) {
            alert(error.message);
        }
    },

    generateCaptions: function (ui) {
        var comp = CS.Utils.getActiveComp();
        var wordsMode;
        var layoutMode;
        var animationMode;

        if (!comp) {
            alert("Open or select a composition first.");
            return;
        }
        if (CS.UI.state.captions.length === 0) {
            alert("Import an SRT file first.");
            return;
        }

        wordsMode = ui.wordsDropdown.selection.text;
        layoutMode = ui.layoutDropdown.selection.text;
        animationMode = ui.animationDropdown.selection.text;

        CS.UI.state.blocks = CS.SRTParser.buildBlocks(CS.UI.state.captions, wordsMode, layoutMode, animationMode);
        if (CS.UI.state.blocks.length > CS.Config.render.warnBlockCount) {
            if (!confirm("Caption Styler will create " + (CS.UI.state.blocks.length * 3) + " text layers. Large SRT files can make After Effects 2020 unstable. Continue?")) {
                ui.status.text = "Generation cancelled.";
                return;
            }
        }
        CS.Renderer.generate(comp, CS.UI.state.blocks);
        CS.UI.safeRefreshAfterGenerate(ui);
    },

    refreshBlockList: function (ui) {
        var i;
        var block;
        ui.blockList.removeAll();
        for (i = 0; i < CS.UI.state.blocks.length; i += 1) {
            block = CS.UI.state.blocks[i];
            ui.blockList.add("item", block.id + "  " + CS.Utils.timeToText(block.start) + "  " + block.text);
        }
        if (CS.UI.state.blocks.length > 0) {
            ui.blockList.selection = 0;
            CS.UI.syncManualFields(ui);
        }
    },

    safeRefreshAfterGenerate: function (ui) {
        try {
            CS.UI.refreshBlockList(ui);
            ui.status.text = "Generated " + CS.UI.state.blocks.length + " caption blocks.";
        } catch (refreshError) {
            CS.Utils.log("UI refresh skipped after generate: " + refreshError.message);
        }
    },

    syncManualFields: function (ui) {
        var block = CS.UI.getSelectedBlock(ui);
        if (!block) {
            ui.heroInput.text = "";
            ui.accentInput.text = "";
            return;
        }
        ui.heroInput.text = block.heroWord;
        ui.accentInput.text = block.accentWord;
    },

    updateSelectedCaption: function (ui) {
        var comp = CS.Utils.getActiveComp();
        var block = CS.UI.getSelectedBlock(ui);

        if (!comp) {
            alert("Open or select a composition first.");
            return;
        }
        if (!block) {
            alert("Select a generated caption first.");
            return;
        }

        block.heroWord = CS.Utils.cleanWord(ui.heroInput.text);
        block.accentWord = CS.Utils.cleanWord(ui.accentInput.text);

        if (block.heroWord === "" || block.accentWord === "") {
            alert("Hero Word and Accent Word cannot be empty.");
            return;
        }

        CS.Renderer.updateBlock(comp, block);
        CS.UI.refreshBlockList(ui);
        ui.status.text = "Updated " + block.id + ".";
    },

    getSelectedBlock: function (ui) {
        var index;
        if (!ui.blockList.selection) {
            return null;
        }
        index = ui.blockList.selection.index;
        if (index < 0 || index >= CS.UI.state.blocks.length) {
            return null;
        }
        return CS.UI.state.blocks[index];
    }
};
