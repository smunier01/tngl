$(function() {

    var options = {
        extensions: {},
        shaders: {
            options: {
                fragExt: 'frag',
                vertexExt: 'vertex',
                loadPath: '../../shaders/'
            },
            data: [
                {name: 'simpleColor'}
            ]
        },
        textures: {},
        framebuffers: {}
    };

    var tngl = new TnGL($('#webgl-canvas')[0], options);

    /*
     * Called once right after the init() call
     */
    tngl.postSetup = function() {

        //
        // create a red cube
        //

        var cube = new TnGL.Object(this.buffers.cube);
        cube.color = [1.0, 0.0, 0.0];
		cube.translate([0.0, 1.0, 0.0], 1.0);

        // a 100x100 square as a floor
        var floor = new TnGL.Object(this.buffers.square);
		this.myscope = {};
		this.myscope.cube = cube;
		floor.color = [0.3, 0.3, 0.3];
		floor.scale = [100.0, 100.0, 100.0];

        //
        // shader containers
        //

        // shaders for the cubes (no texture, only a color)
        var scColor = this.getShaderContainer('simpleColor');

        //
        // Scenes setup
        //

        this.mainScene = new TnGL.Scene(this);

        // it will draw both cubes with our 'simpleColor' shaders
        this.mainScene.addPart('main', [cube, floor], scColor);

        this.mainScene.mouse.enable(true);

		//
		// Camera setup
		//

        this.mainScene.camera
            .perspective(45.0, this.gl.viewportWidth / this.gl.viewportHeight, 1.0, 10000.0)
            .lookAt([10.0, 10.0, 0.0], cube.position, [0.0, 1.0, 0.0])
        ;
    };

    /*
     * Called once every frame
     */
    tngl.renderTick = function(gl, frame) {
        this.mainScene.render(this.screen);
    };

    /*
     * Called 60 times every seconds
     */
    tngl.logicTick = function() {
        //this.myscope.cube.position = [0.0, 0.0, 0.0];
        this.myscope.cube.quatRotateX(0.01);

        //console.log(this.myscope.cube.mvMatrix);
    };

    tngl.init();
});
