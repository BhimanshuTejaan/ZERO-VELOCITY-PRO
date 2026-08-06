$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.Typography = {
    getBaseHeroSize: function (comp) {
        var raw = comp.height * CS.Config.typography.baseHeightRatio;
        return CS.Utils.clamp(raw, CS.Config.typography.minHeroSize, CS.Config.typography.maxHeroSize);
    },

    getRoleStyle: function (role, heroSize, layoutIndex) {
        var roleConfig;
        if (layoutIndex === 6) {
            roleConfig = role === "hero" ? CS.Config.typography.corporate.hero : CS.Config.typography.corporate.support;
        } else {
            roleConfig = CS.Config.typography[role];
        }
        return {
            fontCandidates: roleConfig.fontCandidates,
            fillColor: roleConfig.fillColor,
            fontSize: heroSize * roleConfig.sizeRatio,
            tracking: roleConfig.tracking
        };
    },

    applyToLayer: function (layer, role, heroSize, applyShadow, layoutIndex) {
        var textProp = layer.property("Source Text");
        var doc = textProp.value;
        var style = CS.Typography.getRoleStyle(role, heroSize, layoutIndex);
        var appliedFont;

        try {
            doc.resetCharStyle();
        } catch (ignoredReset) {
        }
        doc.fontSize = style.fontSize;
        doc.fillColor = style.fillColor;
        doc.applyFill = true;
        doc.applyStroke = false;
        if (CS.Config.render.applyTracking) {
            doc.tracking = style.tracking;
        }
        layer._corporateStyle = (layoutIndex === 6);
        doc.justification = ParagraphJustification.LEFT_JUSTIFY;

        if (CS.Config.render.applyCustomFonts) {
            appliedFont = CS.Typography.applyFontCandidates(doc, style.fontCandidates);
            CS.Utils.log("Font role=" + role + " requested=" + style.fontCandidates.join(",") + " applied=" + appliedFont);
        }

        textProp.setValue(doc);
        if (applyShadow && CS.Config.render.applyDropShadow) {
            CS.Typography.applyShadow(layer);
        }
    },

    applyFontCandidates: function (doc, candidates) {
        var i;
        for (i = 0; i < candidates.length; i += 1) {
            try {
                doc.font = candidates[i];
                if (String(doc.font) === String(candidates[i])) {
                    return candidates[i];
                }
            } catch (ignored) {
            }
        }
        return doc.font;
    },

    applyShadow: function (layer) {
        var effects;
        var effect;
        try {
            effects = layer.property("ADBE Effect Parade");
            if (!effects) {
                return;
            }
            effect = effects.property("CSV1 Readability Shadow");
            if (!effect) {
                effect = effects.addProperty("ADBE Drop Shadow");
                effect.name = "CSV1 Readability Shadow";
            }
            effect.property("Opacity").setValue(CS.Config.shadow.opacity);
            effect.property("Direction").setValue(CS.Config.shadow.direction);
            effect.property("Distance").setValue(CS.Config.shadow.distance);
            effect.property("Softness").setValue(CS.Config.shadow.softness);
        } catch (ignored) {
        }
    }
};
