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
                loadPath: '/tinyjs/shaders/'
            },
            data: [
                {name: 'simpleTexture'},
                {name: 'units'},
                {name: 'life'}
            ]
        },
        framebuffers: {
            defaults: {
                internalFormat: 'rgba',
                format: 'rgba',
                type: 'float',
                width: function(gl) {
                    return Math.floor(gl.viewportWidth * 0.2);
                },
                height: function(gl) {
                    return Math.floor(gl.viewportHeight * 0.2);
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
    }

    var tinyjs = new TinyJs($('#webgl-canvas')[0], options);

    /*
     * Called once right before the init() call
     */
    tinyjs.preSetup = function(callback) {

        // your code

        callback();
    };

    /*
     * Called once right after the init() call
     */
    tinyjs.postSetup = function() {

        this.myScene = new TinyJs.Scene(this);

        var object1 = new TinyJs.Object(this.buffers.square);

        var shaderContainer = new TinyJs.ShaderContainer(this);
        shaderContainer.setShader('life');

        // the objects contained in the array will be rendered using the given shader and bindings
        this.myScene.addObjects([object1], shaderContainer);

        this.myScene2 = new TinyJs.Scene(this);
        var shaderContainer2 = new TinyJs.ShaderContainer(this);
        shaderContainer2.setShader('simpleTexture');

        shaderContainer2.bindTexture('uSample0', this.fbo.scene2);
        this.myScene2.addObjects([object1], shaderContainer2);

    }

    /*
     * Called once every frame
     */
    tinyjs.renderTick = function(gl, frame) {

        var shaderContainer = this.myScene.groups[0].shaderContainer;

        shaderContainer.bindTexture('uSample0', this.fbo.scene1);
        this.myScene.render(this.fbo.scene2);

        shaderContainer.bindTexture('uSample0', this.fbo.scene2);
        this.myScene.render(this.fbo.scene1);

        this.myScene2.render(this.screen);


        /*
        this.renderObjectTo(this.buffers.square, this.fbo.screen, 'simpleTexture', function(prog) {
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(prog.uSample0, 0);
            gl.bindTexture(gl.TEXTURE_2D, that.textures.sand1);
        });
        */
    };

    /*
     * Called 60 times every seconds
     */
    tinyjs.logicTick = function() {

    };

    tinyjs.init();
});
