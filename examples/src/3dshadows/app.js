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
                },
                {
                    name: 'standDerivation',
                    source: 'OES_standard_derivatives'
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
                {name: 'simpleColor'},
                {name: 'simpleTexture'},
                {name: 'basic2D'},
                {name: 'depthMap'}
            ]
        },
        textures: {
            options: {
                loadPath: '/textures/'
            },
            data: [
                {name: 'sand1', source: 'sand1.png'}
            ]
        },
        framebuffers: {
            defaults: {
                internalFormat: 'rgba',
                format: 'rgba',
                type: 'float',
                width: function(gl) {
                    return Math.floor(gl.viewportWidth);
                },
                height: function(gl) {
                    return Math.floor(gl.viewportHeight);
                },
                filtering: 'linear',
                depth: true
            },
            data: [
                {
                    name: 'dm',
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

        this.addStats(0);
        this.addStats(1);
        this.addStats(2);

        //
        // objects
        //

        var cube1 = new TnGL.Object(this.buffers.cube);
        this.cube = cube1;
        cube1.color = [1.0, 0.0, 0.0];
        cube1.translate([0.0, 1.0, -10.0], 1);
        console.log(cube1);

        // a 100x100 square as a floor
        this.createBuffer('floor', this.getModel('square', 100));
        var floor = new TnGL.Object(this.buffers.floor);

        // a 0.2 x 0.2 x 0.2 green cube to simulate the position of the light
        var light = new TnGL.Object(this.buffers.cube);
        this.light = light;
        light.color = [0.0, 1.0, 0.0];
        light.scale = [0.2, 0.2, 0.2];
        light.translate([-10.0, 5.0, -10.0], 1.0);

        //
        // shader containers
        //

        // shaders for the floor
        var scTexture = this.getShaderContainer('simpleTexture');
        scTexture.bindTexture('uSample0', 'sand1');

        // shaders for the cubes (no texture, only a color)
        var scColor = this.getShaderContainer('simpleColor');

        // shaders for creating the depthMap
        var scDepthMap = this.getShaderContainer('depthMap');

        //
        // Scenes setup
        //

        // mainScene will be used to draw all the object & shadows

        this.mainScene = new TnGL.Scene(this);

        // it will draw both cubes with our 'simpleColor' shaders
        this.mainScene.addPart('myCubes', [light, cube1], scColor);
        // and the floor with 'simpleTexture'
        this.mainScene.addPart('floor', [floor], scTexture);

        this.mainScene.mouse.enable(true);

        this.mainScene.camera
            .perspective(45.0, this.gl.viewportWidth / this.gl.viewportHeight, 1.0, 10000.0)
            .translate([10.0, 10.0, 0.0], 1.0)
            .update();

        console.log(this.mainScene.camera);

        // scene that will render the depth map

        this.depthMapScene = new TnGL.Scene(this);

        this.depthMapScene.addPart('main', [cube1, floor], scDepthMap);
        this.depthMapScene.camera.lookAt(light.position, cube1.position, [0.0, 1.0, 0.0]);
        this.depthMapScene.camera.perspective(45.0, this.gl.viewportWidth / this.gl.viewportHeight, 1.0, 50.0);

        this.scene2d = new TnGL.Scene(this);
        this.scene2d.addPart('square', [new TnGL.Object(this.buffers.square2d)], this.getShaderContainer('basic2D'));
    }

    /*
     * Called once every frame
     */
    tngl.renderTick = function(gl, frame) {

        // let's make the light rotate around the cube
        this.light.rotateYFromCenter(this.cube.position, 0.01);

        // and make the actual 'light' (the camera modelview matrix) point towards the cube
        this.depthMapScene.camera.lookAt(this.light.position, this.cube.position, [0.0, 1.0, 0.0]);

        this.depthMapScene.getPart('main').shaderContainer.uniformBinding = {
            'uLightNearPlane': this.depthMapScene.camera.near,
            'uLightFarPlane': this.depthMapScene.camera.far
        };

        // we render the depth map to our framebuffer 'dm'
        this.depthMapScene
            .render(this.fbo.dm)
        ;

        // @TODO change 'bind' to 'map' & 'binding' or 'mapping', it makes more sense.
        // tell the shader that the framebuffer 'dm' must be used as a source for the depthMap texture
        this.mainScene.getPart('floor').shaderContainer
            .bindTexture('uDepthMap', this.fbo.dm)
            .bindUniform('uLightMVMatrix', this.depthMapScene.camera.mvMatrix)
            .bindUniform('uLightPMatrix', this.depthMapScene.camera.pMatrix)
            .bindUniform('uLightNearPlane', this.depthMapScene.camera.near)
            .bindUniform('uLightFarPlane', this.depthMapScene.camera.far)
        ;

        // @TODO make the use of 'this.screen' optional (I can simply use it anyway if there is no arguments)
        // we render it on the canvas / screen.
        this.mainScene
            .render(this.screen)
        ;

        // to check the result
        this.scene2d.getPart('square').shaderContainer.bindTexture('uSample0', this.fbo.dm);
        this.scene2d.renderWithViewport(this.screen, {x: gl.viewportWidth * 0.75,
                                                      y: 0,
                                                      width: gl.viewportWidth * 0.25,
                                                      height: gl.viewportHeight * 0.25});

    };

    /*
     * Called 60 times every seconds
     */
    tngl.logicTick = function() {

    };

    tngl.init();
});
