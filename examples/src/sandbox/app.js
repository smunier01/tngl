$(function() {

    var options = {
        extensions: {
            data: [
                {
                    name: 'textureFloat',
                    source: 'OES_texture_float',
                },
                {
                    name: 'textureFloatLinear',
                    source: 'OES_texture_float_linear'
                }
            ]
        },
        shaders: {
            options: {
                cache: true,
                fragExt: 'frag',
                vertexExt: 'vertex',
                loadPath: '/shaders/'
            },
            data: [
                {name: 'basic2D'},
                {name: 'life'}
            ]
        },
        framebuffers: {
            defaults: {
                internalFormat: 'rgba',
                format: 'rgba',
                type: 'float',
                width: function(gl) {
                    return Math.floor(gl.viewportWidth * 1.0);
                },
                height: function(gl) {
                    return Math.floor(gl.viewportHeight * 1.0);
                },
                filtering: 'nearest',
                depth: false
            },
            data: [
                {
                    name: 'scene1',
                },
                {
                    name: 'scene2',
                }
            ]
        }
    };

    var tinyjs = new TinyJs($('#webgl-canvas')[0], options);

    /*
     * Called once right after the init() call
     */
    tinyjs.postSetup = function() {

        // text area where the shader code is
        var textarea = $('#code');

        // button that should hide the textarea
        var hideButton = $('#code-area').find('#hide-toggle');

        // the shaderContainer containing the program, the text of each shader and the compiled version
        var shaderContainer = this.getShaderContainer('life');

        // textarea[0].innerHTML = shaderContainer.fragCode;
        // hljs.highlightBlock(textarea[0]);

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

        var myCodeMirror = CodeMirror($('#code')[0], {
            value: shaderContainer.fragCode,
            mode: "x-shader/x-fragment",
            lineNumbers: true,
            matchBrackets: true,
            styleActiveLine: true,
            lintOnChange: true,
            lint: {
                getAnnotations: function(cm) {
                    return validator(cm, shaderContainer.logs.frag);
                }
            }
        });

        console.log(myCodeMirror);

        myCodeMirror.setSize($(window).innerWidth() * 0.4, $(window).innerHeight() * 0.95);

        $('#code').on('mouseenter', function() {
            $('.CodeMirror').css('opacity', '0.9');
        });

        $('#code').on('mouseleave', function() {
            $('.CodeMirror').css('opacity', '0.4');
        });

        myCodeMirror.on('change', function(cm) {
            shaderContainer.setFragCode(cm.getValue());
            shaderContainer.compile();
        });

        hideButton.on('click', function() {
            textarea.toggle();
        });

        this.myScene = new TinyJs.Scene(this);
        this.myScene.mouse.enable(false);

        var object1 = new TinyJs.Object(this.buffers.square2d);

        // the objects contained in the array will be rendered using the given shader and bindings
        this.myScene.addPart('somename', [object1], shaderContainer);

        this.myScene2 = new TinyJs.Scene(this);

        var shaderContainer2 = this.getShaderContainer('basic2D');

        shaderContainer2.bindTexture('uSample0', this.fbo.scene2);
        this.myScene2.addPart('somename', [object1], shaderContainer2);

    }

    /*
     * Called once every frame
     */
    tinyjs.renderTick = function(gl, frame) {

        var shaderContainer = this.getShaderContainer('life');

        shaderContainer.bindTexture('uSample0', this.fbo.scene1);
        this.myScene.render(this.fbo.scene2);

        shaderContainer.bindTexture('uSample0', this.fbo.scene2);
        this.myScene.render(this.fbo.scene1);

        this.myScene2.render(this.screen);

    };

    /*
     * Called 60 times every seconds
     */
    tinyjs.logicTick = function() {

    };

    tinyjs.init();
});
