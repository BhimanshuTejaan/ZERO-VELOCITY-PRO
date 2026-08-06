$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.VERSION = "1.0.0";

CS.Config = {
    pluginName: "Caption Styler V1",
    layerPrefix: "CSV1",
    controllerName: "CSV1_BLOCK",
    dataLayerName: "CSV1_SESSION_DATA",
    roleNames: {
        support: "support",
        hero: "hero",
        accent: "accent"
    },
    typography: {
        baseHeightRatio: 0.13,
        minHeroSize: 42,
        maxHeroSize: 156,
        support: {
            fontCandidates: ["HelveticaNeue-Light"],
            fillColor: [1, 1, 1],
            sizeRatio: 0.55,
            tracking: -10
        },
        hero: {
            fontCandidates: ["GroteskMedium"],
            fillColor: [1, 1, 1],
            sizeRatio: 1,
            tracking: -20
        },
        accent: {
            fontCandidates: ["Griffiths-Regular"],
            fillColor: [1, 0.92, 0],
            sizeRatio: 0.92,
            tracking: 0
        },
        corporate: {
            support: {
                fontCandidates: ["Kaleko105-Bold", "Kaleko 105 Bold", "Kaleko105Bold", "Kaleko 105"],
                fillColor: [1, 1, 1],
                sizeRatio: 0.46,
                tracking: -30
            },
            hero: {
                fontCandidates: ["Kaleko105-Heavy", "Kaleko 105 Heavy", "Kaleko105Heavy", "Kaleko 105"],
                fillColor: [0, 0.9, 0.62],
                sizeRatio: 1,
                tracking: -45
            }
        }
    },
    layout: {
        safeWidthRatio: 0.78,
        safeHeightRatio: 0.42,
        centerYRatio: 0.5,
        maxAttempts: 5,
        useSourceRectMeasurement: false
    },
    animation: {
        duration: 0.25,
        slideDistance: 34,
        applyTemporalEase: false
    },
    render: {
        createControllerNulls: false,
        warnBlockCount: 60,
        applyDropShadow: false,
        applyCustomFonts: true,
        applyTracking: true,
        useUndoForGenerate: false,
        minBlockDuration: 0.5,
        minOverlapFloor: 0.5
    },
    shadow: {
        opacity: 32,
        distance: 3,
        softness: 12,
        direction: 135
    }
};

CS.Config.writeCompConfig = function (comp, configData) {
    try {
        if (!comp) {
            return false;
        }
        var jsonStr = typeof JSON !== "undefined" && JSON.stringify ? JSON.stringify(configData) : "";
        comp.comment = jsonStr;
        return true;
    } catch (_err) {
        return false;
    }
};

CS.Config.readCompConfig = function (comp) {
    try {
        if (!comp || !comp.comment) {
            return null;
        }
        var rawComment = comp.comment;
        if (!rawComment || typeof rawComment !== "string") {
            return null;
        }
        if (typeof JSON !== "undefined" && JSON.parse) {
            return JSON.parse(rawComment);
        }
        return eval("(" + rawComment + ")");
    } catch (_err) {
        return null;
    }
};
