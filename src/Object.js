var TnGL = require('./core.js');

TnGL.Object = function(buffer) {
    this.buffer = buffer;

    // private. Only the setters/getters should be used.
    this.properties = {
        position: [0.0, 0.0, 0.0],
        orientation: [1.0, 0.0, 0.0], // @TODO should be deprecated
        scale: [1.0, 1.0, 1.0],
        color: [0.0, 0.0, 0.0, 1.0],
        euler: vec3.create(),
        quat: quat.create()
    };

    // object model view matrix
    // @TODO should be in the this.properties ?
    this.mvMatrix = mat4.create();
    mat4.identity(this.mvMatrix);
};

TnGL.Object.prototype = {
    updateQuaternionFromEulers: function() {
        var c1 = Math.cos(this.properties.euler[0] / 2);
    	var c2 = Math.cos(this.properties.euler[1] / 2);
    	var c3 = Math.cos(this.properties.euler[2] / 2);
    	var s1 = Math.sin(this.properties.euler[0] / 2);
    	var s2 = Math.sin(this.properties.euler[1] / 2);
    	var s3 = Math.sin(this.properties.euler[2] / 2);

        this.properties.quat[0] = s1 * c2 * c3 + c1 * s2 * s3;
    	this.properties.quat[1] = c1 * s2 * c3 - s1 * c2 * s3;
    	this.properties.quat[2] = c1 * c2 * s3 + s1 * s2 * c3;
    	this.properties.quat[3] = c1 * c2 * c3 - s1 * s2 * s3;
    },
    // update quaternion & mvmatrix after eulers have been changed
    onEulerChange: function() {

        // update quaternion

        this.updateQuaternionFromEulers();

        // update mvmatrix

        mat4.fromQuat(this.mvMatrix, this.properties.quat);
        mat4.translate(this.mvMatrix, this.mvMatrix, [-this.position[0], -this.position[1], -this.position[2]]);

    },
    onMvmatrixChange: function() {

        // update eulers

        this.updateEulersFromMatrix();

        // update quaternion

        this.updateQuaternionFromEulers();

        // update position

        // @TODO
    },
    onQuaternionChange: function() {

        // update mvmatrix

        mat4.fromQuat(this.mvMatrix, this.properties.quat);
        mat4.translate(this.mvMatrix, this.mvMatrix, this.position);

        // update eulers

        this.updateEulersFromMatrix();
    },
    updateEulersFromMatrix: function() {
    	var te = this.mvMatrix;
    	var m11 = te[0], m12 = te[4], m13 = te[8];
    	var m21 = te[1], m22 = te[5], m23 = te[9];
    	var m31 = te[2], m32 = te[6], m33 = te[10];

    	this.properties.euler[1] = Math.asin(Math.min(Math.max(m13, -1), 1));
        if (Math.abs(m13) < 0.99999) {
            this.properties.euler[0] = Math.atan2(-m23, m33);
            this.properties.euler[2] = Math.atan2(-m12, m11);
       } else {
            this.properties.euler[0] = Math.atan2(m32, m22);
            this.properties.euler[2] = 0;
       }
    },
    eulerToVector: function() {
        this.direction[0] = Math.cos(this.euler[0]) * Math.cos(this.euler[1]);
        this.direction[1] = Math.sin(this.euler[1]);
        this.direction[2] = Math.sin(this.euler[0]) * Math.cos(this.euler[1]);
    },
    quatRotateY: function(value) {
	    var halfAngle = value / 2;
        var s = Math.sin(halfAngle);

        var axis = [0.0, 1.0, 0.0];
        var q = quat4.create();

    	q[0] = axis[0] * s;
    	q[1] = axis[1] * s;
    	q[2] = axis[2] * s;
    	q[3] = Math.cos(halfAngle);

        quat4.multiplyVec3(q, this.direction, this.direction);

        return this;
    },
    quatRotateX: function(value) {
	    var halfAngle = value / 2;
        var s = Math.sin(halfAngle);

        var axis = [1.0, 0.0, 0.0];
        var q = quat4.create();

    	q[0] = axis[0] * s;
    	q[1] = axis[1] * s;
    	q[2] = axis[2] * s;
    	q[3] = Math.cos(halfAngle);

        quat4.multiplyVec3(q, this.direction, this.direction);

        return this;
    },
    rotateX: function(value) {
        this.rotate([1.0, 0.0, 0.0], value);
        return this;
    },
    rotateY: function(value) {
        this.rotate([0.0, 1.0, 0.0], value);
        return this;
    },
    rotateZ: function(value) {
        this.rotate([0.0, 0.0, 1.0], value);
        return this;
    },
    rotate: function(axis, value) {
        var h = value / 2;
        var sin = Math.sin(h);

        var x = this.position[0],
            y = this.position[1],
            z = this.position[2];

        var qx = axis[0] * sin,
            qy = axis[1] * sin,
            qz = axis[2] * sin,
            qw = Math.cos(h);

        var ix = qw * x + qy * z - qz * y;
        var iy = qw * y + qz * x - qx * z;
        var iz = qw * z + qx * y - qy * x;
        var iw = -qx * x - qy * y - qz * z;

        this.position[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        this.position[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        this.position[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

        return this;
    },
    update: function() {
        mat4.identity(this.mvMatrix);
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.properties.euler[0], [1, 0, 0]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.properties.euler[1], [0, 1, 0]);
        mat4.rotate(this.mvMatrix, this.mvMatrix, this.properties.euler[2], [0, 0, 1]);
        mat4.translate(this.mvMatrix, this.mvMatrix, [-this.position[0], -this.position[1], -this.position[2]]);
        mat3.normalFromMat4(this.normalMatrix, this.mvMatrix);

        this.hasChanged = false;

        return this;
    },
    translateX: function(value) {
        this.translate([1.0, 0.0, 0.0], value);
        return this;
    },
    translateY: function(value) {
        this.translate([0.0, 1.0, 0.0], value);
        return this;
    },
    translateZ: function(value) {
        this.translate([0.0, 0.0, 1.0], value);
        return this;
    },
    translate: function(direction, value) {
        this.position[0] += direction[0] * value;
        this.position[1] += direction[1] * value;
        this.position[2] += direction[2] * value;
        return this;
    },
    rotateFromCenter: function(center, axis, value) {
        this.translate(center, -1);
        this.rotate(axis, value);
        this.translate(center, 1);
        return this;
    },
    rotateXFromCenter: function(center, value) {
        this.translate(center, -1);
        this.rotateX(value);
        this.translate(center, 1);
        return this;
    },
    rotateYFromCenter: function(center, value) {
        this.translate(center, -1);
        this.rotateY(value);
        this.translate(center, 1);
        return this;
    },
    rotateZFromCenter: function(center, value) {
        this.translate(center, -1);
        this.rotateZ(value);
        this.translate(center, 1);
        return this;
    },
    copy: function() {
        var newObject = new TnGL.Object(this.buffer);

        newObject.position = this.position;
        newObject.orientation = this.orientation;
        newObject.scale = this.scale;
        newObject.color = this.color;

        return newObject;
    },
    set euler(value) {
        this.properties.euler[0] = value[0];
        this.properties.euler[1] = value[1];
        this.properties.euler[2] = value[2];
        this.onEulerChange();
    },
    get euler() {
        return this.properties.euler;
    },
    set pitch(value) {
        this.properties.euler[0] = value;
        this.onEulerChange();
    },
    get pitch() {
        return this.properties.euler[0];
    },
    set yaw(value) {
        this.properties.euler[1] = value;
        this.onEulerChange();
    },
    get yaw() {
        return this.properties.euler[1];
    },
    set roll(value) {
        this.properties.euler[2] = value;
        this.onEulerChange();
    },
    get roll() {
        return this.properties.euler[2];
    },
    set color(value) {
        if (value.length === 4) {
            this.properties.color = value;
        } else {
            value.push(1.0)
            this.properties.color = value;
        }
    },
    get color() {
        return this.properties.color;
    },
    set position(value) {
        this.properties.position[0] = value[0];
        this.properties.position[1] = value[1];
        this.properties.position[2] = value[2];
    },
    get position() {
        return this.properties.position;
    },
    set scale(value) {
        this.properties.scale = value;
    },
    get scale() {
        return this.properties.scale;
    }
};

module.exports = TnGL.Object;
