var TnGL = require('./core.js');

TnGL.Mouse = function(scene) {
    this.scene = scene;
    this.currentX = 0;
    this.currentY = 0;
    this.rightClickDown = false;
};

TnGL.Mouse.prototype = {
    enable: function(type) {
        document.addEventListener("mousemove", this.move.bind(this), false);
        if (type) {
            document.addEventListener("mouseup", this.clickUp.bind(this), false);
            document.addEventListener("mousedown", this.clickDown.bind(this), false);

            document.addEventListener("contextmenu", function(e) {
                e.preventDefault();
                return -1;
            }, false);
        }
    },
    disable: function() {

    },
    move: function(e) {
        this.currentX = e.clientX;
        this.currentY = e.clientY;

        if (this.rightClickDown) {
            var movementX =
                e.movementX ||
                e.mozMovementX ||
                0;

            var movementY =
                e.movementY ||
                e.mozMovementY ||
                0;

            this.scene.camera.pitch += movementY * 0.001;
            this.scene.camera.yaw += movementX * 0.001;
            /*
            var direction = vec3.create();

            direction[0] = Math.cos(this.scene.camera.euler[0]) * Math.cos(this.scene.camera.euler[1]);
            direction[1] = Math.sin(this.scene.camera.euler[1]);
            direction[2] = Math.sin(this.scene.camera.euler[0]) * Math.cos(this.scene.camera.euler[1]);

            var dest = vec3.create();

            vec3.add(dest, this.scene.camera.position, direction);
            console.log(this.scene.camera.position);
            console.log(direction);
            mat4.lookAt(this.scene.camera.mvMatrix, this.scene.camera.position, dest, [0.0, 1.0, 0.0]);
            */
            /*
            var q = this.scene.camera.quat;

            var q1 = this.scene.camera.q1;
            var q2 = this.scene.camera.q2;

            quat.rotateY(q1, q1, movementX * 0.001);
            quat.rotateX(q2, q2, movementY * 0.001);

            quat.multiply(q, q2, q1);

            mat4.fromQuat(this.scene.camera.mvMatrix, q);
            mat4.translate(this.scene.camera.mvMatrix, this.scene.camera.mvMatrix, [0.0, -10.0, 0.0]);

            console.log(this.scene.camera.euler);
            this.scene.camera.setEulerFromMatrix();
            console.log(this.scene.camera.euler);
            */
        }
    },
    clickUp: function(e) {
        if (e.button === 2) {

            this.rightClickDown = false;

            document.exitPointerLock =
                document.exitPointerLock ||
                document.mozExitPointerLock ||
                document.webkitExitPointerLock;

            document.exitPointerLock();
        }
    },
    clickDown: function(e) {
        e.preventDefault();

        if (e.button === 2) {
            this.rightClickDown = true;
            this.ptrLock($('#webgl-canvas')[0]);
        }
    },
    ptrLock: function(elem) {
        elem.requestPointerLock =
            elem.requestPointerLock ||
            elem.mozRequestPointerLock ||
            elem.webkitRequestPointerLock;

        elem.requestPointerLock();
    }
};

module.exports = TnGL.Mouse;
