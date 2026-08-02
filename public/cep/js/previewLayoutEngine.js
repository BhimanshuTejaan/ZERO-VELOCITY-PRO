(function () {
  "use strict";

  function cloneWord(word) {
    return {
      id: word.id,
      text: word.text,
      role: word.role
    };
  }

  function createRow(role) {
    return {
      role: role,
      words: []
    };
  }

  function flush(rows, row) {
    if (row && row.words.length > 0) {
      rows.push(row);
    }
  }

  function calculateCorporate(state, block) {
    var words = block ? block.words : [];
    var rows = [];
    var before = [];
    var after = [];
    var hero = null;
    var i;
    var word;

    for (i = 0; i < words.length; i += 1) {
      word = cloneWord(words[i]);
      if (word.role === "hero" && !hero) {
        hero = word;
      } else if (!hero) {
        word.role = "support";
        before.push(word);
      } else {
        word.role = "support";
        after.push(word);
      }
    }

    if (!hero && words.length > 0) {
      hero = cloneWord(words[words.length - 1]);
      hero.role = "hero";
      before = [];
      for (i = 0; i < words.length - 1; i += 1) {
        word = cloneWord(words[i]);
        word.role = "support";
        before.push(word);
      }
    }

    if (before.length > 0) {
      rows.push({ role: "support corporate-top", words: before });
    }
    if (hero) {
      rows.push({ role: "hero", words: [hero] });
    }
    if (after.length > 0) {
      rows.push({ role: "support corporate-bottom", words: after });
    }

    return {
      blockId: block ? block.id : null,
      preset: "corporate",
      frameStyle: {
        lineGap: Math.max(0.45, state.controls.verticalSpacing * 0.62),
        heroScale: state.controls.heroSizeRatio
      },
      rows: rows
    };
  }

  function calculate(state) {
    var block = getActiveBlock(state);
    var rows = [];
    var supportRow = null;
    var words = block ? block.words : [];
    var i;
    var word;

    if (state.controls.layoutMode === "Corporate Clean Style") {
      return calculateCorporate(state, block);
    }

    for (i = 0; i < words.length; i += 1) {
      word = words[i];
      if (word.role === "support") {
        if (!supportRow) {
          supportRow = createRow("support");
        }
        supportRow.words.push(cloneWord(word));
      } else {
        flush(rows, supportRow);
        supportRow = null;
        rows.push({
          role: word.role,
          words: [cloneWord(word)]
        });
      }
    }
    flush(rows, supportRow);

    return {
      blockId: block ? block.id : null,
      frameStyle: {
        lineGap: state.controls.verticalSpacing,
        heroScale: state.controls.heroSizeRatio
      },
      rows: rows
    };
  }

  function getActiveBlock(state) {
    var blocks = state.blocks || [];
    var i;
    for (i = 0; i < blocks.length; i += 1) {
      if (blocks[i].id === state.activeBlockId) {
        return blocks[i];
      }
    }
    return blocks.length > 0 ? blocks[0] : null;
  }

  window.ZeroVelocityPreviewLayoutEngine = {
    calculate: calculate
  };
}());
