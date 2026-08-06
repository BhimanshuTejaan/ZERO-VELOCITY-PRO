$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.SRTParser = {
    parse: function (srtText) {
        var normalized = String(srtText).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        var entries = normalized.split(/\n\s*\n/g);
        var captions = [];
        var i;
        var entry;
        var lines;
        var lineIndex;
        var timeLine;
        var match;
        var textLines;

        for (i = 0; i < entries.length; i += 1) {
            entry = CS.Utils.trim(entries[i]);
            if (entry === "") {
                continue;
            }

            lines = entry.split("\n");
            lineIndex = 0;
            if (/^\d+$/.test(CS.Utils.trim(lines[0]))) {
                lineIndex = 1;
            }

            timeLine = CS.Utils.trim(lines[lineIndex]);
            match = timeLine.match(/(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/);
            if (!match) {
                continue;
            }

            textLines = lines.slice(lineIndex + 1);
            captions.push({
                index: captions.length + 1,
                start: CS.SRTParser.timeToSeconds(match[1]),
                end: CS.SRTParser.timeToSeconds(match[2]),
                text: CS.Utils.normalizeWhitespace(textLines.join(" "))
            });
        }

        return captions;
    },

    timeToSeconds: function (timeText) {
        var parts = String(timeText).replace(",", ".").split(":");
        var secondParts = parts[2].split(".");
        var hours = parseInt(parts[0], 10);
        var minutes = parseInt(parts[1], 10);
        var seconds = parseInt(secondParts[0], 10);
        var msStr = secondParts[1] || "000";
        while (msStr.length < 3) { msStr += "0"; }
        var ms = parseInt(msStr.substring(0, 3), 10);
        return (hours * 3600) + (minutes * 60) + seconds + (ms / 1000);
    },

    readFile: function (file) {
        var content;
        file.encoding = "UTF-8";
        if (!file.open("r")) {
            throw new Error("Could not open SRT file.");
        }
        content = file.read();
        file.close();
        return content;
    },

    buildBlocks: function (captions, wordsPerCaptionMode, layoutMode, animationMode) {
        var blocks = [];
        var timedWords = [];
        var i;
        var words;
        var startIndex = 0;
        var endIndex;
        var target;
        var chunkWords;
        var block;
        var roles;
        var idNumber = 1;

        for (i = 0; i < captions.length; i += 1) {
            words = CS.Utils.splitWords(captions[i].text);
            if (words.length > 0) {
                timedWords.push({
                    text: words[0],
                    start: captions[i].start,
                    end: captions[i].end,
                    sourceIndex: captions[i].index
                });
                if (words.length > 1) {
                    CS.Utils.log("One-word SRT expected. Extra words ignored in entry " + captions[i].index + ".");
                }
            }
        }

        target = CS.SRTParser.resolveWordTarget(timedWords.length, wordsPerCaptionMode);
        while (startIndex < timedWords.length) {
            endIndex = Math.min(timedWords.length, startIndex + target);
            chunkWords = timedWords.slice(startIndex, endIndex);
            words = CS.SRTParser.extractTimedWordText(chunkWords);
            roles = CS.Selector.selectRoles(words);
            CS.SRTParser.assignTimedWordRoles(chunkWords, roles.heroWord, roles.accentWord);
            block = {
                id: "B" + CS.Utils.pad(idNumber, 4),
                sourceIndex: chunkWords[0].sourceIndex,
                start: chunkWords[0].start,
                end: chunkWords[chunkWords.length - 1].end,
                text: words.join(" "),
                words: words,
                timedWords: chunkWords,
                heroWord: roles.heroWord,
                accentWord: roles.accentWord,
                supportText: CS.Utils.joinExceptRoles(words, roles.heroWord, roles.accentWord),
                layoutIndex: CS.SRTParser.resolveLayoutIndex(layoutMode, idNumber),
                animation: animationMode,
                generatedLayerNames: []
            };
            blocks.push(block);
            idNumber += 1;
            startIndex = endIndex;
        }

        CS.SRTParser.resolveBlockOverlaps(blocks);
        return blocks;
    },

    extractTimedWordText: function (timedWords) {
        var words = [];
        var i;
        for (i = 0; i < timedWords.length; i += 1) {
            words.push(timedWords[i].text);
        }
        return words;
    },

    assignTimedWordRoles: function (timedWords, heroWord, accentWord) {
        var heroUsed = false;
        var accentUsed = false;
        var i;
        var text;
        for (i = 0; i < timedWords.length; i += 1) {
            text = String(timedWords[i].text).toLowerCase();
            if (!heroUsed && text === String(heroWord).toLowerCase()) {
                timedWords[i].role = "hero";
                heroUsed = true;
            } else if (!accentUsed && text === String(accentWord).toLowerCase()) {
                timedWords[i].role = "accent";
                accentUsed = true;
            } else {
                timedWords[i].role = "support";
            }
        }
    },

    chunkCaption: function (caption, wordsPerCaptionMode) {
        var words = CS.Utils.splitWords(caption.text);
        var target = CS.SRTParser.resolveWordTarget(words.length, wordsPerCaptionMode);
        var chunks = [];
        var startIndex = 0;
        var endIndex;
        var duration = Math.max(0.1, caption.end - caption.start);
        var chunkStart;
        var chunkEnd;
        var chunkWords;

        if (words.length === 0) {
            return chunks;
        }

        while (startIndex < words.length) {
            endIndex = Math.min(words.length, startIndex + target);
            chunkWords = words.slice(startIndex, endIndex);
            chunkStart = caption.start + duration * (startIndex / words.length);
            chunkEnd = caption.start + duration * (endIndex / words.length);
            chunks.push({
                start: chunkStart,
                end: chunkEnd,
                words: chunkWords
            });
            startIndex = endIndex;
        }

        return chunks;
    },

    resolveWordTarget: function (wordCount, mode) {
        if (mode === "3") {
            return 3;
        }
        if (mode === "4") {
            return 4;
        }
        if (wordCount <= 5) {
            return wordCount;
        }
        if (wordCount <= 8) {
            return 4;
        }
        return 5;
    },

    resolveLayoutIndex: function (layoutMode, seed) {
        if (layoutMode === "Random") {
            return (seed - 1) % 5;
        }
        if (layoutMode === "Stacked Anchor") {
            return 0;
        }
        if (layoutMode === "Wide Top Inline") {
            return 1;
        }
        if (layoutMode === "Split Emphasis") {
            return 2;
        }
        if (layoutMode === "Overlap Bridge") {
            return 3;
        }
        if (layoutMode === "Compact Center") {
            return 4;
        }
        if (layoutMode === "Balanced Layout") {
            return 5;
        }
        if (layoutMode === "Corporate Clean Style") {
            return 6;
        }
        return 0;
    },

    resolveBlockOverlaps: function (blocks) {
        var i;
        var nextStart;
        for (i = 0; i < blocks.length; i += 1) {
            if (blocks[i].end <= blocks[i].start) {
                CS.Utils.log("Warning: Block " + blocks[i].id + " has zero or negative duration. Forcing 0.1s minimum.");
                blocks[i].end = blocks[i].start + 0.1;
            }
            if (i < blocks.length - 1) {
                nextStart = blocks[i + 1].start;
                if (blocks[i].end > nextStart) {
                    CS.Utils.log("Overlap detected between " + blocks[i].id + " and " + blocks[i + 1].id + ". Minimally correcting.");
                    blocks[i].end = nextStart;
                }
            }
        }
    }
};
