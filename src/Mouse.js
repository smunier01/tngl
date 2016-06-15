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
        // @TODO
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
    ptrLock: function(e) {
        e.requestPointerLock =
            e.requestPointerLock ||
            e.mozRequestPointerLock ||
            e.webkitRequestPointerLock;

        e.requestPointerLock();
    }
};

module.exports = TnGL.Mouse;
