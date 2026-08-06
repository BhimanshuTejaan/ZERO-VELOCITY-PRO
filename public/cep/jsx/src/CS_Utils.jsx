$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.Utils = {
    trim: function (value) {
        return String(value).replace(/^\s+|\s+$/g, "");
    },

    normalizeWhitespace: function (value) {
        return CS.Utils.trim(String(value).replace(/\s+/g, " "));
    },

    pad: function (numberValue, width) {
        var text = String(numberValue);
        while (text.length < width) {
            text = "0" + text;
        }
        return text;
    },

    clamp: function (value, minValue, maxValue) {
        return Math.max(minValue, Math.min(maxValue, value));
    },

    cleanWord: function (word) {
        return CS.Utils.trim(String(word).replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, ""));
    },

    splitWords: function (text) {
        var raw = CS.Utils.normalizeWhitespace(text).split(" ");
        var words = [];
        var i;
        var cleaned;
        for (i = 0; i < raw.length; i += 1) {
            cleaned = CS.Utils.cleanWord(raw[i]);
            if (cleaned !== "") {
                words.push(cleaned);
            }
        }
        return words;
    },

    contains: function (list, value) {
        var i;
        for (i = 0; i < list.length; i += 1) {
            if (String(list[i]).toLowerCase() === String(value).toLowerCase()) {
                return true;
            }
        }
        return false;
    },

    indexOfWord: function (list, value) {
        var i;
        for (i = 0; i < list.length; i += 1) {
            if (String(list[i]).toLowerCase() === String(value).toLowerCase()) {
                return i;
            }
        }
        return -1;
    },

    joinExceptRoles: function (words, heroWord, accentWord) {
        var support = [];
        var heroUsed = false;
        var accentUsed = false;
        var i;
        for (i = 0; i < words.length; i += 1) {
            if (!heroUsed && String(words[i]).toLowerCase() === String(heroWord).toLowerCase()) {
                heroUsed = true;
            } else if (!accentUsed && String(words[i]).toLowerCase() === String(accentWord).toLowerCase()) {
                accentUsed = true;
            } else {
                support.push(words[i]);
            }
        }
        return support.join(" ");
    },

    timeToText: function (seconds) {
        var totalMs = Math.round(seconds * 1000);
        var ms = totalMs % 1000;
        var totalSeconds = Math.floor(totalMs / 1000);
        var sec = totalSeconds % 60;
        var min = Math.floor(totalSeconds / 60) % 60;
        var hr = Math.floor(totalSeconds / 3600);
        return CS.Utils.pad(hr, 2) + ":" + CS.Utils.pad(min, 2) + ":" + CS.Utils.pad(sec, 2) + "." + CS.Utils.pad(ms, 3);
    },

    getActiveComp: function () {
        if (!app.project || !(app.project.activeItem instanceof CompItem)) {
            return null;
        }
        return app.project.activeItem;
    },

    getTransformProperty: function (layer, matchName, displayName) {
        var transform = layer.property("ADBE Transform Group");
        var prop = null;
        if (transform) {
            prop = transform.property(matchName);
            if (!prop && displayName) {
                prop = transform.property(displayName);
            }
        }
        return prop;
    },

    removeLayerByName: function (comp, layerName) {
        var i;
        for (i = comp.numLayers; i >= 1; i -= 1) {
            if (comp.layer(i).name === layerName) {
                comp.layer(i).remove();
            }
        }
    },

    safeLayerNamePart: function (text) {
        return String(text).replace(/[\\\/:\*\?"<>\|]/g, "_").replace(/\s+/g, "_").substr(0, 32);
    },

    log: function (message) {
        var file;
        try {
            file = new File(Folder.temp.fsName + "/CaptionStylerV1.log");
            file.encoding = "UTF-8";
            if (file.open("a")) {
                file.writeln(new Date().toString() + "  " + message);
                file.close();
            }
        } catch (ignored) {
        }
    }
};
