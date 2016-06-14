var TnGL = require('./core.js');

TnGL.Scene = function(engine) {
    this.engine = engine;
    this.camera = new TnGL.Camera();
    this.mouse = new TnGL.Mouse(this);
    this.parts = [];
    this.fov = 45.0;
    this.nearPlane = 1.0;
    this.farPlane = 1000.0;
};

TnGL.Scene.prototype = {
    addPart: function(name, objects, shaderContainer) {
        if (!(name in this.parts)) {
            this.parts[name] = new TnGL.ScenePart(objects, shaderContainer);
        } else {
            console.warn('Scene already has a part named ' + name);
        }
    },
    render: function(to) {
        this.renderWithViewport(to, {x: 0, y: 0, width: to.width, height: to.height});
    },
    renderWithViewport: function(to, viewport) {

        var gl = this.engine.gl;

        // @TODO check if 'to' is valid
        gl.bindFramebuffer(gl.FRAMEBUFFER, to.framebuffer);

        // @TODO give the option to change the first 2 parameters
        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

        // @TODO not always necessary, and I probably forgot some properties
        if (to.framebuffer) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
        }

        if (to.depth) {
            gl.enable(gl.DEPTH_TEST)
        } else {
            gl.disable(gl.DEPTH_TEST);
        }

        // this.camera.update();

        // @TODO maybe the content of the loop should be moved to something like ShaderContainer.render() ?

        // A scene is composed of multiple part. a 'part' is an array of object and a ShaderContainer object.
        // Let's render each of those parts.
        for (var partName in this.parts) {

            var part = this.parts[partName];

            var objects = part.getObjects();
            var shaderContainer = part.getShaderContainer();
            var prog = shaderContainer.program;

            gl.useProgram(prog);

            var props = shaderContainer.findShaderProperties();

            // enable all the attributes
            for (var attr1 of props.attributes) {
                gl.enableVertexAttribArray(prog[attr1]);
            }

            // bind textures
            shaderContainer.updateTextures();

            // bind uniforms
            shaderContainer.updateUniforms(this, viewport);

            // @TODO maybe the content of the loop should be move to something like Object.render()
            for (var object of objects) {

                shaderContainer.updatePositionUniforms(object);

                var buffer = object.buffer;

                // no point re-binding all attributes when the previous object had the same buffer model.
                // @TODO check this, there might be other test to do to be sure
                //if (buffer.id !== shaderContainer.currentBufferId) {

                gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertexPosition);
                gl.vertexAttribPointer(prog.aVertexPosition, buffer.vertexPosition.itemSize,
                                       gl.FLOAT, false, 0, 0);

                if (prog.aTexturePosition) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.uv);
                    gl.vertexAttribPointer(prog.aTexturePosition, buffer.uv.itemSize,
                                           gl.FLOAT, false, 0, 0);

                }

                if (prog.aVertexNormal) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normals);
                    gl.vertexAttribPointer(prog.aVertexNormal, buffer.normals.itemSize,
                                           gl.FLOAT, false, 0, 0);
                }
                //}

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.vertexIndex);

                // @TODO gl.UNSIGNED_INT support ?
                gl.drawElements(gl.TRIANGLES, buffer.vertexIndex.numItems, gl.UNSIGNED_SHORT, 0);

                shaderContainer.currentBufferId = buffer.id;
            }

            shaderContainer.currentBufferId = -1;

            // disable all the attributes
            for (var attr2 of props.attributes) {
                gl.disableVertexAttribArray(prog[attr2]);
            }

        }

        // cleanup

        gl.disable(gl.DEPTH_TEST);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    getPart: function(name) {
        return this.parts[name];
    }
};

module.exports = TnGL.Scene;
