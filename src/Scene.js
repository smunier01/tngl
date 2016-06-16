var TnGL = require('./core.js');
TnGL.Camera = require('./Camera.js');
TnGL.Mouse = require('./Mouse.js');
TnGL.Renderer = require('./Renderer.js');

TnGL.Scene = function(engine) {
    this.engine = engine;
    this.camera = new TnGL.Camera();
    this.mouse = new TnGL.Mouse(this);
    this.renderer = new TnGL.Renderer(this.engine.gl);
    this.parts = [];
    this.fov = 45.0;
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
        this.renderer.setViewport(viewport);
        this.renderer.setTarget(to);
        this.renderer.setScene(this);
        this.renderer.render();
    },
    getPart: function(name) {
        return this.parts[name];
    }
};

module.exports = TnGL.Scene;
