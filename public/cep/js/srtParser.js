(function () {
  "use strict";

  function trim(value) {
    return String(value).replace(/^\s+|\s+$/g, "");
  }

  function normalizeWhitespace(value) {
    return trim(String(value).replace(/\s+/g, " "));
  }

  function timeToSeconds(timeText) {
    var parts = String(timeText).replace(",", ".").split(":");
    var secondParts = parts[2].split(".");
    var msText = secondParts[1] || "000";
    while (msText.length < 3) {
      msText += "0";
    }
    return (parseInt(parts[0], 10) * 3600) +
      (parseInt(parts[1], 10) * 60) +
      parseInt(secondParts[0], 10) +
      (parseInt(msText.substring(0, 3), 10) / 1000);
  }

  function secondsToText(seconds) {
    var totalMs = Math.round(seconds * 1000);
    var ms = totalMs % 1000;
    var totalSeconds = Math.floor(totalMs / 1000);
    var sec = totalSeconds % 60;
    var min = Math.floor(totalSeconds / 60) % 60;
    var hr = Math.floor(totalSeconds / 3600);

    function pad(value, size) {
      var text = String(value);
      while (text.length < size) {
        text = "0" + text;
      }
      return text;
    }

    return pad(hr, 2) + ":" + pad(min, 2) + ":" + pad(sec, 2) + "." + pad(ms, 3);
  }

  function cleanWord(text) {
    var firstWord = normalizeWhitespace(text).split(" ")[0] || "";
    return trim(firstWord.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, ""));
  }

  function parseEntries(srtText) {
    var normalized = String(srtText).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var entries = normalized.split(/\n\s*\n/g);
    var words = [];
    var i;
    var lines;
    var lineIndex;
    var timeLine;
    var match;
    var text;

    for (i = 0; i < entries.length; i += 1) {
      lines = trim(entries[i]).split("\n");
      if (lines.length < 2) {
        continue;
      }
      lineIndex = /^\d+$/.test(trim(lines[0])) ? 1 : 0;
      timeLine = trim(lines[lineIndex]);
      match = timeLine.match(/(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/);
      if (!match) {
        continue;
      }
      text = cleanWord(lines.slice(lineIndex + 1).join(" "));
      if (text !== "") {
        words.push({
          text: text,
          start: timeToSeconds(match[1]),
          end: timeToSeconds(match[2])
        });
      }
    }
    return words;
  }

  function chooseHeroIndex(words) {
    var i;
    if (words.length === 0) {
      return -1;
    }
    for (i = words.length - 1; i >= 0; i -= 1) {
      if (words[i].text.length >= 4) {
        return i;
      }
    }
    return words.length - 1;
  }

  function chooseAccentIndex(words, heroIndex) {
    var i;
    for (i = words.length - 1; i >= 0; i -= 1) {
      if (i !== heroIndex && words[i].text.length >= 3) {
        return i;
      }
    }
    return heroIndex > 0 ? heroIndex - 1 : -1;
  }

  function buildBlocks(words, wordsPerBlock) {
    var blocks = [];
    var size = wordsPerBlock || 4;
    var startIndex = 0;
    var endIndex;
    var slice;
    var heroIndex;
    var accentIndex;
    var block;
    var i;
    var id;

    while (startIndex < words.length) {
      endIndex = Math.min(words.length, startIndex + size);
      slice = words.slice(startIndex, endIndex);
      heroIndex = chooseHeroIndex(slice);
      accentIndex = chooseAccentIndex(slice, heroIndex);
      id = "block-" + (blocks.length + 1);
      block = {
        id: id,
        start: slice[0].start,
        end: slice[slice.length - 1].end,
        text: "",
        words: []
      };

      for (i = 0; i < slice.length; i += 1) {
        block.text += (i > 0 ? " " : "") + slice[i].text;
        block.words.push({
          id: id + "-w" + (i + 1),
          text: slice[i].text,
          start: slice[i].start,
          end: slice[i].end,
          role: i === heroIndex ? "hero" : (i === accentIndex ? "accent" : "support")
        });
      }
      blocks.push(block);
      startIndex = endIndex;
    }

    return blocks;
  }

  function resolveWordsPerBlock(mode, wordCount) {
    if (mode === "3") {
      return 3;
    }
    if (mode === "4") {
      return 4;
    }
    if (wordCount <= 5) {
      return Math.max(1, wordCount);
    }
    return 4;
  }

  function parseToBlocks(srtText, wordsPerCaptionMode) {
    var words = parseEntries(srtText);
    return buildBlocks(words, resolveWordsPerBlock(wordsPerCaptionMode || "Auto", words.length));
  }

  window.ZeroVelocitySrtParser = {
    parseEntries: parseEntries,
    parseToBlocks: parseToBlocks,
    secondsToText: secondsToText
  };
}());
