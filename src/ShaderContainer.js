var TnGL = require("./core.js");

TnGL.ShaderContainer = function(engine) {
    this.engine = engine;

    this.currentBufferId = -1;

    // shader program
    this.program = null;

    this.vertexCode = null;

    this.fragCode = null;

    this.fragCompiled = null;

    this.vertexCompiled = null;

    this.vertexCodeHasChanged = false;

    this.fragCodeHasChanged = false;

    this.logs = {frag: [], vert: []};

    // structure telling which texture should be bound to which uniform
    this.textureBinding = {};

    // structure telling which value should be bound to which uniform
    this.uniformBinding = {};

    this.currentColor = null;

    /*
     * Bind texture based on the textureBinding structure description.
     *
     * This function has not been declared as a prototype so that it can be overide, in case the user
     * wants to manually bind his textures.
     */
    this.updateTextures = function() {

        var gl = this.engine.gl;

        // @TODO check that the number of texture binding is above the max (8?). I think there is a way
        // to check the max.
        for (var i = 0; i < Object.keys(this.textureBinding).length; i++) {

            var uniform = Object.keys(this.textureBinding)[i];
            let texture;

            if (this.textureBinding.hasOwnProperty(uniform)) {

                // check that the uniform actually exist in the given program
                if (!(uniform in this.program)) {
                    console.warn('unknown uniform \'' + uniform + '\'. Can\'t bind texture to it.');
                    continue;
                }

                // object that should be bound to the uniform
                var object = this.textureBinding[uniform];

                // object should be a framebuffer or a string

                // if it's a framebuffer, the texture is object.texture
                if (object instanceof Object && 'framebuffer' in object) {
                    texture = object.texture;
                } else {
                    // if it's a string
                    // we check that the texture has been initialized at the start of the app
                    if (!(object in this.engine.textures)) {
                        console.warn(object + ' is not a texture and cant be binded');
                        continue;
                    }

                    texture = this.engine.textures[object];
                }

                // binding time !
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.uniform1i(this.program[uniform], i);
            }
        }
    };

    /*
     * Same as above, but for normal uniforms
     */
    this.updateUniforms = function(scene, viewport) {

        var gl = this.engine.gl;

        if ('targetResolution' in this.program) {
            gl.uniform2fv(this.program.targetResolution, [viewport.width, viewport.height]);
        }

        if ('canvasResolution' in this.program) {
            gl.uniform2fv(this.program.canvasResolution, [gl.viewportWidth, gl.viewportHeight]);
        }

        if ('uTime' in this.program) {
            gl.uniform1f(this.program.uTime, (Date.now() - this.engine.startTime) / 1000.0);
        }

        if ('uMouse' in this.program) {
            gl.uniform2fv(this.program.uMouse, [scene.mouse.currentX, gl.viewportHeight - scene.mouse.currentY]);
        }

        if ('uPMatrix' in this.program) {
            gl.uniformMatrix4fv(this.program.uPMatrix, false, scene.camera.pMatrix);
        }

        if ('uMVMatrix' in this.program) {
            gl.uniformMatrix4fv(this.program.uMVMatrix, false, scene.camera.mvMatrix);
        }

        if ('uNormalMatrix' in this.program) {
            gl.uniformMatrix3fv(this.program.uNormalMatrix, false, scene.camera.normalMatrix);
        }


        for (var i = 0; i < Object.keys(this.uniformBinding).length; i++) {

            var uniform = Object.keys(this.uniformBinding)[i];

            if (this.uniformBinding.hasOwnProperty(uniform)) {

                // check that the uniform actually exist in the given program
                if (!(uniform in this.program)) {
                    console.warn('unknown uniform \'' + uniform + '\'. Can\'t bind value to it.');
                    continue;
                }

                // object that should be bound to the uniform
                var object = this.uniformBinding[uniform];

                if (typeof object === 'number') {
                    gl.uniform1f(this.program[uniform], object);
                }

                if (typeof object === 'boolean') {
                    gl.uniform1f(this.program[uniform], object);
                }

                if (object.length === 3) {
                    gl.uniform3fv(this.program[uniform], object);
                } else if (object.length === 4) {
                    gl.uniform4fv(this.program[uniform], object);
                } else if (object.length === 16) {
                    gl.uniformMatrix4fv(this.program[uniform], false, object);
                } else if (object.length === 25) {
                    gl.uniform1fv(this.program[uniform], false, object);
                }

            }
        }
    };
};

TnGL.ShaderContainer.prototype = {

    /*
     * bind uColor, uTranslation, uOrientation and uScale based on the given object
     *
     * I'm using the unsafe check 'this.program.property' because a 'property in this.program' or a
     * hasOwnProperty() check can be a lot slower, with many object, this method can be called thousand
     * of times each frame.
     */
    updatePositionUniforms: function(object) {
        var gl = this.engine.gl;

        if (this.program.uColor) {
            if (!TnGL.compareArray(this.currentColor, object.color)) {
                gl.uniform4fv(this.program.uColor, object.color);
                this.currentColor = object.color;
            }
        }

        if (this.program.uTranslation) {
            if (!TnGL.compareArray(this.currentPosition, object.position)) {
                // @TODO use an arrayCopy or something
                gl.uniform3fv(this.program.uTranslation, object.position);
                // console.log(this.currentPosition);
                this.currentPosition = [];
                this.currentPosition[0] = object.position[0];
                this.currentPosition[1] = object.position[1];
                this.currentPosition[2] = object.position[2];
            }
        }

        if (this.program.uOrientation) {
            if (!TnGL.compareArray(this.currentOrientation, object.orientation)) {
                gl.uniform3fv(this.program.uOrientation, object.orientation);
                this.currentOrientation = object.orientation;
            }
        }

        if (this.program.uScale) {
            if (!TnGL.compareArray(this.currentScale, object.scale)) {
                gl.uniform3fv(this.program.uScale, object.scale);
                this.currentScale = object.scale;
            }
        }
    },

    /*
     *
     */
    bindTexture: function(uniform, texture) {
        this.textureBinding[uniform] = texture;
        return this;
    },
    bindUniform: function(uniform, value) {
        this.uniformBinding[uniform] = value;
        return this;
    },
    getVertexCode: function() {
        return this.vertexCode;
    },
    getFragCode: function() {
        return this.fragCode;
    },
    setVertexCode: function(code) {
        this.vertexCode = code;
    },
    setFragCode: function(code) {
        this.fragCode = code;
    },
    compileShader: function(shaderType) {

        var parseErrors = function(log) {
            log = String(log)

            var logs = []
            var result

            while (result = log.match(/ERROR\:([^\n]+)/)) {
                log = log.slice(result.index + 1);

                var line = result[1].trim();
                var seps = line.split(':');
                var emsg = seps.slice(2).join(':').trim();
                var file = parseInt(seps[0], 10);
                var line = parseInt(seps[1], 10);

                logs.push({
                    message: emsg, file: file, line: line
                });
            }

            return logs;
        };

        var gl = this.engine.gl;

        var shaderText, errLog;

        if (shaderType === gl.FRAGMENT_SHADER) {
            shaderText = this.fragCode;
            errLog = 'frag';
        } else {
            shaderText = this.vertexCode;
            errLog = 'vert';
        }

        var tmpShader = gl.createShader(shaderType);

        gl.shaderSource(tmpShader, shaderText);
        gl.compileShader(tmpShader);

        if (!gl.getShaderParameter(tmpShader, gl.COMPILE_STATUS)) {
            console.error('shader compilation error : ' + gl.getShaderInfoLog(tmpShader));
            this.logs[errLog] = parseErrors(gl.getShaderInfoLog(tmpShader));
            return null;

        } else {
            this.logs[errLog] = [];
            return tmpShader;
        }
    },
    attachShader: function() {
        var gl = this.engine.gl;

        var program = gl.createProgram();

        gl.attachShader(program, this.fragCompiled);
        gl.attachShader(program, this.vertexCompiled);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('couldn\'t link program ' + name + ' ' + gl.getProgramInfoLog(program));
        } else {
            var nbUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

            for (var u = 0; u < nbUniforms; ++u) {
                var uniform = gl.getActiveUniform(program, u);
                program[uniform.name] = gl.getUniformLocation(program, uniform.name);
            }

            var nbAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

            for (var a = 0; a < nbAttributes; ++a) {
                var attr = gl.getActiveAttrib(program, a);
                program[attr.name] = gl.getAttribLocation(program, attr.name);
            }

            this.program = program;
        }
    },
    compile: function() {
        var gl = this.engine.gl;

        this.fragCompiled = this.compileShader(gl.FRAGMENT_SHADER);
        this.vertexCompiled = this.compileShader(gl.VERTEX_SHADER);

        return this.attachShader();
    },
    /*
     * Return an object containing the list of attributes & uniforms contained in the shaders
     */
    findShaderProperties: function() {
        var attributes = [];
        var uniforms = [];

        for (var attr in this.program) {
            if (typeof this.program[attr] === 'number') {
                attributes.push(attr);
            } else if (this.program[attr] !== null &&
                       this.program[attr].constructor.name === 'WebGLUniformLocation') {
                uniforms.push(this.program[attr]);
            }
        }

        return {attributes: attributes, uniforms: uniforms};
    }

};

module.exports = TnGL.ShaderContainer;
