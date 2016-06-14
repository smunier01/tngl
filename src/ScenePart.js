var TnGL = require('./core.js');

/**
 * ScenePart is a list of objects attributed to a specific shaderContainer.
 * @param  {[type]} objects         [description]
 * @param  {[type]} shaderContainer [description]
 * @return {[type]}                 [description]
 */
TnGL.ScenePart = function(objects, shaderContainer) {
    this.objects = objects;
    this.shaderContainer = shaderContainer;
};

TnGL.ScenePart.prototype = {
    setObjects: function(objects) {
        this.objects = objects;
    },
    getObjects: function() {
        return this.objects;
    },
    setShaderContainer: function(shaderContainer) {
        this.shaderContainer = shaderContainer;
    },
    getShaderContainer: function() {
        return this.shaderContainer;
    },
    addObjects: function(objects) {
        return this.objects.concat(objects);
    }
};

module.exports = TnGL.ScenePart;
