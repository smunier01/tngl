/**
 * Handle the inputs on the side bar & code mirror
 */
var LifeSimulatorUi = function() {
    this.codeMirror = null;

    $('#code').toggle();

    $('#hide-toggle').on('click', function() {
        $('#code').toggle();
    });

};

LifeSimulatorUi.prototype = {
    onNeighborMatrixChange: function(callback) {

        var _onChange = function() {

            var mat = [];

            $('#matrix td').each(function() {

                var val = 0;

                if ($(this).hasClass('selected')) {
                    val = 255;
                }

                mat.push(val, val, val);
            });

            callback(mat);
        };

        $('#matrix td').on('click', function() {
            $(this).toggleClass('selected');
            _onChange();
        });

        _onChange();
    },
    onAliveMinChange: function(callback) {
        var _onChange = function() {
            callback(parseFloat($('#aliveMin').val()));
        }

        $('#aliveMin').on('change', _onChange);

        _onChange();
    },
    onAliveMax: function(callback) {
        var _onChange = function() {
            callback(parseFloat($('#aliveMax').val()));
        }

        $('#aliveMax').on('change', _onChange);

        _onChange();
    },
    onDeadMinChange: function(callback) {
        var _onChange = function() {
            callback(parseFloat($('#deadMin').val()));
        }

        $('#deadMin').on('change', _onChange);

        _onChange();
    },
    onDeadMaxChange: function(callback) {
        var _onChange = function() {
            callback(parseFloat($('#deadMax').val()));
        };

        $('#deadMax').on('change', _onChange);

        _onChange();
    },
    hexToRgb: function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255
        ] : null;
    },
    onColorDeadChange: function(callback) {
        var that = this;
        var _onChange = function() {
            callback(that.hexToRgb($('#colorDead').val()));
        };

        $('#colorDead').onFineChange = _onChange;
        _onChange();
    },
    onColorAliveChange: function(callback) {
        var that = this;
        var _onChange = function() {
            callback(that.hexToRgb($('#colorAlive').val()));
        };
        $('#colorAlive').onFineChange = _onChange;
        _onChange();
    },
    onLoopCheckBoxChange: function(callback) {
        var _onChange = function() {
            callback($('#loopCheckbox').is(":checked"));
        };

        $('#loopCheckbox').change(_onChange);

        _onChange();
    },
    onResolutionMultiplierChange: function(callback) {
        var _onChange = function() {
            callback(parseFloat($('#resolutionMultiplier').val()));
        };
        $('#resolutionMultiplier').on('change', _onChange);
        _onChange();
    },
    codeMirrorSetup: function(shaderContainer) {
        var elem = $('#code');
        var code = shaderContainer.fragCode;
        var logsRef = shaderContainer.logs;

        /**
        * returns a list of code mirror annotation to display the errors.
        */
        var validator = function(cm, errors) {
            var found = [];
            for (var i = 0; i < errors.length; i++) {
                found.push({
                    from: CodeMirror.Pos(errors[i].line - 1, 0),
                    to: CodeMirror.Pos(errors[i].line - 1, 999),
                    message: errors[i].message,
                    severity: "error"
                });
            }
            return found;
        };

        this.codeMirror = CodeMirror(elem[0], {
            value: code,
            mode: "x-shader/x-fragment",
            lineNumbers: true,
            matchBrackets: true,
            styleActiveLine: true,
            lintOnChange: true,
            lint: {
                getAnnotations: function(cm) {
                    // logsRef is a reference to the shader logs.
                    // It should always contains the latest compilation errors.
                    return validator(cm, logsRef);
                }
            }
        });

        elem.on('mouseenter', function() {
            $('.CodeMirror').css('opacity', '0.9');
        });

        elem.on('mouseleave', function() {
            $('.CodeMirror').css('opacity', '0.4');
        });

        this.codeMirror.setSize($('#code').innerWidth() - this.codeMirror.display.nativeBarWidth, $(window).innerHeight() * 0.95);
    },
    onCodeMirrorChange: function(callback) {
        this.codeMirror.on('change', callback);
    },
    onClear: function(callback) {
        $('.clear-button').on('click', callback);
    },
    onMainChannelChange: function(callback) {
        var _onChange = function() {
            var c = $('#selectMainChannel').val();
            console.log(c);
            var channel = [];
            if (c === 'R') {
                channel = [1.0, 0.0, 0.0, 0.0];
            } else if (c === 'G') {
                channel = [0.0, 1.0, 0.0, 0.0];
            } else {
                channel = [0.0, 0.0, 1.0, 0.0];
            }

            callback(channel);
        };

        $('#selectMainChannel').on('change', _onChange);

        _onChange();
    },
    onTransCheckboxChange: function(callback) {
        var _onChange = function() {

            var r = $('#transDyingR').is(":checked");
            var g = $('#transDyingG').is(":checked");
            var b = $('#transDyingB').is(":checked");

            var trans = [0.0, 0.0, 0.0];

            trans[0] = r ? 1.0 : 0.0;
            trans[1] = g ? 1.0 : 0.0;
            trans[2] = b ? 1.0 : 0.0;

            callback(trans);
        }

        $('.transCheckbox').on('change', _onChange);

        _onChange();
    },
    onTransColorsChange: function(callback) {
        var _onChange = function() {

            var r = parseFloat($('#transDyingRColor').val());
            var g = parseFloat($('#transDyingGColor').val());
            var b = parseFloat($('#transDyingBColor').val());

            var transColor = [r, g, b];

            callback(transColor);
        }

        $('.dyingColor').on('change', _onChange);

        _onChange();
    },
    onTransSpeedChange: function(callback) {
        var _onChange = function() {

            var r = parseFloat($('#transDyingRSpeed').val());
            var g = parseFloat($('#transDyingGSpeed').val());
            var b = parseFloat($('#transDyingBSpeed').val());

            var transSpeed = [r, g, b];

            callback(transSpeed);
        }

        $('.transSpeed').on('change', _onChange);

        _onChange();
    }
};
