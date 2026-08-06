/* global $, app, CompItem */

(function () {
    $.global.ZeroVelocityHost = $.global.ZeroVelocityHost || {};
    $.global.ZeroVelocityHost.loaded = true;

    function parseJson(text) {
        if (typeof JSON !== "undefined" && JSON.parse) {
            return JSON.parse(text);
        }
        return eval("(" + text + ")");
    }

    function stringifyJson(value) {
        if (typeof JSON !== "undefined" && JSON.stringify) {
            return JSON.stringify(value);
        }
        if (value === null) {
            return "null";
        }
        if (typeof value === "number" || typeof value === "boolean") {
            return String(value);
        }
        if (typeof value === "string") {
            return "\"" + value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\r/g, "\\r").replace(/\n/g, "\\n") + "\"";
        }
        if (value instanceof Array) {
            var arrayParts = [];
            var ai;
            for (ai = 0; ai < value.length; ai += 1) {
                arrayParts.push(stringifyJson(value[ai]));
            }
            return "[" + arrayParts.join(",") + "]";
        }
        var objectParts = [];
        var key;
        for (key in value) {
            if (value.hasOwnProperty(key) && typeof value[key] !== "undefined") {
                objectParts.push(stringifyJson(key) + ":" + stringifyJson(value[key]));
            }
        }
        return "{" + objectParts.join(",") + "}";
    }

    function jsonResult(ok, message, data) {
        var result = data || {};
        result.ok = ok;
        result.message = message || "";
        return stringifyJson(result);
    }

    function loadFile(rootFolder, relativePath) {
        var file = new File(rootFolder.fsName + "/" + relativePath);
        if (!file.exists) {
            file = new File(rootFolder.fsName + "/" + relativePath.replace(/^src\//, ""));
        }
        if (!file.exists) {
            throw new Error("Missing stable JSX module: " + relativePath + " in " + rootFolder.fsName);
        }
        $.evalFile(file);
    }

    function hasStableEngineFiles(folder) {
        if (!folder || !folder.exists) {
            return false;
        }
        var directCheck = (new File(folder.fsName + "/CS_Config.jsx")).exists &&
                          (new File(folder.fsName + "/CS_Renderer.jsx")).exists &&
                          (new File(folder.fsName + "/CS_SRTParser.jsx")).exists;

        var subCheck = (new File(folder.fsName + "/src/CS_Config.jsx")).exists &&
                        (new File(folder.fsName + "/src/CS_Renderer.jsx")).exists &&
                        (new File(folder.fsName + "/src/CS_SRTParser.jsx")).exists;

        return directCheck || subCheck;
    }

    function findStableRoot(cepRoot) {
        var hostFile = new File($.fileName);
        var jsxFolder = hostFile.parent;
        var candidates = [];
        var checked = [];
        var i;
        var folder;

        // 1. Bundled inside extension's own jsx/src folder (Production - Self-Contained)
        candidates.push(new Folder(jsxFolder.fsName + "/src"));

        // 2. Bundled directly inside extension's jsx/ folder
        candidates.push(new Folder(jsxFolder.fsName));

        // 3. Bundled in extension root /src
        candidates.push(new Folder(cepRoot.fsName + "/src"));

        // 4. Sibling extension directory fallback (Local Dev)
        candidates.push(new Folder(cepRoot.parent.fsName + "/AE SCRIPT AUTO CAPTION"));

        // 5. User Documents directory fallback (Local Dev)
        candidates.push(new Folder(Folder.myDocuments.fsName + "/AE SCRIPT AUTO CAPTION"));

        for (i = 0; i < candidates.length; i += 1) {
            folder = candidates[i];
            checked.push(folder.fsName);
            if (hasStableEngineFiles(folder)) {
                $.global.ZeroVelocityHost.stableRootPath = folder.fsName;
                return folder;
            }
        }

        throw new Error("Could not find stable JSX engine. Checked: " + checked.join(" | "));
    }

    function ensureStableEngine() {
        var hostFile;
        var cepRoot;
        var stableRoot;

        if ($.global.CS && $.global.CS.Renderer && $.global.CS.SRTParser) {
            return;
        }

        hostFile = new File($.fileName);
        cepRoot = hostFile.parent.parent;
        stableRoot = findStableRoot(cepRoot);

        loadFile(stableRoot, "src/CS_Config.jsx");
        loadFile(stableRoot, "src/CS_Utils.jsx");
        loadFile(stableRoot, "src/CS_SRTParser.jsx");
        loadFile(stableRoot, "src/CS_Selector.jsx");
        loadFile(stableRoot, "src/CS_Typography.jsx");
        loadFile(stableRoot, "src/CS_LayoutEngine.jsx");
        loadFile(stableRoot, "src/CS_Animator.jsx");
        loadFile(stableRoot, "src/CS_Renderer.jsx");
    }

    $.global.ZeroVelocityHost.ping = function () {
        try {
            ensureStableEngine();
            return jsonResult(true, "host.jsx loaded and stable JSX engine is available.");
        } catch (error) {
            return jsonResult(false, "host loaded, stable engine failed: " + error.message);
        }
    };

    function getActiveComp() {
        if (!app.project || !(app.project.activeItem instanceof CompItem)) {
            throw new Error("Open or select a composition first.");
        }
        return app.project.activeItem;
    }

    function blockToBrowserBlock(block) {
        var words = [];
        var timedWords = block.timedWords || [];
        var i;

        for (i = 0; i < timedWords.length; i += 1) {
            words.push({
                id: block.id + "-w" + (i + 1),
                text: timedWords[i].text,
                start: timedWords[i].start,
                end: timedWords[i].end,
                role: timedWords[i].role || "support"
            });
        }

        return {
            id: block.id,
            start: block.start,
            end: block.end,
            text: block.text,
            words: words
        };
    }

    function serializeState(comp) {
        var blocks = [];
        var rawState;
        var i;

        ensureStableEngine();
        rawState = $.global.CS.Config.readCompConfig(comp);
        if (rawState && rawState.blocks) {
            for (i = 0; i < rawState.blocks.length; i += 1) {
                blocks.push(blockToBrowserBlock(rawState.blocks[i]));
            }
        }

        return {
            sourceText: rawState ? rawState.sourceText || "" : "",
            blocks: blocks,
            controls: {
                verticalSpacing: rawState && rawState.controls ? rawState.controls.verticalSpacing || 1 : 1,
                heroSizeRatio: rawState && rawState.controls ? rawState.controls.heroSizeRatio || 1 : 1,
                wordsPerCaption: rawState && rawState.controls ? rawState.controls.wordsPerCaption || "Auto" : "Auto",
                layoutMode: rawState && rawState.controls ? rawState.controls.layoutMode || "Balanced Layout" : "Balanced Layout",
                animationMode: rawState && rawState.controls ? rawState.controls.animationMode || "None" : "None"
            }
        };
    }

    $.global.ZeroVelocityHost.getState = function () {
        try {
            var comp = getActiveComp();
            return jsonResult(true, "State loaded from composition.", serializeState(comp));
        } catch (error) {
            return jsonResult(false, error.message);
        }
    };

    $.global.ZeroVelocityHost.generateCaptions = function (paramsJson) {
        try {
            var comp = getActiveComp();
            var params = parseJson(paramsJson || "{}");
            var state = params.state || {};
            var blocks = [];
            var rawBlocks = state.blocks || [];
            var i, j, words, w;

            ensureStableEngine();

            for (i = 0; i < rawBlocks.length; i += 1) {
                words = [];
                if (rawBlocks[i].words) {
                    for (j = 0; j < rawBlocks[i].words.length; j += 1) {
                        w = rawBlocks[i].words[j];
                        words.push({
                            text: w.text,
                            start: w.start,
                            end: w.end,
                            role: w.role || "support"
                        });
                    }
                }
                blocks.push({
                    id: rawBlocks[i].id,
                    start: rawBlocks[i].start,
                    end: rawBlocks[i].end,
                    text: rawBlocks[i].text,
                    timedWords: words
                });
            }

            $.global.CS.Config.writeCompConfig(comp, {
                version: "1.0",
                sourceText: state.sourceText || "",
                blocks: blocks,
                controls: state.controls || {}
            });

            $.global.CS.Renderer.renderCaptions(comp, {
                sourceText: state.sourceText || "",
                blocks: blocks,
                controls: state.controls || {}
            });

            return jsonResult(true, "Captions generated successfully.", serializeState(comp));
        } catch (error) {
            return jsonResult(false, "Generate failed: " + error.message);
        }
    };

    $.global.ZeroVelocityHost.applyChanges = function (paramsJson) {
        try {
            var comp = getActiveComp();
            var params = parseJson(paramsJson || "{}");
            var state = params.state || {};
            var blocks = [];
            var rawBlocks = state.blocks || [];
            var i, j, words, w;

            ensureStableEngine();

            for (i = 0; i < rawBlocks.length; i += 1) {
                words = [];
                if (rawBlocks[i].words) {
                    for (j = 0; j < rawBlocks[i].words.length; j += 1) {
                        w = rawBlocks[i].words[j];
                        words.push({
                            text: w.text,
                            start: w.start,
                            end: w.end,
                            role: w.role || "support"
                        });
                    }
                }
                blocks.push({
                    id: rawBlocks[i].id,
                    start: rawBlocks[i].start,
                    end: rawBlocks[i].end,
                    text: rawBlocks[i].text,
                    timedWords: words
                });
            }

            $.global.CS.Config.writeCompConfig(comp, {
                version: "1.0",
                sourceText: state.sourceText || "",
                blocks: blocks,
                controls: state.controls || {}
            });

            $.global.CS.Renderer.updateExistingCaptions(comp, {
                sourceText: state.sourceText || "",
                blocks: blocks,
                controls: state.controls || {}
            });

            return jsonResult(true, "Changes applied to composition.", serializeState(comp));
        } catch (error) {
            return jsonResult(false, "Apply failed: " + error.message);
        }
    };
}());
