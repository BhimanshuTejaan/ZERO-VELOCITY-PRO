(function () {
  "use strict";

  function bind(root, model) {
    var controls = root ? root.querySelectorAll("input[type='range']") : [];
    var selects = root ? root.querySelectorAll("select") : [];
    var i;

    function updateValueLabel(input) {
      var label = root.querySelector("[data-value-for='" + input.id + "']");
      if (label) {
        label.textContent = Number(input.value).toFixed(2);
      }
    }

    for (i = 0; i < controls.length; i += 1) {
      updateValueLabel(controls[i]);
      controls[i].addEventListener("input", function (event) {
        updateValueLabel(event.target);
        model.setControl(event.target.id, event.target.value);
      });
    }

    for (i = 0; i < selects.length; i += 1) {
      selects[i].addEventListener("change", function (event) {
        model.setControl(event.target.id, event.target.value);
      });
    }
  }

  window.ZeroVelocityLayoutControls = {
    bind: bind
  };
}());
