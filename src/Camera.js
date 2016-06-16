var TnGL = require('./core.js');
TnGL.Object = require('./Object.js');

TnGL.Camera = function() {
    TnGL.Object.call(this, null);
    this.fov = 45.0;
    this.near = 1.0;
    this.far = 100.0;
    this.pMatrix = mat4.create();
    this.normalMatrix = mat3.create();
    mat4.identity(this.pMatrix);
    mat3.identity(this.normalMatrix);
};

TnGL.Camera.prototype = {
    __proto__: Object.create(TnGL.Object.prototype),
    perspective: function(fov, ratio, near, far) {
        mat4.perspective(this.pMatrix, fov * Math.PI / 180.0, ratio, near, far);
        this.fov = fov;
        this.far = far;
        this.near = near;
        return this;
    },
    orthogonal: function(minx, maxx, miny, maxy, near, far) {
        mat4.ortho(this.pMatrix, minx, maxx, miny, maxy, near, far);
        this.far = far;
        this.near = near;
        return this;
    },
    lookAt: function(eyes, center, up) {
        mat4.lookAt(this.mvMatrix, eyes, center, up);
        this.position = eyes;
        this.onMvmatrixChange();
        this.hasChanged = false;
        return this;
    }
};

module.exports = TnGL.Camera;
