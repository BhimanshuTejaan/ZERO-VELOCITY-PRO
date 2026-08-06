$.global.CS = $.global.CS || {};
var CS = $.global.CS;

CS.Animator = {
    apply: function (layer, block, mode) {
        return;
    },

    applyFade: function (layer, startTime) {
        var opacity = CS.Utils.getTransformProperty(layer, "ADBE Opacity", "Opacity");
        var duration = CS.Config.animation.duration;

        if (!opacity) {
            return;
        }

        opacity.setValueAtTime(startTime, 0);
        opacity.setValueAtTime(startTime + duration, 100);
        if (CS.Config.animation.applyTemporalEase) {
            CS.Animator.easeProperty(opacity);
        }
    },

    applySlideFade: function (layer, startTime) {
        var position = CS.Utils.getTransformProperty(layer, "ADBE Position", "Position");
        var opacity = CS.Utils.getTransformProperty(layer, "ADBE Opacity", "Opacity");
        var duration = CS.Config.animation.duration;
        var finalPosition;

        if (!position || !opacity) {
            return;
        }

        finalPosition = position.value;
        position.setValueAtTime(startTime, [finalPosition[0], finalPosition[1] + CS.Config.animation.slideDistance]);
        position.setValueAtTime(startTime + duration, finalPosition);
        opacity.setValueAtTime(startTime, 0);
        opacity.setValueAtTime(startTime + duration, 100);

        if (CS.Config.animation.applyTemporalEase) {
            CS.Animator.easeProperty(position);
            CS.Animator.easeProperty(opacity);
        }
    },

    easeProperty: function (property) {
        var i;
        var dimensions;
        var inEase;
        var outEase;

        try {
            dimensions = property.value instanceof Array ? property.value.length : 1;
            inEase = CS.Animator.makeEaseArray(dimensions);
            outEase = CS.Animator.makeEaseArray(dimensions);
            for (i = 1; i <= property.numKeys; i += 1) {
                property.setTemporalEaseAtKey(i, inEase, outEase);
            }
        } catch (ignored) {
        }
    },

    makeEaseArray: function (dimensions) {
        var eases = [];
        var i;
        for (i = 0; i < dimensions; i += 1) {
            eases.push(new KeyframeEase(0, 66));
        }
        return eases;
    }
};
