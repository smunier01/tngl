# tngl

tngj is a small framework for webgl development.

The goal here is not to do a full abstraction of webgl, I do not want to hide how webgl is working and you still have to write every shaders yourself. I simply want to make it possible to quickly setup a webgl project (let's admit it, it's the annoying part).

As an experiment, I chose to do the initial setup by letting you declare what textures, shaders, framebuffers and extensions you are going to be using. After the setup, all those resources will be available for use.

## config example

A minimal config would look something like this:

```javascript
var options = {
	extensions: {},
	shaders: {
		options: {
			fragExt: 'frag',
			vertexExt: 'vertex',
			loadPath: '/shaders/'
		},
		data: [
			{name: 'shader1'},
			{name: 'shader2'}
		]
	},
	textures: {},
	framebuffers: {
		data: [
			{name: 'fbo1'}
		]
	}
}
```

 - no webgl extensions and no textures are used.
 - 2 shader programs are going to be created. `shader1` will be composed of `shader1.frag` and `shader1.vertex`. Both files should be in /shaders/.
 - A framebuffer named `fbo1` is instanciated. We didn't specify any options, the defaults are used.

Here is a slightly more complex config:

```javascript
var options = {
	extensions: {
		{
			name: 'textureFloat',
			source: 'OES_texture_float',
		},
		{
			name: 'textureFloatLinear',
			source: 'OES_texture_float_linear'
		},
	},
	shaders: {
		options: {
			fragExt: 'frag',
			vertexExt: 'vertex',
			loadPath: '/shaders/'
		},
		data: [
			{name: 'shader1'},
			{name: 'shader2'}
		]
	},
	textures: {
		options: {
			loadPath: '/textures/'
		},
		data: [
			{name: 'texture1', source: 'texture1.png'}
		]
	},
	framebuffers: {
		defaults: {
			internalFormat: 'rgba',
			format: 'rgba',
			type: 'byte',
			filtering: 'nearest',
			depth: false
		},
		data: [
			{
				name: 'fbo1'
				width: 500,
				height: 500,
				internalFormat: 'rgb',
				format: 'rgb'
			},
			{
				name: 'fbo2'
				depth: true,
				type: 'float',
				filtering: 'linear',
			}
		]
	}
}
```

 - this time we declare the use of `OES_texture_float` and `OES_texture_float_linear`. The source must be correct, the name is simply in case you want to access it back later on.
 - We load one texture `/textures/texture1.png` that we call texture1.
 - We now have two framebuffers. Everything inside "defaults" will be used as default for the other framebuffers (overiding the actual default values). In addition of the name, we can also specify options if we don't want the default values.

 ## init

 ```javascript
 var tngl = new TnGL($('#webgl-canvas')[0], options);

 // this is called once after the initialization.
 // this is where you do everything you only need to do once.
 tngl.postSetup = function() {

	 //
	 // objects
	 //

	 // creates a 1 by 1 square
	 this.createBuffer('mySquare', this.getModel('square', 1));
	 // creates an object from this buffer.
	 var square = new TnGL.Object(this.buffers.mySquare);
	 // good old hello world red square
	 square.color = [1.0, 0.0, 0.0];
	 square.translate([0.0, 1.0, -10.0], 1);


	 //
	 // shader containers
	 //

	 // shader1 is the name specified in the options object.
	 var sc = this.getShaderContainer('shader1');

	 //
	 // Scenes setup
	 //

	 this.mainScene = new TnGL.Scene(this);

	 // the scene is composed of only one part. The part is composed of 1 square that will be rendered using your 'shader1' shader program.
	 this.mainScene.addPart('main', [square], sc);

	 //
	 // Camera setup
	 //

	 this.mainScene.camera
		 .perspective(45.0, this.gl.viewportWidth / this.gl.viewportHeight, 1.0, 1000.0)
		 // let's look at our square
		 .lookAt([0.0, 0.0, 0.0], square.position, [0.0, 1.0, 0.0])
	;

 };

 // the actual rendering loop
 tngl.renderTick = function(gl, frame) {

	// we can render the scene to the canvas.
	this.mainScene.render(this.screen);

	// or we could render it to our framebuffer.
	this.mainScene.render(this.fbo.fbo1);

	// or... you have some uniforms to set inside shader1?
	this.mainScene.getPart('main').shaderContainer
		.bindUniform('uMyUniform1', 1)
		.bindUniform('uMyUniform2', [1.0, 0.0, 2.0])
	;
	this.mainScene.render(this.screen);

	// or... you want to use your framebuffer as a texture?
	this.mainScene.getPart('main').shaderContainer
		.bindTexture('uSampler', this.fbo.fbo1)
	;
	this.mainScene.render(this.screen);

	// note: if the value never change between each frame, you should do the binding calls only once inside postSetup(), not here.
 };

 tngl.init();
 ```

## shaders

There is some default properties and uniforms used by the framework.

If you use them on your shaders, the right value will automatically be used.

#### attributes

*vec3 aVertexPosition*
*vec3 aVertexNormal*
*vec2 aTexturePosition*

#### uniforms

*mat4 uMVMatrix*
modelview matrix of the camera (Scene.camera)

*mat4 uPMatrix*
perspective matrix of the camera.

*mat4 uObjMVMatrix*
modelview matrix of the object.

*vec3 uTranslation*
translation vector of the object.

*vec4 uOrientation*
quaternion of the object.

*vec3 uScale*
scaling factor of the object.

#### example

A basic vertex shader would therefore look like that:

```c
precision highp float;

attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uMVMatrix;
uniform mat4 uObjMVMatrix;
uniform mat4 uPMatrix;
uniform vec3 uTranslation;
uniform vec3 uScale;

varying vec3 vNormal;

void main() {
  vec4 vWorldPosition = uMVMatrix * vec4((vec4(aVertexPosition, 1.0) * uObjMVMatrix).xyz * uScale) - uTranslation, 1.0);
  vNormal = aVertexNormal;
  gl_Position = uPMatrix * vWorldPosition;
}
```

## documentation

For now, check my examples in the example folder.
