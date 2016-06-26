var TnGL = require('./core.js');
TnGL.Object = require('./Object.js');

/**
 * Camera class.
 *
 * extends Object.
 */
TnGL.Camera = function() {
    // properties inheritance.
    TnGL.Object.call(this, null);
    // field of view.
    this.fov = 45.0;
    // near plane.
    this.near = 1.0;
    // far plane.
    this.far = 100.0;
    // perspective matrix.
    this.pMatrix = mat4.create();
    mat4.identity(this.pMatrix);
    // normal matrix (@TODO shouldn't this be in Object? Is it even used right now?).
    this.normalMatrix = mat3.create();
    mat3.identity(this.normalMatrix);
};

TnGL.Camera.prototype = {
    // prototype inheritance.
    __proto__: Object.create(TnGL.Object.prototype),

    /**
     * Use the camera in perspective mode.
     */
    perspective: function(fov, ratio, near, far) {
        mat4.perspective(this.pMatrix, fov * Math.PI / 180.0, ratio, near, far);
        this.fov = fov;
        this.far = far;
        this.near = near;
        return this;
    },

    /**
     * Use the camera in orthogonal.
     */
    orthogonal: function(minx, maxx, miny, maxy, near, far) {
        mat4.ortho(this.pMatrix, minx, maxx, miny, maxy, near, far);
        this.far = far;
        this.near = near;
        return this;
    },

    /**
     * Classic lookAt function.
     */
    lookAt: function(eyes, center, up) {
        mat4.lookAt(this.mvMatrix, eyes, center, up);
        this.properties.position = eyes;
        this.onMvmatrixChange();
        this.hasChanged = false;
        return this;
    }
};

module.exports = TnGL.Camera;
