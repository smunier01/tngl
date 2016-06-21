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
    }

    var tngl = new TnGL($('#webgl-canvas')[0], options);

    /*
     * Called once right after the init() call
     */
    tngl.postSetup = function() {
        var square = new TnGL.Object(this.buffers.square2d);

        this.myScene = new TnGL.Scene(this);
        // enable the mouse with no interactions.
        this.myScene.mouse.enable(false);

        var scLife = tngl.getShaderContainer('life');
        this.myScene.addPart('main', [square], scLife);

        this.myScene2 = new TnGL.Scene(this);
        var scSimple = tngl.getShaderContainer('basic2D');
        this.myScene2.addPart('main', [square], scSimple);
    }

    /*
     * Called once every frame
     */
    tngl.renderTick = function(gl, frame) {
        var scLife = this.myScene.getPart('main').shaderContainer;

        scLife.bindTexture('uSample0', frame % 2 == 0 ? this.fbo.scene1 : this.fbo.scene2);
        this.myScene.render(frame % 2 == 0 ? this.fbo.scene2 : this.fbo.scene1);
        this.myScene.render(this.screen);

        var scSimple = this.myScene2.getPart('main').shaderContainer;

        // render the content of the framebuffer target to the screen.

        scSimple.bindTexture('uSample0', this.fbo.scene2);
        this.myScene2.render(this.screen);

        /*
        this.renderObjectTo(this.buffers.square, this.fbo.screen, 'simpleTexture', function(prog) {
            gl.activeTexture(gl.TEXTURE0);
            gl.uniform1i(prog.uSample0, 0);
            gl.bindTexture(gl.TEXTURE_2D, that.textures.sand1);
        });
        */
    };

    tngl.init();
});
