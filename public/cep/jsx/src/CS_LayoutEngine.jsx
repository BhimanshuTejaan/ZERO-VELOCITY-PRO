$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.LayoutEngine = {
    buildLayout: function (comp, block, layers, heroSize) {
        var plan;
        var fallbackPlan;
        var bounds;
        var maxWidth = comp.width * CS.Config.layout.safeWidthRatio;
        var maxHeight = comp.height * CS.Config.layout.safeHeightRatio;
        var attempts = 0;
        var scaleFactor;

        while (attempts < CS.Config.layout.maxAttempts) {
            CS.Renderer.applyRoleStyles(layers, heroSize, false, block.layoutIndex);
            plan = CS.LayoutEngine.planBestFit(comp, block.layoutIndex, layers, maxWidth, maxHeight);
            bounds = CS.LayoutEngine.getPlanBounds(plan);

            if (bounds.width <= maxWidth && bounds.height <= maxHeight) {
                return {
                    plan: CS.LayoutEngine.fitPlanToSafeArea(comp, plan),
                    heroSize: heroSize
                };
            }

            scaleFactor = Math.min(maxWidth / Math.max(1, bounds.width), maxHeight / Math.max(1, bounds.height));
            heroSize = Math.max(CS.Config.typography.minHeroSize, heroSize * scaleFactor * 0.94);
            attempts += 1;
        }

        CS.Renderer.applyRoleStyles(layers, heroSize, false, block.layoutIndex);
        fallbackPlan = CS.LayoutEngine.planStackedAnchor(comp, layers);
        return {
            plan: CS.LayoutEngine.fitPlanToSafeArea(comp, fallbackPlan),
            heroSize: heroSize
        };
    },

    planBestFit: function (comp, layoutIndex, layers, maxWidth, maxHeight) {
        var plan = CS.LayoutEngine.plan(comp, layoutIndex, layers);
        var bounds = CS.LayoutEngine.getPlanBounds(plan);
        var stackPlan;
        var stackBounds;

        if (bounds.width <= maxWidth && bounds.height <= maxHeight) {
            return plan;
        }

        stackPlan = CS.LayoutEngine.planStackedAnchor(comp, layers);
        stackBounds = CS.LayoutEngine.getPlanBounds(stackPlan);
        if (stackBounds.width <= maxWidth && stackBounds.height <= maxHeight) {
            return stackPlan;
        }

        return plan;
    },

    plan: function (comp, layoutIndex, layers) {
        if (layoutIndex === 1) {
            return CS.LayoutEngine.planWideTopInline(comp, layers);
        }
        if (layoutIndex === 2) {
            return CS.LayoutEngine.planSplitEmphasis(comp, layers);
        }
        if (layoutIndex === 3) {
            return CS.LayoutEngine.planOverlapBridge(comp, layers);
        }
        if (layoutIndex === 4) {
            return CS.LayoutEngine.planCompactCenter(comp, layers);
        }
        if (layoutIndex === 5) {
            return CS.LayoutEngine.planBalancedLayout(comp, layers);
        }
        if (layoutIndex === 6) {
            return CS.LayoutEngine.planCorporateClean(comp, layers);
        }
        return CS.LayoutEngine.planStackedAnchor(comp, layers);
    },

    measureLayer: function (layer) {
        if (layer._cachedBounds) {
            return layer._cachedBounds;
        }
        var rect;
        if (!CS.Config.layout.useSourceRectMeasurement) {
            rect = CS.LayoutEngine.estimateLayerBounds(layer);
        } else {
            try {
                rect = layer.sourceRectAtTime(Math.max(0, layer.inPoint + 0.001), false);
                if (!rect || rect.width <= 0 || rect.height <= 0) {
                    rect = CS.LayoutEngine.estimateLayerBounds(layer);
                }
            } catch (measureError) {
                rect = CS.LayoutEngine.estimateLayerBounds(layer);
            }
        }
        layer._cachedBounds = {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        };
        return layer._cachedBounds;
    },

    estimateLayerBounds: function (layer) {
        var doc = layer.property("Source Text").value;
        var text = String(doc.text || "");
        var fontSize = doc.fontSize || 72;
        var role = CS.LayoutEngine.getLayerRole(layer);
        var widthFactor = CS.LayoutEngine.getWidthFactor(role, layer);
        if (text.replace(/^\s+|\s+$/g, "") === "") {
            return {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            };
        }
        var spaceCount = text.split(" ").length - 1;
        var visualLength = Math.max(1, text.length - (spaceCount * 0.45));
        var minWidth = fontSize * (role === "accent" ? 0.24 : 0.34);
        var width = Math.max(minWidth, visualLength * fontSize * widthFactor);
        var height = fontSize * (role === "support" ? 0.92 : 1.0);
        return {
            left: 0,
            top: -height * 0.82,
            width: width,
            height: height
        };
    },

    getLayerRole: function (layer) {
        var name = String(layer.name || "").toUpperCase();
        if (name.indexOf("_ACCENT_") !== -1) {
            return "accent";
        }
        if (name.indexOf("_HERO_") !== -1) {
            return "hero";
        }
        return "support";
    },

    getWidthFactor: function (role, layer) {
        if (layer && layer._corporateStyle) {
            if (role === "hero") {
                return 0.64;
            }
            return 0.62;
        }
        if (role === "accent") {
            return 0.34;
        }
        if (role === "hero") {
            return 0.56;
        }
        return 0.43;
    },

    makeItem: function (key, layer, x, y) {
        var rect = CS.LayoutEngine.measureLayer(layer);
        return {
            key: key,
            layer: layer,
            rect: rect,
            x: x,
            y: y,
            width: rect.width,
            height: rect.height
        };
    },

    getMetrics: function (layers) {
        var support = CS.LayoutEngine.measureLayer(layers.support);
        var accent = CS.LayoutEngine.measureLayer(layers.accent);
        var hero = CS.LayoutEngine.measureLayer(layers.hero);
        var heroGap = Math.max(8, hero.height * 0.08);
        var lineGap = Math.max(7, hero.height * 0.07);
        return {
            support: support,
            accent: accent,
            hero: hero,
            heroGap: heroGap,
            lineGap: lineGap
        };
    },

    rowY: function (top, rowHeight, itemHeight) {
        return top + Math.max(0, rowHeight - itemHeight) * 0.5;
    },

    getVisualWeight: function (rect, role) {
        var density = 0.55;
        if (role === "hero") {
            density = 1.0;
        } else if (role === "accent") {
            density = 0.62;
        }
        return Math.max(0, rect.width * rect.height * density);
    },

    makeOpticalRow: function (items, gap) {
        var width = 0;
        var height = 0;
        var weight = 0;
        var i;

        for (i = 0; i < items.length; i += 1) {
            if (items[i].rect.width <= 0 || items[i].rect.height <= 0) {
                continue;
            }
            if (width > 0) {
                width += gap;
            }
            width += items[i].rect.width;
            height = Math.max(height, items[i].rect.height);
            weight += items[i].weight;
        }

        return {
            items: items,
            width: width,
            height: height,
            weight: weight
        };
    },

    buildRowsToPlan: function (comp, rows, gap) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var totalHeight = 0;
        var weightedOffset = 0;
        var totalWeight = 0;
        var rowTop = 0;
        var top;
        var row;
        var left;
        var x;
        var plan = [];
        var i;
        var j;
        var item;

        for (i = 0; i < rows.length; i += 1) {
            if (rows[i].height <= 0) {
                continue;
            }
            if (totalHeight > 0) {
                totalHeight += gap;
            }
            totalHeight += rows[i].height;
        }

        rowTop = 0;
        for (i = 0; i < rows.length; i += 1) {
            row = rows[i];
            if (row.height <= 0) {
                continue;
            }
            weightedOffset += row.weight * (rowTop + row.height * 0.5);
            totalWeight += row.weight;
            rowTop += row.height + gap;
        }

        top = centerY - (totalWeight > 0 ? weightedOffset / totalWeight : totalHeight * 0.5);
        rowTop = top;
        for (i = 0; i < rows.length; i += 1) {
            row = rows[i];
            if (row.height <= 0) {
                continue;
            }
            left = centerX - row.width * 0.5;
            x = left;
            for (j = 0; j < row.items.length; j += 1) {
                item = row.items[j];
                if (item.rect.width <= 0 || item.rect.height <= 0) {
                    plan.push(CS.LayoutEngine.makeItem(item.key, item.layer, centerX, rowTop));
                    continue;
                }
                plan.push(CS.LayoutEngine.makeItem(item.key, item.layer, x, CS.LayoutEngine.rowY(rowTop, row.height, item.rect.height)));
                x += item.rect.width + gap;
            }
            rowTop += row.height + gap;
        }

        return plan;
    },

    planBalancedLayout: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var safeWidth = comp.width * CS.Config.layout.safeWidthRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var hasSupport = m.support.width > 0;
        var hasAccent = m.accent.width > 0;
        var hasHero = m.hero.width > 0;
        var rowGap = Math.max(8, m.hero.height * 0.08);
        var lineGap = Math.max(6, m.hero.height * 0.06);
        var supportItem = { key: "support", layer: layers.support, rect: m.support, weight: CS.LayoutEngine.getVisualWeight(m.support, "support") };
        var accentItem = { key: "accent", layer: layers.accent, rect: m.accent, weight: CS.LayoutEngine.getVisualWeight(m.accent, "accent") };
        var heroItem = { key: "hero", layer: layers.hero, rect: m.hero, weight: CS.LayoutEngine.getVisualWeight(m.hero, "hero") };
        var rowWidth = (hasSupport ? m.support.width : 0) + (hasSupport && hasAccent ? rowGap : 0) + (hasAccent ? m.accent.width : 0);
        var inlineLimit = Math.min(safeWidth, Math.max(m.hero.width * 1.15, m.hero.width + (m.hero.height * 0.55)));
        var supportWeight = supportItem.weight + accentItem.weight;
        var rows = [];

        if (!hasHero) {
            return CS.LayoutEngine.planStackedAnchor(comp, layers);
        }

        if (hasSupport && hasAccent && rowWidth <= inlineLimit && supportWeight >= heroItem.weight * 0.18) {
            rows.push(CS.LayoutEngine.makeOpticalRow([supportItem, accentItem], rowGap));
            rows.push(CS.LayoutEngine.makeOpticalRow([heroItem], rowGap));
            return CS.LayoutEngine.buildRowsToPlan(comp, rows, lineGap);
        }

        if (hasSupport) {
            rows.push(CS.LayoutEngine.makeOpticalRow([supportItem], rowGap));
        }
        if (hasAccent) {
            rows.push(CS.LayoutEngine.makeOpticalRow([accentItem], rowGap));
        }
        rows.push(CS.LayoutEngine.makeOpticalRow([heroItem], rowGap));
        return CS.LayoutEngine.buildRowsToPlan(comp, rows, lineGap);
    },

    planCorporateClean: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var topRowWidth = m.support.width + (m.support.width > 0 && m.accent.width > 0 ? m.heroGap : 0) + m.accent.width;
        var topRowHeight = Math.max(m.support.height, m.accent.height);
        var lineGap = Math.max(5, m.hero.height * 0.045);
        var totalHeight = topRowHeight + lineGap + m.hero.height;
        var top = centerY - totalHeight * 0.5;
        var groupWidth = Math.max(topRowWidth, m.hero.width);
        var left = centerX - groupWidth * 0.5;
        var topLeft = centerX - topRowWidth * 0.5;
        var items = [];

        if (m.support.width > 0) {
            items.push(CS.LayoutEngine.makeItem("support", layers.support, topLeft, CS.LayoutEngine.rowY(top, topRowHeight, m.support.height)));
        }
        if (m.accent.width > 0) {
            items.push(CS.LayoutEngine.makeItem("accent", layers.accent, topLeft + m.support.width + (m.support.width > 0 ? m.heroGap : 0), CS.LayoutEngine.rowY(top, topRowHeight, m.accent.height)));
        }
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, left + (groupWidth - m.hero.width) * 0.5, top + topRowHeight + lineGap));
        return items;
    },

    planStackedAnchor: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var totalHeight = m.support.height + m.lineGap + m.accent.height + m.lineGap + m.hero.height;
        var top = centerY - totalHeight * 0.5;
        var items = [];

        items.push(CS.LayoutEngine.makeItem("support", layers.support, centerX - m.support.width * 0.5, top));
        items.push(CS.LayoutEngine.makeItem("accent", layers.accent, centerX - m.accent.width * 0.5, top + m.support.height + m.lineGap));
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, centerX - m.hero.width * 0.5, top + m.support.height + m.lineGap + m.accent.height + m.lineGap));
        return items;
    },

    planWideTopInline: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var rowWidth = m.accent.width + m.heroGap + m.hero.width;
        var rowHeight = Math.max(m.accent.height, m.hero.height);
        var totalHeight = m.support.height + m.lineGap + rowHeight;
        var top = centerY - totalHeight * 0.5;
        var left = centerX - rowWidth * 0.5;
        var items = [];

        items.push(CS.LayoutEngine.makeItem("support", layers.support, centerX - m.support.width * 0.5, top));
        items.push(CS.LayoutEngine.makeItem("accent", layers.accent, left, CS.LayoutEngine.rowY(top + m.support.height + m.lineGap, rowHeight, m.accent.height)));
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, left + m.accent.width + m.heroGap, CS.LayoutEngine.rowY(top + m.support.height + m.lineGap, rowHeight, m.hero.height)));
        return items;
    },

    planLeftAnchor: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var groupWidth = Math.max(m.support.width, m.accent.width, m.hero.width);
        var totalHeight = m.support.height + m.lineGap + m.accent.height + m.lineGap + m.hero.height;
        var top = centerY - totalHeight * 0.5;
        var left = centerX - groupWidth * 0.5;
        var items = [];

        items.push(CS.LayoutEngine.makeItem("support", layers.support, left, top));
        items.push(CS.LayoutEngine.makeItem("accent", layers.accent, left, top + m.support.height + m.lineGap));
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, left, top + m.support.height + m.lineGap + m.accent.height + m.lineGap));
        return items;
    },

    planSplitEmphasis: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var rowWidth = m.accent.width + m.heroGap + m.hero.width;
        var rowHeight = Math.max(m.accent.height, m.hero.height);
        var totalHeight = m.support.height + m.lineGap + rowHeight;
        var top = centerY - totalHeight * 0.5;
        var left = centerX - rowWidth * 0.5;
        var items = [];

        items.push(CS.LayoutEngine.makeItem("support", layers.support, left, top));
        items.push(CS.LayoutEngine.makeItem("accent", layers.accent, left, CS.LayoutEngine.rowY(top + m.support.height + m.lineGap, rowHeight, m.accent.height)));
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, left + m.accent.width + m.heroGap, CS.LayoutEngine.rowY(top + m.support.height + m.lineGap, rowHeight, m.hero.height)));
        return items;
    },

    planTwoLineHero: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var rowWidth = m.support.width + m.heroGap + m.accent.width;
        var rowHeight = Math.max(m.support.height, m.accent.height);
        var totalHeight = rowHeight + m.lineGap + m.hero.height;
        var top = centerY - totalHeight * 0.5;
        var left = centerX - rowWidth * 0.5;
        var items = [];

        items.push(CS.LayoutEngine.makeItem("support", layers.support, left, CS.LayoutEngine.rowY(top, rowHeight, m.support.height)));
        items.push(CS.LayoutEngine.makeItem("accent", layers.accent, left + m.support.width + m.heroGap, CS.LayoutEngine.rowY(top, rowHeight, m.accent.height)));
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, centerX - m.hero.width * 0.5, top + rowHeight + m.lineGap));
        return items;
    },

    planOverlapBridge: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var leftColumnWidth = Math.max(m.support.width, m.accent.width);
        var rowWidth = leftColumnWidth + m.heroGap + m.hero.width;
        var columnHeight = m.support.height + m.lineGap + m.accent.height;
        var groupHeight = Math.max(columnHeight, m.hero.height);
        var top = centerY - groupHeight * 0.5;
        var left = centerX - rowWidth * 0.5;
        var items = [];

        items.push(CS.LayoutEngine.makeItem("support", layers.support, left + leftColumnWidth - m.support.width, top));
        items.push(CS.LayoutEngine.makeItem("accent", layers.accent, left + leftColumnWidth - m.accent.width, top + m.support.height + m.lineGap));
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, left + leftColumnWidth + m.heroGap, CS.LayoutEngine.rowY(top, groupHeight, m.hero.height)));
        return items;
    },

    planCompactCenter: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var rowWidth = m.accent.width + m.heroGap + m.hero.width;
        var rowHeight = Math.max(m.accent.height, m.hero.height);
        var totalHeight = m.support.height + m.lineGap + rowHeight;
        var top = centerY - totalHeight * 0.5;
        var left = centerX - rowWidth * 0.5;
        var items = [];

        items.push(CS.LayoutEngine.makeItem("support", layers.support, centerX - m.support.width * 0.5, top));
        items.push(CS.LayoutEngine.makeItem("accent", layers.accent, left, CS.LayoutEngine.rowY(top + m.support.height + m.lineGap, rowHeight, m.accent.height)));
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, left + m.accent.width + m.heroGap, CS.LayoutEngine.rowY(top + m.support.height + m.lineGap, rowHeight, m.hero.height)));
        return items;
    },

    planKeywordPop: function (comp, layers) {
        var centerX = comp.width * 0.5;
        var centerY = comp.height * CS.Config.layout.centerYRatio;
        var m = CS.LayoutEngine.getMetrics(layers);
        var rowWidth = m.support.width + m.heroGap + m.accent.width;
        var rowHeight = Math.max(m.support.height, m.accent.height);
        var totalHeight = rowHeight + m.lineGap + m.hero.height;
        var top = centerY - totalHeight * 0.5;
        var left = centerX - Math.max(rowWidth, m.hero.width) * 0.5;
        var items = [];

        items.push(CS.LayoutEngine.makeItem("support", layers.support, left, CS.LayoutEngine.rowY(top, rowHeight, m.support.height)));
        items.push(CS.LayoutEngine.makeItem("accent", layers.accent, left + m.support.width + m.heroGap, CS.LayoutEngine.rowY(top, rowHeight, m.accent.height)));
        items.push(CS.LayoutEngine.makeItem("hero", layers.hero, centerX - m.hero.width * 0.5, top + rowHeight + m.lineGap));
        return items;
    },

    fitPlanToSafeArea: function (comp, plan) {
        var bounds = CS.LayoutEngine.getPlanBounds(plan);
        var safeWidth = comp.width * CS.Config.layout.safeWidthRatio;
        var safeHeight = comp.height * CS.Config.layout.safeHeightRatio;
        var safeLeft = (comp.width - safeWidth) * 0.5;
        var safeTop = comp.height * CS.Config.layout.centerYRatio - safeHeight * 0.5;
        var safeRight = safeLeft + safeWidth;
        var safeBottom = safeTop + safeHeight;
        var dx = 0;
        var dy = 0;
        var i;

        if (bounds.left < safeLeft) {
            dx = safeLeft - bounds.left;
        } else if (bounds.right > safeRight) {
            dx = safeRight - bounds.right;
        }

        if (bounds.top < safeTop) {
            dy = safeTop - bounds.top;
        } else if (bounds.bottom > safeBottom) {
            dy = safeBottom - bounds.bottom;
        }

        if (dx !== 0 || dy !== 0) {
            for (i = 0; i < plan.length; i += 1) {
                plan[i].x += dx;
                plan[i].y += dy;
            }
        }

        return plan;
    },

    applyPlan: function (plan) {
        var i;
        var item;
        var position;
        for (i = 0; i < plan.length; i += 1) {
            item = plan[i];
            position = CS.Utils.getTransformProperty(item.layer, "ADBE Position", "Position");
            if (position) {
                position.setValue([
                    item.x - item.rect.left,
                    item.y - item.rect.top
                ]);
            }
        }
    },

    getPlanBounds: function (plan) {
        var minX = 999999;
        var minY = 999999;
        var maxX = -999999;
        var maxY = -999999;
        var i;
        var item;

        for (i = 0; i < plan.length; i += 1) {
            item = plan[i];
            minX = Math.min(minX, item.x);
            minY = Math.min(minY, item.y);
            maxX = Math.max(maxX, item.x + item.width);
            maxY = Math.max(maxY, item.y + item.height);
        }

        return {
            left: minX,
            top: minY,
            right: maxX,
            bottom: maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
};
