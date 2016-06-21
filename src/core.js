var TinyGL = function(canvas, options) {

    // reference to the webgl context
    this.gl = canvas.getContext("experimental-webgl");

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // save the size of the canvas in the webgl context for future reference.
    this.gl.viewportWidth = canvas.width;
    this.gl.viewportHeight = canvas.height;

    // tngl user options
    this.options = options;

    // textures
    this.textures = {};

    // framebuffers
    this.fbo = {};

    // shader programs
    this.shaderPrograms = {};

    // extensions
    this.ext = [];

    // webgl buffers
    this.buffers = [];

    // will contain the stats.js stats to be displayed at the bottom.
    this.stats = [];

    // timers
    this.startTime = new Date().getTime();
    this.timeSinceStart = 0;

    // 'framebuffer' placeholder to render to the canvas.
    // @TODO if the canvas size change, the width & height of the screen Object should also change.
    this.screen = {
        framebuffer: null,
        texture: null,
        width: this.gl.viewportWidth,
        height: this.gl.viewportHeight,
        depth: true
    }

    /**
     * default preSetup function.
     *
     * This is executed once directly after the init call.
     */
    this.preSetup = function(callback) { callback(); };

    /**
     * default postSetup function.
     *
     * This is executed once after the setup process and before entering the rendering loop.
     */
    this.postSetup = function() { };

    /**
     * default renderTick function.
     *
     * This function is cap at 60fps and doesn't run when window is not visible.
     */
    this.renderTick = function() { };

    /**
     * default logicTick function.
     */
    this.logicTick = function() { };
};

var optionsDefault = {
    extensions: {
        data: []
    },
    shaders: {
        options: {
            cache: true,
            fragExt: 'frag',
            vertexExt: 'vertex',
            loadPath: 'shaders/'
        },
        data: []
    },
    textures: {
        options: {
            loadPath: 'textures/'
        },
        defaults: {
            filtering: 'nearest',
            internalFormat: 'rgba',
            format: 'rgba',
            mipmap: true
        },
        data: []
    },
    framebuffers: {
        options: {},
        defaults: {
            internalFormat: 'rgba',
            format: 'rgba',
            type: 'unsigned_byte',
            width: function(gl) {
                return gl.viewportWidth;
            },
            height: function(gl) {
                return gl.viewportHeight;
            },
            filtering: 'linear',
            depth: false
        },
        data: []
    }
};

/**
 * setup
 *
 * - initialize the options.
 * - creates basing buffers.
 * - execute preSetup.
 *
 * @return deferred promise.
 */
TinyGL.prototype.setup = function() {
    var d = $.Deferred();

    this.optionsInitialisation(this.options, optionsDefault);

    this.createBuffer('square', this.getModel('square', 1));
    this.createBuffer('square2d', this.getModel('square2d', 1));
    // this.createBuffer('cube', this.getModel('cube', 1));
    this.createBuffer('cube', this.SimpleModels.cube(1));

    this.preSetup(function() {
        d.resolve();
    });

    return d.promise();
};

/**
 * Does, in order:
 *  - setup (this is mostly for initializing the option array).
 *  - preSetup() hook.
 *  - load and activate necessary extensions. References to extensions can then be found in 'ext'.
 *  - load, compile and attach shader programs. Programs can then be found in 'shaderPrograms'.
 *  - load and initialize textures. Textures can then be found in 'textures'.
 *  - creates framebuffers. Framebuffers can then be found in 'fbo'.
 *  - postSetup() hook.
 *  - start main rendering and logic loop.
 */
TinyGL.prototype.init = function() {

    var that = this;

    this.setup()
        .then(function() {
            console.log('[extensions initialisation]');
            return that.initExtensions(that.options.extensions);
        }).then(function() {
            console.log('[shaders initialisation]');
            return that.initShaders(that.options.shaders);
        }).then(function() {
            console.log('[textures initialisation]');
            return that.initTextures(that.options.textures);
        }).then(function() {
            console.log('[framebuffers initialisation]');
            return that.initFramebuffers(that.options.framebuffers);
        }).then(function() {

            // postSetup

            that.postSetup();

	        // setting up main rendering loop

            var frameNumber = 0;

            (function mainRenderLoop() {
                for (var i = 0; i < that.stats.length; i++) {
                    that.stats[i].begin();
                }

                // @TODO handle overflow on frameNumber... restart to 0 ??
                that.renderTick.call(that, that.gl, frameNumber++);

                for (var j = 0; j < that.stats.length; j++) {
                    that.stats[j].end();
                }

                requestAnimFrame(function() {
                    mainRenderLoop();
                });
            }());

	        // setting up main logic loop

            (function mainLogicLoop() {
                that.timeSinceStart = new Date().getTime() - that.startTime;

                // @TODO use a different counter than frameNumber.
                that.logicTick.call(that, that.gl, frameNumber);

                setTimeout(mainLogicLoop, 1 / 60 * 1000);
            }());

            // we're done.
        });
};

/**
 * @TODO move to a util class?
 * @TODO there must be a better way.
 */
TinyGL.compareArray = function(a1, a2) {

    if (!a1 || !a2) {
        return false;
    }

    if (a1[0] !== a2[0] ||
        a1[1] !== a2[1] ||
        a1[2] !== a2[2]) {
        return false;
    }

    return true;
};

/*
 * Get the attributes and uniforms from a given program
 *
 * This is used as a way to easily enable/disable all the attributes
 */
TinyGL.prototype.getPropertiesFromProg = function(prog) {
    var attributes = [];
    var uniforms = [];

    for (var attr in prog) {
        if (typeof prog[attr] === 'number') {
            attributes.push(attr);
        } else if (prog[attr] !== null && prog[attr].constructor.name === 'WebGLUniformLocation') {
            uniforms.push(prog[attr]);
        }
    }

    return {attributes: attributes, uniforms: uniforms};
};

/*
 * Enable and store all the given extensions in options.extensions
 *
 * A reference to each extension is kept in 'ext'
 */
TinyGL.prototype.initExtensions = function(extensions) {

    // I only use a promise to keep this function streamlined with the others init functions.

    var d = $.Deferred();

    var extDesc, i;

    for (i = 0; i < extensions.data.length; i++) {

        extDesc = extensions.data[i];

        if (!('name' in extDesc) || extDesc.name === '') {
            console.warn('initExtensions: extension\'s name cannot be empty.');
            continue;
        }

        if (!('source' in extDesc)) {
            console.warn('initExtensions: extension must have a source (%s).', extDesc.name);
            continue;
        }

        this.ext[extDesc.name] = this.gl.getExtension(extDesc.source);

        if (!this.ext[extDesc.name]) {
            console.warn('initExtensions: couldn\'t load "%s"', extDesc.name);
        } else {
            console.log('initExtensions: [%d/%d] - %s loaded', (i + 1), extensions.data.length, extDesc.name);
        }
    }

    d.resolve();

    return d.promise();
};

/*
 * Creates framebuffers. Framebuffers can then be found in 'fbo'.
 */
TinyGL.prototype.initFramebuffers = function(framebuffers) {

    var d = $.Deferred();
    var fboDesc, i;

    for (i = 0; i < framebuffers.data.length; i++) {

        fboDesc = framebuffers.data[i];

        if (!('name' in fboDesc) || fboDesc.name === '') {
            console.warn('initFramebuffers: framebuffer name cannot be empty.');
            continue;
        }

        this.fbo[fboDesc.name] = this.createFramebuffer(fboDesc);
    }

    d.resolve();

    return d.promise();
};

TinyGL.prototype.addShaderProgram = function(name) {
    // @TODO this function should load, compile and attach a new program.
    // it could then be used to make JsTiny.initShaders(...) cleaner.
}

// @TODO there is probably a better way to do this ~
// @TODO this might be deprecated now that attributes / uniforms are automatically added
TinyGL.prototype.concatArrays = function() {

    var result = [];

    for (var a = 0; a < arguments.length; a++) {
        if (!arguments[a]) {
            continue;
        }

        result = result.concat(arguments[a]);
    }

    for (var i = 0; i < result.length; ++i) {
        for (var j = i + 1; j < result.length; ++j) {
            if (result[i] === result[j]) {
                result.splice(j--, 1);
            }
        }
    }

    return result;
};

/**
 * Merge the defaults options (appOptions) into the user options (userOptions).
 */
TinyGL.prototype.optionsInitialisation = function(userOptions, appOptions) {

    for (var key in appOptions) {
        if (appOptions.hasOwnProperty(key)) {

            // first check if the module name exist in userOptions
            if (key in userOptions) {

                if (!('options' in userOptions[key])) {
                    userOptions[key].options = appOptions[key].options;
                }

                if (!('data' in userOptions[key])) {
                    userOptions[key].data = appOptions[key].data;
                }

                if (!('defaults' in userOptions[key])) {
                    userOptions[key].defaults = appOptions[key].defaults;
                }

                // object to update
                var userDatas = userOptions[key].data;

                var userDefaults = userOptions[key].defaults;

                // default values set by the app
                var appDefaults = appOptions[key].defaults;

                // set each property of options.module.data to the defaults value if empty
                for (var data of userDatas) {

                    // we use appDefaults and not userDefaults because appDefaults contains all properties
                    for (var prop in appDefaults) {

                        // @TODO ugly ..
                        if (data[prop] instanceof Array ||
                            userDefaults[prop] instanceof Array ||
                            appDefaults[prop] instanceof Array) {
                            data[prop] = this.concatArrays(data[prop], userDefaults[prop], appDefaults[prop]);
                        } else {
                            data[prop] = data[prop] || userDefaults[prop] || appDefaults[prop];
                        }
                    }
                }

                // object to update
                var userModuleOptions = userOptions[key].options;

                // default values set by the app
                var appModuleOptions = appOptions[key].options;

                for (var option in appModuleOptions) {
                    userModuleOptions[option] = userModuleOptions[option] || appModuleOptions[option];
                }
            } else {
                userOptions[key] = appOptions[key];
            }
        }
    }
}

/*
 * Change the size of a framebuffer.
 * I didn't find a better way than simply recreating it.
 * @TODO might be a way to destroy it more gracefully ?
 */
TinyGL.prototype.changeFramebufferResolution = function(name, width, height) {
    var fbo = this.fbo[name];
    this.fbo[name] = this.newFramebuffer(fbo.name, height, width, fbo.magFilter, fbo.minFilter, fbo.type, fbo.format, fbo.internalFormat, fbo.depth);
};

TinyGL.prototype.newFramebuffer = function(name, height, width, magFilter, minFilter, type, format, internalFormat, depth) {

    var fbo = {};
    var gl = this.gl;

    // Create framebuffer
    fbo.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);

    // create texture
    fbo.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture);

    // save the properties
    fbo.name = name;
    fbo.height = height;
    fbo.width = width;
    fbo.depth = depth;
    fbo.magFilter = magFilter;
    fbo.minFilter = minFilter;
    fbo.type = type;
    fbo.format = format;
    fbo.internalFormat = internalFormat;

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);

    // @TODO allow to modify this using the options
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fbo.texture, 0);

    if (depth) {
        var renderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
    }

    var FBOstatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

    if (FBOstatus !== gl.FRAMEBUFFER_COMPLETE) {
        console.warn('Framebuffer \'' + name + '\' unrenderable');
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return fbo;
};

TinyGL.prototype.createFramebuffer = function(fboDesc) {

    var gl = this.gl;

    var magFilter = gl[fboDesc.filtering.toUpperCase()];
    var minFilter = gl[fboDesc.filtering.toUpperCase()];
    var w = typeof fboDesc.width === "function" ? fboDesc.width(gl) : fboDesc.width;
    var h = typeof fboDesc.height === "function" ? fboDesc.height(gl) : fboDesc.height;
    var type = gl[fboDesc.type.toUpperCase()];
    var format = gl[fboDesc.format.toUpperCase()];
    var internalFormat = gl[fboDesc.internalFormat.toUpperCase()];

    var fbo = this.newFramebuffer(fboDesc.name, h, w, magFilter, minFilter, type, format, internalFormat, fboDesc.depth);

    return fbo;
};

TinyGL.prototype.initShaders = function(shaders) {

    var that = this;
    var gl = this.gl;

    var d = $.Deferred();
    var nbTask = shaders.data.length;
    var taskLeft = nbTask;

    var pending = [];

    var processShader = function(shaderText, shaderType, i) {

        var shaderInfo = shaders.data[i];

        // we need both vertex & fragment shader
        if (!(shaderInfo.name in pending)) {
            pending[shaderInfo.name] = shaderText;
        } else {

            var container = that.shaderPrograms[shaderInfo.name] = new TinyGL.ShaderContainer(that);

            if (shaderType === gl.VERTEX_SHADER) {
                container.setVertexCode(shaderText);
                container.setFragCode(pending[shaderInfo.name]);
            } else {
                container.setFragCode(shaderText);
                container.setVertexCode(pending[shaderInfo.name]);
            }

            container.compile();

            console.log('[' + (i + 1) + '/' + nbTask + '] - \'' + shaderInfo.name + '\' linked');

            taskLeft -= 1;

            if (!taskLeft) {
                d.resolve();
            }
        }
    };

    // @TODO, if the ajax call fail, it stops the program
    var getShader = function(shaderUrl, callback) {

        // @TODO only append timestamp if cache enabled
        var data = {timestamp: new Date().getTime()};

        $.ajax({
            url: shaderUrl,
            data: data,
            type: 'GET',
            success: callback
        });
    };

    $.each(shaders.data, function(i, shader) {

        var urlFrag = shaders.options.loadPath + shader.name + '.' + shaders.options.fragExt;
        var urlVertex = shaders.options.loadPath + shader.name + '.' + shaders.options.vertexExt;

        getShader(urlFrag, function(result) {
            processShader(result, gl.FRAGMENT_SHADER, i);
        });

        getShader(urlVertex, function(result) {
            processShader(result, gl.VERTEX_SHADER, i);
        });

    });

    return d.promise();
};

// @TODO, more model, 2D / 3D distinction ?, streamline the process
TinyGL.prototype.getModel = function(name, size) {

    var vertices;

    if (name === 'square2d') {
        vertices =
            [-size, -size, 0.0,
             -size, size, 0.0,
             size, -size, 0.0,
             size, size, 0.0];
    } else if (name === 'square') {
        vertices =
            [-size, 0.0, -size,
             -size, 0.0, size,
             size, 0.0, -size,
             size, 0.0, size];
    }

    vertices.itemSize = 3;
    vertices.numItems = 4;

    var indices = [
        0, 1, 2,
        1, 2, 3
    ];

    indices.itemSize = 1;
    indices.numItems = 6;

    var uv = [
        0.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
    ];

    uv.itemSize = 2;
    uv.numItems = 4;

    var model = {
    	vertices: vertices,
    	indices: indices,
        uv: uv
    }

    return model;
};

TinyGL.prototype.SimpleModels = {
    cube: function(size) {
        var vertices =
            [-size, -size, size,
             size, -size, size,
             size, size, size,
             -size, size, size,

             -size, -size, -size,
             -size, size, -size,
             size, size, -size,
             size, -size, -size,

             -size, size, -size,
             -size, size, size,
             size, size, size,
             size, size, -size,

             -size, -size, -size,
             size, -size, -size,
             size, -size, size,
             -size, -size, size,

             size, -size, -size,
             size, size, -size,
             size, size, size,
             size, -size, size,

             -size, -size, -size,
             -size, -size, size,
             -size, size, size,
             -size, size, -size];

        vertices.itemSize = 3;
        vertices.numItems = 24;

        var indices = [
            0, 1, 2, 0, 2, 3,
            4, 5, 6, 4, 6, 7,
            8, 9, 10, 8, 10, 11,
            12, 13, 14, 12, 14, 15,
            16, 17, 18, 16, 18, 19,
            20, 21, 22, 20, 22, 23
	];

        indices.itemSize = 1;
        indices.numItems = 36;

        var normals =
            [0.0, 0.0, 1.0,
             0.0, 0.0, 1.0,
             0.0, 0.0, 1.0,
             0.0, 0.0, 1.0,

             // Back face
             0.0, 0.0, -1.0,
             0.0, 0.0, -1.0,
             0.0, 0.0, -1.0,
             0.0, 0.0, -1.0,

             // Top face
             0.0, 1.0, 0.0,
             0.0, 1.0, 0.0,
             0.0, 1.0, 0.0,
             0.0, 1.0, 0.0,

             // Bottom face
             0.0, -1.0, 0.0,
             0.0, -1.0, 0.0,
             0.0, -1.0, 0.0,
             0.0, -1.0, 0.0,

             // Right face
             1.0, 0.0, 0.0,
             1.0, 0.0, 0.0,
             1.0, 0.0, 0.0,
             1.0, 0.0, 0.0,

             // Left face
             -1.0, 0.0, 0.0,
             -1.0, 0.0, 0.0,
             -1.0, 0.0, 0.0,
             -1.0, 0.0, 0.0];

        normals.itemSize = 3;
        normals.numItems = 24;

        var uv = [
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0
        ];

        uv.itemSize = 2;
        uv.numItems = 24;

        var model = {
            vertices: vertices,
            indices: indices,
            uv: uv,
            normals: normals
        }

        return model;
    }
};

TinyGL.prototype.createBuffer = function(name, source) {

    var gl = this.gl;
    var tmpTexturePositionBuffer;
    var tmpVertexNormalBuffer;

    var tmpVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tmpVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(source.vertices), gl.STATIC_DRAW);
    tmpVertexPositionBuffer.itemSize = source.vertices.itemSize;
    tmpVertexPositionBuffer.numItems = source.vertices.numItems;

    var tmpVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tmpVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(source.indices), gl.STATIC_DRAW);
    tmpVertexIndexBuffer.itemSize = source.indices.itemSize;
    tmpVertexIndexBuffer.numItems = source.indices.numItems;

    if ('normals' in source) {
        tmpVertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tmpVertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(source.normals), gl.STATIC_DRAW);
        tmpVertexNormalBuffer.itemSize = source.normals.itemSize;
        tmpVertexNormalBuffer.numItems = source.normals.numItems;
    }

    if ('uv' in source) {
        tmpTexturePositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tmpTexturePositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(source.uv), gl.STATIC_DRAW);
        tmpTexturePositionBuffer.itemSize = source.uv.itemSize;
        tmpTexturePositionBuffer.numItems = source.uv.numItems;
    }

    this.buffers[name] = {
        id: TinyGL.lastBufferId++,
        vertexPosition: tmpVertexPositionBuffer,
        vertexIndex: tmpVertexIndexBuffer,
        uv: tmpTexturePositionBuffer,
        normals: tmpVertexNormalBuffer
    };
};

TinyGL.lastBufferId = 0;

TinyGL.prototype.addStats = function(n) {
    var stat = new Stats();
    stat.setMode(n);

    stat.dom.style.position = 'absolute';
    stat.dom.style.left = this.stats.length * 100 + 'px';
    stat.dom.style.bottom = '10px';
    stat.dom.style.top = "";

    document.body.appendChild(stat.domElement);

    this.stats.push(stat);
};

TinyGL.prototype.createTextureFromArray = function(name, array) {
    // @TODO check if power of two

    var gl = this.gl;

    // this.textures[name]  Convert to WebGL texture
    this.textures[name] = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.textures[name]);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    // @TODO 5 ?
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 5, 5, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array(array));

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, null);

};

TinyGL.prototype.initTextures = function(textures) {

    var gl = this.gl;
    var that = this;

    var d = $.Deferred();

    var nbTask = textures.data.length;
    var taskLeft = nbTask;

    // @TODO move that to optionDefault
    var formatAllowed = ['jpg', 'jpeg', 'png'];

    // @TODO I completely forgot about that, maybe it should also be moved to optionDefault
    var requiredProperties = ['name', 'source'];

    var resolveTask = function() {
        taskLeft -= 1;

        if (!taskLeft) {
            d.resolve();
        }
    };

    var handleLoadedTexture = function(texture, i) {

        var textInfo = textures.data[i];

        var filtering = textInfo.filtering.toUpperCase();

        var magFilter = gl[filtering];
        // @TODO ugly code
        var minFilter = textInfo.mipmap && magFilter === 'LINEAR' ? gl.LINEAR_MIPMAP_LINEAR : gl[filtering];

        var internalFormat = gl[textInfo.internalFormat.toUpperCase()];
        var format = gl[textInfo.format.toUpperCase()];

        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        gl.texImage2D(gl.TEXTURE_2D,
                      0,
                      internalFormat,
                      format,
                      gl.UNSIGNED_BYTE,
                      texture.image
                     );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);

        if (textInfo.mipmap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }

        gl.bindTexture(gl.TEXTURE_2D, null);

        console.log('[' + (i + 1) + '/' + textures.data.length + '] - \'' + textInfo.name + '\' binded');

        resolveTask();
    };

    var loadTexture = function(i) {

        if (i < textures.data.length - 1) {
            setTimeout(function() {
                loadTexture(i + 1);
            }, 0);
        }

        var textInfo = textures.data[i];
        var ext = textInfo.source.split('.')[1];

        for (var p of requiredProperties) {

            if (!(p in textInfo) || textInfo[p] === '') {
                console.warn('initTextures: property ' + p + ' is required.');
                resolveTask();
                return;
            }
        }

        if (formatAllowed.indexOf(ext) === -1) {

            console.warn('image extension ' + ext + ' is not supported');
            resolveTask();
            return;

        }

        var texture = gl.createTexture();
        that.textures[textInfo.name] = texture;
        that.textures[textInfo.name].image = new Image();

        that.textures[textInfo.name].image.onload = function() {
            handleLoadedTexture(texture, i);
        };

        that.textures[textInfo.name].image.onerror = function () {
            console.warn('image ' + this.src + " can't be loaded.");
            resolveTask();
        }

        that.textures[textInfo.name].image.src = textures.options.loadPath + textInfo.source;

    }

    if (textures.data.length > 0) {
        loadTexture(0);
    } else {
        d.resolve();
    }

    return d.promise();
};

TinyGL.prototype.getShaderContainer = function(name) {
    return this.shaderPrograms[name];
};


/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

module.exports = TinyGL;
