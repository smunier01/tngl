var TnGL = require('./core.js');

/**
 * Utility class to group related rendering functions
 */
TnGL.Renderer = function(gl) {
    this.gl = gl;
    this.target = null;
    this.viewport = null;
    this.scene = null;
};

TnGL.Renderer.prototype = {
    setScene: function(scene) {
        this.scene = scene;
    },
    setTarget: function(target) {
        this.target = target;
    },
    setViewport: function(viewport) {
        this.viewport = viewport;
    },
    renderObject: function(object, shaderContainer) {
        var gl = this.gl;
        var prog = shaderContainer.program;

        // no point re-binding all attributes when the previous object had the same buffer model.
        // @TODO check this, there might be other test to do to be sure
        //if (buffer.id !== shaderContainer.currentBufferId) {

        gl.bindBuffer(gl.ARRAY_BUFFER, object.buffer.vertexPosition);
        gl.vertexAttribPointer(prog.aVertexPosition, object.buffer.vertexPosition.itemSize, gl.FLOAT, false, 0, 0);

        if (prog.aTexturePosition) {
            gl.bindBuffer(gl.ARRAY_BUFFER, object.buffer.uv);
            gl.vertexAttribPointer(prog.aTexturePosition, object.buffer.uv.itemSize, gl.FLOAT, false, 0, 0);
        }

        if (prog.aVertexNormal) {
            gl.bindBuffer(gl.ARRAY_BUFFER, object.buffer.normals);
            gl.vertexAttribPointer(prog.aVertexNormal, object.buffer.normals.itemSize, gl.FLOAT, false, 0, 0);
        }
        //}

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, object.buffer.vertexIndex);

        // @TODO gl.UNSIGNED_INT support ?
        gl.drawElements(gl.TRIANGLES, object.buffer.vertexIndex.numItems, gl.UNSIGNED_SHORT, 0);

        shaderContainer.currentBufferId = object.buffer.id;
    },
    render: function() {
        var gl = this.gl;
        var viewport = this.viewport;
        var to = this.target;

        // @TODO check if 'to' is valid
        gl.bindFramebuffer(gl.FRAMEBUFFER, to.framebuffer);

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

        if (to.framebuffer) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
        }

        to.depth ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);

        // @TODO maybe the content of the loop should be moved to something like ShaderContainer.render() ?

        // A scene is composed of multiple part. a 'part' is an array of object and a ShaderContainer object.
        // Let's render each of those parts.
        for (var partName in this.scene.parts) {
            this.renderScenePart(this.scene.parts[partName]);
        }

        // cleanup

        gl.disable(gl.DEPTH_TEST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    renderScenePart: function(part) {
        var objects = part.getObjects();
        var shaderContainer = part.getShaderContainer();

        shaderContainer.init();

        // bind textures
        shaderContainer.updateTextures();

        // bind uniforms
        shaderContainer.updateUniforms(this.scene, this.viewport);

        for (var object of objects) {
            this.renderObject(object, shaderContainer);
        }

        shaderContainer.clean();
    }
};

module.exports = TnGL.Renderer;
