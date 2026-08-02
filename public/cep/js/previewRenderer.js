(function () {
  "use strict";

  function clearNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function createWord(word, frameStyle) {
    var element = document.createElement("span");
    var role = word.role || "support";
    element.className = "preview-word preview-word-" + role;
    element.textContent = word.text || "";
    if (role === "hero") {
      element.style.fontSize = String(Math.round(58 * (frameStyle.heroScale || 1))) + "px";
    }
    return element;
  }

  function createRow(row, frameStyle) {
    var rowElement = document.createElement("div");
    var words = row.words || [];
    var roleClass = String(row.role || "support").replace(/\s+/g, " preview-line-");
    var i;

    rowElement.className = "preview-line preview-line-" + roleClass;
    for (i = 0; i < words.length; i += 1) {
      rowElement.appendChild(createWord(words[i], frameStyle));
    }
    return rowElement;
  }

  function render(target, layoutData) {
    var frame = document.createElement("div");
    var rows = layoutData && layoutData.rows ? layoutData.rows : [];
    var frameStyle = layoutData && layoutData.frameStyle ? layoutData.frameStyle : {};
    var preset = layoutData && layoutData.preset ? layoutData.preset : "balanced";
    var i;

    if (!target) {
      return;
    }

    clearNode(target);
    frame.className = "preview-caption-frame preview-preset-" + preset;
    frame.style.setProperty("--line-gap", frameStyle.lineGap || 1);
    frame.style.setProperty("--hero-scale", frameStyle.heroScale || 1);
    frame.style.gap = String(Math.round(10 * (frameStyle.lineGap || 1))) + "px";

    for (i = 0; i < rows.length; i += 1) {
      frame.appendChild(createRow(rows[i], frameStyle));
    }

    target.appendChild(frame);
  }

  window.CaptionPreviewRenderer = {
    render: render
  };
}());
