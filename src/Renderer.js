var TnGL = require('./core.js');

/**
 * Utility class to group related rendering functions
 */
TnGL.Renderer = function(gl) {
    this.gl = gl;
    this.target = null;
    this.viewport = null;
    this.scene = null;
    this.indexType = gl.UNSIGNED_SHORT;
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
    bindVertexAttribPointer: function(attrLoc, buffer) {
        if (attrLoc >= 0) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(attrLoc, buffer.itemSize, this.gl.FLOAT, false, 0, 0);
        }
    },
    renderObject: function(object, shaderContainer) {
        var prog = shaderContainer.program;

        // no point re-binding all attributes when the previous object had the same buffer model.
        if (object.buffer.id !== shaderContainer.currentBufferId) {
            this.bindVertexAttribPointer(prog.aVertexPosition, object.buffer.vertexPosition);
            this.bindVertexAttribPointer(prog.aTexturePosition, object.buffer.uv);
            this.bindVertexAttribPointer(prog.aVertexNormal, object.buffer.normals);
        }

        this.draw(object.buffer.vertexIndex);

        shaderContainer.currentBufferId = object.buffer.id;
    },
    draw: function(vertexIndex) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vertexIndex);
        this.gl.drawElements(this.gl.TRIANGLES, vertexIndex.numItems, this.indexType, 0);
    },
    render: function() {
        var gl = this.gl;
        var viewport = this.viewport;
        var to = this.target;

        gl.bindFramebuffer(gl.FRAMEBUFFER, to.framebuffer);

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

        if (to.framebuffer) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
        }

        to.depth ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST);

        // render each part of the scene.
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
