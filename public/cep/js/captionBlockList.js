(function () {
  "use strict";

  function render(root, state) {
    var blocks = state.blocks || [];
    var i;
    var row;
    var time;
    var title;

    if (!root) {
      return;
    }

    root.innerHTML = "";
    for (i = 0; i < blocks.length; i += 1) {
      row = document.createElement("button");
      row.type = "button";
      row.className = "caption-row" + (blocks[i].id === state.activeBlockId ? " active" : "");
      row.setAttribute("data-block-id", blocks[i].id);

      time = document.createElement("span");
      time.textContent = window.ZeroVelocitySrtParser.secondsToText(blocks[i].start) + " -> " + window.ZeroVelocitySrtParser.secondsToText(blocks[i].end);

      title = document.createElement("strong");
      title.textContent = blocks[i].text;

      row.appendChild(time);
      row.appendChild(title);
      root.appendChild(row);
    }
  }

  function bind(root, model) {
    if (!root) {
      return;
    }
    root.addEventListener("click", function (event) {
      var row = event.target;
      while (row && !row.getAttribute("data-block-id")) {
        row = row.parentNode;
      }
      if (row) {
        model.selectBlock(row.getAttribute("data-block-id"));
      }
    });
  }

  window.ZeroVelocityCaptionBlockList = {
    bind: bind,
    render: render
  };
}());
