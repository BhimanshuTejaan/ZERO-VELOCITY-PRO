$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.Renderer = {
    generate: function (comp, blocks) {
        var i;
        var rendered = 0;
        var useUndo = CS.Config.render.useUndoForGenerate;
        CS.Utils.log("Generate start: " + blocks.length + " blocks, comp=" + comp.name + ", duration=" + comp.duration);

        if (useUndo) {
            app.beginUndoGroup("Caption Styler V1 Generate");
        }
        try {
            CS.Renderer.deleteAllGenerated(comp);

            for (i = 0; i < blocks.length; i += 1) {
                if (CS.Renderer.isRenderableBlock(comp, blocks[i])) {
                    CS.Utils.log("Rendering " + blocks[i].id + " " + blocks[i].start + " -> " + blocks[i].end + " text=" + blocks[i].text);
                    CS.Renderer.renderBlock(comp, blocks[i]);
                    rendered += 1;
                }
            }
        } finally {
            if (useUndo) {
                app.endUndoGroup();
            }
        }

        CS.Utils.log("Generate finished: " + rendered + " of " + blocks.length + " blocks rendered");
    },

    renderBlock: function (comp, block) {
        var controller;
        var layers;
        var heroSize;
        var result;

        CS.Renderer.deleteBlock(comp, block.id);

        controller = CS.Renderer.createController(comp, block);
        layers = CS.Renderer.createRoleLayers(comp, block, controller);
        heroSize = CS.Typography.getBaseHeroSize(comp);
        if (block.layoutIndex === 6) {
            heroSize = CS.Utils.clamp(comp.height * 0.17, 56, 210);
        }
        result = CS.LayoutEngine.buildLayout(comp, block, layers, heroSize);

        CS.LayoutEngine.applyPlan(result.plan);
        if (block.timedWords && block.timedWords.length > 0) {
            layers = CS.Renderer.createTimedWordLayers(comp, block, layers, result.heroSize, controller);
            if (controller) {
                CS.Renderer.setLayerTiming(controller, block);
            }
            CS.Renderer.applyAnimationToLayerList(block, layers);
            CS.Renderer.collectTimedLayerNames(block, layers, controller);
        } else {
            CS.Renderer.setTiming(block, layers, controller);
            CS.Renderer.applyAnimation(block, layers);
            CS.Renderer.collectLayerNames(block, layers, controller);
        }
    },

    updateBlock: function (comp, block) {
        app.beginUndoGroup("Caption Styler V1 Update Caption");
        try {
            block.supportText = CS.Utils.joinExceptRoles(block.words, block.heroWord, block.accentWord);
            CS.Renderer.renderBlock(comp, block);
        } finally {
            app.endUndoGroup();
        }
    },

    createController: function (comp, block) {
        if (!CS.Config.render.createControllerNulls) {
            return null;
        }
        var controller = comp.layers.addNull(block.end - block.start);
        var position = CS.Utils.getTransformProperty(controller, "ADBE Position", "Position");
        var anchor = CS.Utils.getTransformProperty(controller, "ADBE Anchor Point", "Anchor Point");
        controller.name = CS.Config.layerPrefix + "_" + block.id + "_GROUP";
        controller.inPoint = block.start;
        controller.outPoint = block.end;
        controller.enabled = true;
        if (position) {
            position.setValue([0, 0]);
        }
        if (anchor) {
            anchor.setValue([0, 0]);
        }
        controller.comment = "Caption Styler V1 block " + block.id + " text=" + block.text;
        return controller;
    },

    createRoleLayers: function (comp, block, controller) {
        var supportText = (block.supportText === "" || block.supportText === undefined) ? " " : block.supportText;
        var accentText  = (block.accentWord  === "" || block.accentWord  === undefined) ? " " : block.accentWord;
        var heroText    = (block.heroWord    === "" || block.heroWord    === undefined) ? " " : block.heroWord;
        var support = CS.Renderer.createTextLayer(comp, block, "support", supportText, controller);
        var accent  = CS.Renderer.createTextLayer(comp, block, "accent",  accentText,  controller);
        var hero    = CS.Renderer.createTextLayer(comp, block, "hero",    heroText,    controller);

        return {
            support: support,
            accent: accent,
            hero: hero
        };
    },

    createTextLayer: function (comp, block, role, text, controller) {
        var layer = comp.layers.addText(text);
        layer.name = CS.Config.layerPrefix + "_" + block.id + "_" + role.toUpperCase() + "_" + CS.Utils.safeLayerNamePart(text);
        layer.comment = "Caption Styler V1|" + block.id + "|" + role + "|" + text;
        if (controller) {
            layer.parent = controller;
        }
        CS.Renderer.setLayerTiming(layer, block);
        return layer;
    },

    createTimedWordLayers: function (comp, block, guideLayers, heroSize, controller) {
        var guideInfo = CS.Renderer.getGuideInfo(guideLayers);
        var supportCursor = 0;
        var supportGap = Math.max(4, heroSize * CS.Config.typography.support.sizeRatio * 0.22);
        var useBalancedComposition = (block.layoutIndex === 5);
        var useCorporateComposition = (block.layoutIndex === 6);
        var timedLayers = [];
        var placements = [];
        var i;
        var timedWord;
        var layer;
        var role;
        var topLeft;
        var rect;

        for (i = 0; i < block.timedWords.length; i += 1) {
            timedWord = block.timedWords[i];
            role = timedWord.role || "support";
            layer = CS.Renderer.createTextLayer(comp, block, role, timedWord.text, controller);
            CS.Typography.applyToLayer(layer, role, heroSize, false, block.layoutIndex);
            rect = CS.LayoutEngine.measureLayer(layer);

            if (useBalancedComposition || useCorporateComposition) {
                topLeft = { x: 0, y: 0 };
            } else if (role === "hero") {
                topLeft = guideInfo.hero;
            } else if (role === "accent") {
                topLeft = guideInfo.accent;
            } else {
                topLeft = {
                    x: guideInfo.support.x + supportCursor,
                    y: guideInfo.support.y
                };
                supportCursor += rect.width + supportGap;
            }

            CS.Renderer.setTimedWordTiming(layer, timedWord, block.end);
            timedLayers.push(layer);
            placements.push({
                layer: layer,
                rect: rect,
                role: role,
                x: topLeft.x,
                y: topLeft.y
            });
        }

        if (useBalancedComposition) {
            CS.Renderer.composeBalancedTimedPlacements(comp, placements, heroSize);
        } else if (useCorporateComposition) {
            CS.Renderer.composeCorporateTimedPlacements(comp, placements, heroSize);
        }

        CS.Renderer.applyTimedWordPlacements(placements);
        CS.Renderer.removeGuideLayers(guideLayers);
        return timedLayers;
    },

    composeCorporateTimedPlacements: function (comp, placements, heroSize) {
        var i;
        var j;
        var item;
        var row;
        var rows = [];
        var heroIndex = -1;
        var before = [];
        var after = [];
        var hGap = Math.max(16, heroSize * 0.14);
        var vGap = Math.max(8, heroSize * 0.075);
        var safeWidth = comp.width * CS.Config.layout.safeWidthRatio;
        var safeHeight = comp.height * CS.Config.layout.safeHeightRatio;
        var targetCenterX = comp.width * 0.5;
        var targetCenterY = comp.height * CS.Config.layout.centerYRatio;
        var heroWidth;
        var maxSupportRowWidth;
        var totalHeight = 0;
        var top;
        var left;
        var x;
        var bounds;
        var dx;
        var dy;

        function makeRow(items, align) {
            var width = 0;
            var height = 0;
            var k;
            for (k = 0; k < items.length; k += 1) {
                if (width > 0) {
                    width += hGap;
                }
                width += items[k].rect.width;
                height = Math.max(height, items[k].rect.height);
            }
            return { items: items, width: width, height: height, align: align || "center" };
        }

        function pushSupportRows(items, preferredAlign) {
            var current = [];
            var currentWidth = 0;
            var k;
            var candidateWidth;

            for (k = 0; k < items.length; k += 1) {
                candidateWidth = currentWidth;
                if (current.length > 0) {
                    candidateWidth += hGap;
                }
                candidateWidth += items[k].rect.width;

                if (current.length > 0 && candidateWidth > maxSupportRowWidth) {
                    rows.push(makeRow(current, preferredAlign));
                    current = [items[k]];
                    currentWidth = items[k].rect.width;
                } else {
                    current.push(items[k]);
                    currentWidth = candidateWidth;
                }
            }

            if (current.length > 0) {
                rows.push(makeRow(current, preferredAlign));
            }
        }

        for (i = 0; i < placements.length; i += 1) {
            if (placements[i].role === "hero") {
                heroIndex = i;
                break;
            }
        }
        if (heroIndex < 0) {
            heroIndex = placements.length - 1;
        }
        heroWidth = placements[heroIndex].rect.width;
        maxSupportRowWidth = Math.min(safeWidth * 0.96, Math.max(heroWidth * 1.08, comp.width * 0.42));

        for (i = 0; i < placements.length; i += 1) {
            item = placements[i];
            if (i < heroIndex) {
                before.push(item);
            } else if (i > heroIndex) {
                after.push(item);
            }
        }

        if (before.length > 0) {
            pushSupportRows(before, "center");
        }
        rows.push(makeRow([placements[heroIndex]], "center"));
        if (after.length > 0) {
            pushSupportRows(after, "center");
        }

        for (i = 0; i < rows.length; i += 1) {
            if (totalHeight > 0) {
                totalHeight += vGap;
            }
            totalHeight += rows[i].height;
        }

        top = targetCenterY - totalHeight * 0.5;
        for (i = 0; i < rows.length; i += 1) {
            row = rows[i];
            if (row.align === "left") {
                left = targetCenterX - Math.max(row.width, heroWidth) * 0.5;
            } else if (row.align === "right") {
                left = targetCenterX + Math.max(row.width, heroWidth) * 0.5 - row.width;
            } else {
                left = targetCenterX - row.width * 0.5;
            }
            x = left;
            for (j = 0; j < row.items.length; j += 1) {
                item = row.items[j];
                item.x = x;
                item.y = top + Math.max(0, row.height - item.rect.height) * 0.5;
                x += item.rect.width + hGap;
            }
            top += row.height + vGap;
        }

        bounds = CS.Renderer.getPlacementBounds(placements);
        dx = targetCenterX - (bounds.left + bounds.width * 0.5);
        dy = targetCenterY - (bounds.top + bounds.height * 0.5);
        if (bounds.width + Math.abs(dx) > safeWidth) {
            dx = 0;
        }
        if (bounds.height + Math.abs(dy) > safeHeight) {
            dy = 0;
        }
        for (i = 0; i < placements.length; i += 1) {
            placements[i].x += dx;
            placements[i].y += dy;
        }
    },

    composeBalancedTimedPlacements: function (comp, placements, heroSize) {
        var i;
        var j;
        var row;
        var item;
        var rows = [];
        var currentRow = null;
        var hGap = Math.max(6, heroSize * 0.075);
        var vGap = Math.max(7, heroSize * 0.075);
        var safeWidth = comp.width * CS.Config.layout.safeWidthRatio;
        var maxPhraseWidth = Math.min(safeWidth * 0.86, Math.max(comp.width * 0.34, heroSize * 2.6));
        var totalHeight = 0;
        var top;
        var left;
        var x;
        var bounds;
        var safeHeight = comp.height * CS.Config.layout.safeHeightRatio;
        var safeLeft = (comp.width - safeWidth) * 0.5;
        var safeTop = comp.height * CS.Config.layout.centerYRatio - safeHeight * 0.5;
        var safeRight = safeLeft + safeWidth;
        var safeBottom = safeTop + safeHeight;
        var targetCenterX = comp.width * 0.5;
        var targetCenterY = comp.height * CS.Config.layout.centerYRatio;
        var dx;
        var dy;

        for (i = 0; i < placements.length; i += 1) {
            item = placements[i];
            if (item.role === "support") {
                if (currentRow && currentRow.role === "support" && currentRow.width + hGap + item.rect.width <= maxPhraseWidth) {
                    currentRow.items.push(item);
                    currentRow.width += hGap + item.rect.width;
                    currentRow.height = Math.max(currentRow.height, item.rect.height);
                } else {
                    if (currentRow) {
                        rows.push(currentRow);
                    }
                    currentRow = {
                        role: "support",
                        items: [item],
                        width: item.rect.width,
                        height: item.rect.height
                    };
                }
            } else {
                if (currentRow) {
                    rows.push(currentRow);
                    currentRow = null;
                }
                rows.push({
                    role: item.role,
                    items: [item],
                    width: item.rect.width,
                    height: item.rect.height
                });
            }
        }
        if (currentRow) {
            rows.push(currentRow);
        }

        for (i = 0; i < rows.length; i += 1) {
            if (totalHeight > 0) {
                totalHeight += vGap;
            }
            totalHeight += rows[i].height;
        }

        top = targetCenterY - totalHeight * 0.5;
        for (i = 0; i < rows.length; i += 1) {
            row = rows[i];
            left = targetCenterX - row.width * 0.5;
            x = left;
            for (j = 0; j < row.items.length; j += 1) {
                item = row.items[j];
                item.x = x;
                item.y = top + Math.max(0, row.height - item.rect.height) * 0.5;
                x += item.rect.width + hGap;
            }
            top += row.height + vGap;
        }

        bounds = CS.Renderer.getPlacementBounds(placements);
        dx = targetCenterX - (bounds.left + bounds.width * 0.5);
        dy = targetCenterY - (bounds.top + bounds.height * 0.5);

        if (bounds.left + dx < safeLeft) {
            dx += safeLeft - (bounds.left + dx);
        } else if (bounds.right + dx > safeRight) {
            dx -= (bounds.right + dx) - safeRight;
        }
        if (bounds.top + dy < safeTop) {
            dy += safeTop - (bounds.top + dy);
        } else if (bounds.bottom + dy > safeBottom) {
            dy -= (bounds.bottom + dy) - safeBottom;
        }

        for (i = 0; i < placements.length; i += 1) {
            placements[i].x += dx;
            placements[i].y += dy;
        }
    },

    applyTimedWordPlacements: function (placements) {
        var i;
        var item;
        var position;
        for (i = 0; i < placements.length; i += 1) {
            item = placements[i];
            position = CS.Utils.getTransformProperty(item.layer, "ADBE Position", "Position");
            if (position) {
                position.setValue([
                    item.x - item.rect.left,
                    item.y - item.rect.top
                ]);
            }
        }
    },

    placementRectsOverlap: function (a, b, padding) {
        return !(
            (b.x >= a.x + a.rect.width + padding) ||
            (b.x + b.rect.width + padding <= a.x) ||
            (b.y >= a.y + a.rect.height + padding) ||
            (b.y + b.rect.height + padding <= a.y)
        );
    },

    getPlacementBounds: function (placements) {
        var minX = 999999;
        var minY = 999999;
        var maxX = -999999;
        var maxY = -999999;
        var i;
        var item;
        for (i = 0; i < placements.length; i += 1) {
            item = placements[i];
            minX = Math.min(minX, item.x);
            minY = Math.min(minY, item.y);
            maxX = Math.max(maxX, item.x + item.rect.width);
            maxY = Math.max(maxY, item.y + item.rect.height);
        }
        return {
            left: minX,
            top: minY,
            right: maxX,
            bottom: maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    },

    getGuideInfo: function (guideLayers) {
        return {
            support: CS.Renderer.getLayerTopLeft(guideLayers.support),
            accent: CS.Renderer.getLayerTopLeft(guideLayers.accent),
            hero: CS.Renderer.getLayerTopLeft(guideLayers.hero)
        };
    },

    getLayerTopLeft: function (layer) {
        var rect = CS.LayoutEngine.measureLayer(layer);
        var position = CS.Utils.getTransformProperty(layer, "ADBE Position", "Position");
        var value = position ? position.value : [0, 0];
        return {
            x: value[0] + rect.left,
            y: value[1] + rect.top
        };
    },

    removeGuideLayers: function (guideLayers) {
        try {
            guideLayers.support.remove();
            guideLayers.accent.remove();
            guideLayers.hero.remove();
        } catch (removeError) {
            CS.Utils.log("Guide layer cleanup skipped: " + removeError.message);
        }
    },

    applyRoleStyles: function (layers, heroSize, applyShadow, layoutIndex) {
        layers.support._cachedBounds = null;
        layers.accent._cachedBounds = null;
        layers.hero._cachedBounds = null;
        CS.Typography.applyToLayer(layers.support, "support", heroSize, applyShadow, layoutIndex);
        CS.Typography.applyToLayer(layers.accent, "accent", heroSize, applyShadow, layoutIndex);
        CS.Typography.applyToLayer(layers.hero, "hero", heroSize, applyShadow, layoutIndex);
    },

    setTiming: function (block, layers, controller) {
        if (controller) {
            CS.Renderer.setLayerTiming(controller, block);
        }
        CS.Renderer.setLayerTiming(layers.support, block);
        CS.Renderer.setLayerTiming(layers.accent, block);
        CS.Renderer.setLayerTiming(layers.hero, block);
    },

    applyAnimation: function (block, layers) {
        CS.Animator.apply(layers.support, block, block.animation);
        CS.Animator.apply(layers.accent, block, block.animation);
        CS.Animator.apply(layers.hero, block, block.animation);
    },

    applyAnimationToLayerList: function (block, layers) {
        var i;
        for (i = 0; i < layers.length; i += 1) {
            CS.Animator.apply(layers[i], block, block.animation);
        }
    },

    collectLayerNames: function (block, layers, controller) {
        block.generatedLayerNames = [
            layers.support.name,
            layers.accent.name,
            layers.hero.name
        ];
        if (controller) {
            block.generatedLayerNames.unshift(controller.name);
        }
    },

    collectTimedLayerNames: function (block, layers, controller) {
        var i;
        block.generatedLayerNames = [];
        if (controller) {
            block.generatedLayerNames.push(controller.name);
        }
        for (i = 0; i < layers.length; i += 1) {
            block.generatedLayerNames.push(layers[i].name);
        }
    },

    deleteBlock: function (comp, blockId) {
        var prefix = CS.Config.layerPrefix + "_" + blockId + "_";
        var i;
        for (i = comp.numLayers; i >= 1; i -= 1) {
            if (comp.layer(i).name.indexOf(prefix) === 0) {
                comp.layer(i).remove();
            }
        }
    },

    deleteAllGenerated: function (comp) {
        var prefix = CS.Config.layerPrefix + "_";
        var i;
        for (i = comp.numLayers; i >= 1; i -= 1) {
            if (comp.layer(i).name.indexOf(prefix) === 0) {
                comp.layer(i).remove();
            }
        }
    },

    isRenderableBlock: function (comp, block) {
        if (block.skip) {
            return false;
        }
        CS.Renderer.normalizeTiming(comp, block);
        return block.end > block.start;
    },

    normalizeTiming: function (comp, block) {
        var minDuration = Math.max(1 / comp.frameRate, 0.05);
        block.start = CS.Utils.clamp(block.start, 0, Math.max(0, comp.duration - minDuration));
        block.end = CS.Utils.clamp(block.end, block.start + minDuration, comp.duration);
    },

    setLayerTiming: function (layer, block) {
        layer.startTime = 0;
        layer.inPoint = block.start;
        layer.outPoint = block.end;
    },

    setTimedWordTiming: function (layer, timedWord, groupEnd) {
        layer.startTime = 0;
        layer.inPoint = timedWord.start;
        layer.outPoint = groupEnd;
    }
};
