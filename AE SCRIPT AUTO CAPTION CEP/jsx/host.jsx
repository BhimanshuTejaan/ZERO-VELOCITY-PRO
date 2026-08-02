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
            throw new Error("Missing stable JSX module: " + file.fsName);
        }
        $.evalFile(file);
    }

    function hasStableEngineFiles(folder) {
        return folder &&
            folder.exists &&
            (new File(folder.fsName + "/src/CS_Config.jsx")).exists &&
            (new File(folder.fsName + "/src/CS_Renderer.jsx")).exists &&
            (new File(folder.fsName + "/src/CS_SRTParser.jsx")).exists;
    }

    function findStableRoot(cepRoot) {
        var candidates = [];
        var checked = [];
        var i;
        var folder;

        candidates.push(new Folder(cepRoot.parent.fsName + "/AE SCRIPT AUTO CAPTION"));
        candidates.push(new Folder(Folder.myDocuments.fsName + "/AE SCRIPT AUTO CAPTION"));
        candidates.push(new Folder("C:/Users/Bhimanshu/OneDrive/Documents/AE SCRIPT AUTO CAPTION"));

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

    function blocksToBrowserBlocks(blocks) {
        var result = [];
        var i;
        for (i = 0; i < blocks.length; i += 1) {
            result.push(blockToBrowserBlock(blocks[i]));
        }
        return result;
    }

    function applyBrowserRolesToStableBlock(stableBlock, browserBlock) {
        var words = browserBlock.words || [];
        var i;
        var heroWord = stableBlock.heroWord;
        var accentWord = stableBlock.accentWord;

        for (i = 0; i < words.length; i += 1) {
            if (words[i].role === "hero") {
                heroWord = words[i].text;
            } else if (words[i].role === "accent") {
                accentWord = words[i].text;
            }
        }

        stableBlock.heroWord = heroWord;
        stableBlock.accentWord = accentWord;
        stableBlock.supportText = $.global.CS.Utils.joinExceptRoles(stableBlock.words, heroWord, accentWord);
        if (stableBlock.timedWords) {
            for (i = 0; i < stableBlock.timedWords.length; i += 1) {
                if (i < words.length) {
                    stableBlock.timedWords[i].role = words[i].role || "support";
                } else {
                    stableBlock.timedWords[i].role = "support";
                }
            }
        }
    }

    function getGeneratedLayers(comp, block) {
        var layers = [];
        var names = block.generatedLayerNames || [];
        var i;
        var j;
        for (i = 0; i < names.length; i += 1) {
            for (j = 1; j <= comp.numLayers; j += 1) {
                if (comp.layer(j).name === names[i]) {
                    layers.push(comp.layer(j));
                    break;
                }
            }
        }
        return layers;
    }

    function getLayerRole(layer) {
        var comment = String(layer.comment || "");
        if (comment.indexOf("|hero|") !== -1) {
            return "hero";
        }
        if (comment.indexOf("|accent|") !== -1) {
            return "accent";
        }
        return "support";
    }

    function applyHeroSizeRatio(layers, ratio) {
        var i;
        var textProp;
        var doc;
        if (!ratio || ratio === 1) {
            return;
        }
        for (i = 0; i < layers.length; i += 1) {
            if (getLayerRole(layers[i]) === "hero") {
                textProp = layers[i].property("Source Text");
                if (textProp) {
                    doc = textProp.value;
                    doc.fontSize = doc.fontSize * ratio;
                    textProp.setValue(doc);
                }
            }
        }
    }

    function applyVerticalSpacing(layers, spacing) {
        var positions = [];
        var center = 0;
        var i;
        var prop;
        var value;
        if (!spacing || spacing === 1 || layers.length < 2) {
            return;
        }
        for (i = 0; i < layers.length; i += 1) {
            prop = $.global.CS.Utils.getTransformProperty(layers[i], "ADBE Position", "Position");
            if (prop) {
                value = prop.value;
                positions.push({ prop: prop, value: value });
                center += value[1];
            }
        }
        if (positions.length < 2) {
            return;
        }
        center = center / positions.length;
        for (i = 0; i < positions.length; i += 1) {
            positions[i].prop.setValue([
                positions[i].value[0],
                center + ((positions[i].value[1] - center) * spacing)
            ]);
        }
    }

    function applyBrowserControls(comp, block, controls) {
        var layers = getGeneratedLayers(comp, block);
        if (!controls) {
            return;
        }
        applyHeroSizeRatio(layers, Number(controls.heroSizeRatio || 1));
        applyVerticalSpacing(layers, Number(controls.verticalSpacing || 1));
    }

    $.global.ZeroVelocityHost.generateFromSrt = function (payloadJson) {
        var payload;
        var comp;
        var captions;
        var blocks;

        try {
            ensureStableEngine();
            payload = parseJson(payloadJson || "{}");
            comp = getActiveComp();
            if (!payload.srtText) {
                throw new Error("Import an SRT file first.");
            }

            captions = $.global.CS.SRTParser.parse(payload.srtText);
            blocks = $.global.CS.SRTParser.buildBlocks(
                captions,
                payload.wordsPerCaption || "Auto",
                payload.layoutMode || "Balanced Layout",
                payload.animationMode || "None"
            );

            $.global.CS.Renderer.generate(comp, blocks);
            $.global.ZeroVelocityHost.blocks = blocks;
            for (var i = 0; i < blocks.length; i += 1) {
                applyBrowserControls(comp, blocks[i], payload.controls);
            }

            return jsonResult(true, "Generated " + blocks.length + " caption blocks.", {
                blocks: blocksToBrowserBlocks(blocks)
            });
        } catch (error) {
            return jsonResult(false, "Generate failed: " + error.message);
        }
    };

    $.global.ZeroVelocityHost.applyBlock = function (payloadJson) {
        var payload;
        var comp;
        var browserBlock;
        var blocks;
        var i;

        try {
            ensureStableEngine();
            payload = parseJson(payloadJson || "{}");
            browserBlock = payload.block;
            if (!browserBlock) {
                throw new Error("Select a caption block first.");
            }
            blocks = $.global.ZeroVelocityHost.blocks || [];
            for (i = 0; i < blocks.length; i += 1) {
                if (blocks[i].id === browserBlock.id) {
                    comp = getActiveComp();
                    applyBrowserRolesToStableBlock(blocks[i], browserBlock);
                    $.global.CS.Renderer.updateBlock(comp, blocks[i]);
                    applyBrowserControls(comp, blocks[i], payload.controls);
                    return jsonResult(true, "Updated " + browserBlock.id + ".");
                }
            }
            throw new Error("Generate captions before applying changes.");
        } catch (error) {
            return jsonResult(false, "Apply failed: " + error.message);
        }
    };
}());
