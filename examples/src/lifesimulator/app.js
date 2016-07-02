$(function() {

    /**
    * settings for the framework.
    */
    var options = {
        /**
        * list of webgl extensions that will be needed for the programs.
        *  - 'name' can be anything. It it simply used as a way to get the reference back if needed.
        *  - 'source' must be the name of a valid extension.
        */
        extensions: {
            data: [
                // enable floating point textures.
                {
                    name: 'textureFloat',
                    source: 'OES_texture_float',
                },
                // enable linear filtering on floating point textures.
                {
                    name: 'textureFloatLinear',
                    source: 'OES_texture_float_linear'
                }
            ]
        },
        /**
        * Options to specify the shader programs that will be used in this application.
        * The shader programs created will be available in 'shaderPrograms'.
        */
        shaders: {
            options: {
                // set to 'false' to prevent the browser from caching the shader files (default: true).
                cache: true,
                // extensions for the fragments shaders (default: frag)
                fragExt: 'frag',
                // extensions for the vertex shaders (default: vertex)
                vertexExt: 'vertex',
                // directory containing the shaders (default: ?)
                loadPath: '../../shaders/'
            },
            /**
            * The list of shaders to compile. Only the property 'name' is needed.
            * For example, assuming the above options, if a line contains : {name: 'example'},
            * then a shader program named 'example' will be created containing /shaders/example.frag & /shaders/example.vertex.
            */
            data: [
                {name: 'life2'},
                {name: 'basic2D'}
            ]
        },
        /**
        * Options to specify the framebuffers that will be used in this application.
        *
        * The framebuffers created will be available in 'fbo'
        */
        framebuffers: {
            /**
            * default options that will be applied to every framebuffers unless specified in the 'data' part.
            */
            defaults: {
                // alpha, luminance, luminance_alpha, rgb, rgba. (default: rgb)
                internalFormat: 'rgba',
                // alpha, luminance, luminance_alpha, rgb, rgba. (default: rgb)
                format: 'rgba',
                // type of the data. byte, float (requires extension)
                type: 'float',
                // width for the framebuffer, can be a constant value or a function with the webgl context as a parameter.
                width: function(gl) {
                    return Math.floor(gl.viewportWidth * 1.0);
                },
                // height for the framebuffer, can be a constant value or a function with the webgl context as a parameter.
                height: function(gl) {
                    return Math.floor(gl.viewportHeight * 1.0);
                },
                // filtering type, 'nearest' or 'linear'
                filtering: 'nearest',
                // if the framebuffer needs a depth buffer (16 bits per pixels).
                depth: false
            },
            data: [
                {name: 'scene1'},
                {name: 'scene2'}
            ]
        }
    };

    //
    // creates the framework object with the webglcontext and our options.
    //

    var tngl = new TnGL($('#webgl-canvas')[0], options);

    /*
     * Called once right after the init() call
     */
    tngl.postSetup = function() {

        var that = this;

        // the shaderContainer containing the program, the text of each shader and the compiled version
        var scLife = this.getShaderContainer('life2');

        //
        // UI things
        //

        var ui = new LifeSimulatorUi();

        //
        // Creates a texture based on the neighborsMatrix in the menu.
        // This texture is called 'neighborsMatrix' and will be sent to the shader.
        // This texture is updated when the matrix table change in the UI menu.
        //

        ui.onNeighborMatrixChange(function(matrixArray) {
            that.createTextureFromArray('neighborsMatrix', matrixArray);
        });

        //
        // Bind the UI inputs to the appropriate uniform.
        // Update it on change.
        //

        ui.onAliveMinChange(function(val) {
            scLife.bindUniform('uAliveMin', val);
        });

        ui.onAliveMax(function(val) {
            scLife.bindUniform('uAliveMax', val);
        });

        ui.onDeadMinChange(function(val) {
            scLife.bindUniform('uDeadMin', val);
        });

        ui.onDeadMaxChange(function(val) {
            scLife.bindUniform('uDeadMax', val);
        });

        ui.onColorAliveChange(function(val) {
            scLife.bindUniform('uColorAlive', val);
        });

        ui.onColorDeadChange(function(val) {
            scLife.bindUniform('uColorDead', val);
        });

        ui.onLoopCheckBoxChange(function(isChecked) {
            scLife.bindUniform('uLoop', isChecked, true);
        });

        ui.onResolutionMultiplierChange(function(val) {
            var width = that.gl.viewportWidth;
            var height = that.gl.viewportHeight;

            var width_m = Math.floor(width * val);
            var height_m = Math.floor(height * val);

            that.changeFramebufferResolution('scene1', width_m, height_m);
            that.changeFramebufferResolution('scene2', width_m, height_m);
        });

        ui.onMainChannelChange(function(val) {
            scLife.bindUniform('uDyingChannel', val);
        });

        ui.onTransCheckboxChange(function(val) {
            scLife.bindUniform('uTransitions', val);
        });

        ui.onTransColorsChange(function(val) {
            scLife.bindUniform('uColorDying', val);
        });

        ui.onTransSpeedChange(function(val) {
            scLife.bindUniform('uTransSpeed', val);
        });

        // setup CodeMirror and link it to our scLife shaderContainer.
        ui.codeMirrorSetup(scLife);

        // when the text inside the editor change, update the shader code, then recompile it.
        ui.onCodeMirrorChange(function(cm) {
            scLife.setFragCode(cm.getValue());
            scLife.compile();
        });

        // the shader will clear the framebuffer when uClear is equal to 1.
        ui.onClear(function() {
            scLife.bindUniform('uClear', 1);
        });

        //
        // We're finally done with the annoying UI things.
        //

        this.myScene = new TnGL.Scene(this);

        // enable the mouse with no interactions.
        this.myScene.mouse.enable(false);

        this.addStats(0);
        this.addStats(1);
        this.addStats(2);

        // Every scene needs an object.
        // Since we simply want to draw to the screen, a square will do just fine.
        // By default, it is a square of 1x1 units, which is exactly the same as the default
        // viewport. Therefore we don't have anything to do related to the camera, this square
        // will fill our viewport.
        var square = new TnGL.Object(this.buffers.square2d);

        // our scene is composed of a single part (called 'main')
        // This part is composed of a single object (a square).
        // Every object in this part will be rendered using the shader program contained in 'scLife' ('life2').
        this.myScene.addPart('main', [square], scLife);

        // neighborsMatrix is a texture created by calling 'createTextureFromArray' earlier
        // 'uNeighboring' is a uSampler variable in the shader 'life2'
        // 'life2' is created during the init process based on the option object.
        // 'life2' is the shader program used by our shader container 'scLife'.
        scLife.bindTexture('uNeighboring', 'neighborsMatrix');

        // We need a shader program that will simply write a framebuffer to the screen.
        // We can't use the 'life' shader because it renders things badly when
        // the resolution of the source framebuffer is smaller than the resolution of the target.
        var scTexture = this.getShaderContainer('basic2D');
        this.myScene2 = new TnGL.Scene(this);
        this.myScene2.addPart('main', [square], scTexture);
    }

    /*
     * Called once every frame
     */
    tngl.renderTick = function(gl, frame) {

        var scLife = this.myScene.getPart('main').shaderContainer;

        // swap the source & the target every frame

        scLife.bindTexture('uSample0', frame % 2 == 0 ? this.fbo.scene1 : this.fbo.scene2);
        this.myScene.render(frame % 2 == 0 ? this.fbo.scene2 : this.fbo.scene1);

        var scTexture = this.myScene2.getPart('main').shaderContainer;

        // render the content of the framebuffer target to the screen.

        scTexture.bindTexture('uSample0', this.fbo.scene2);
        this.myScene2.render(this.screen);

        // when the user click on the clear button, uClear will be set to 1.
        // let's put it back to 0 (the fbos have been cleared by now).
        scLife.bindUniform('uClear', 0);
    };

    tngl.logicTick = function(gl, frame) {
        if (frame % 5 === 0) {
            if ($('#transDyingR').is(":checked")) {
                $('#transDyingRColor').val(this.timeSinceStart / 1000.0 * $('#transDyingRSpeed').val() % 1.0);
            }
            if ($('#transDyingG').is(":checked")) {
                $('#transDyingGColor').val(this.timeSinceStart / 1000.0 * $('#transDyingGSpeed').val() % 1.0);
            }
            if ($('#transDyingB').is(":checked")) {
                $('#transDyingBColor').val(this.timeSinceStart / 1000.0 * $('#transDyingBSpeed').val() % 1.0);
            }
        }
    };

    //
    // go!
    //

    tngl.init();
});
