!function(t,e){if("object"==typeof exports&&"object"==typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var r=e();for(var i in r)("object"==typeof exports?exports:t)[i]=r[i]}}(this,function(){return function(t){function e(i){if(r[i])return r[i].exports;var n=r[i]={exports:{},id:i,loaded:!1};return t[i].call(n.exports,n,n.exports,e),n.loaded=!0,n.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){"use strict";e.TnGL=r(1),e.TnGL.ShaderContainer=r(2),e.TnGL.Object=r(3),e.TnGL.Camera=r(4),e.TnGL.Mouse=r(5),e.TnGL.ScenePart=r(6),e.TnGL.Scene=r(7),e.TnGL.Renderer=r(8)},function(t,e){"use strict";var r=function(t,e){this.gl=t.getContext("experimental-webgl"),t.width=t.clientWidth,t.height=t.clientHeight,this.gl.viewportWidth=t.width,this.gl.viewportHeight=t.height,this.options=e,this.textures={},this.fbo={},this.shaderPrograms={},this.ext=[],this.buffers=[],this.stats=[],this.startTime=(new Date).getTime(),this.timeSinceStart=0,this.screen={framebuffer:null,texture:null,width:this.gl.viewportWidth,height:this.gl.viewportHeight,depth:!0},this.preSetup=function(t){t()},this.postSetup=function(){},this.renderTick=function(){},this.logicTick=function(){}},i={extensions:{data:[]},shaders:{options:{cache:!0,fragExt:"frag",vertexExt:"vertex",loadPath:"shaders/"},data:[]},textures:{options:{loadPath:"textures/"},defaults:{filtering:"nearest",internalFormat:"rgba",format:"rgba",mipmap:!0},data:[]},framebuffers:{options:{},defaults:{internalFormat:"rgba",format:"rgba",type:"unsigned_byte",width:function(t){return t.viewportWidth},height:function(t){return t.viewportHeight},filtering:"linear",depth:!1},data:[]}};r.prototype.setup=function(){var t=$.Deferred();return this.optionsInitialisation(this.options,i),this.createBuffer("square",this.getModel("square",1)),this.createBuffer("square2d",this.getModel("square2d",1)),this.createBuffer("cube",this.SimpleModels.cube(1)),this.preSetup(function(){t.resolve()}),t.promise()},r.prototype.init=function(){var t=this;this.setup().then(function(){return console.log("[extensions initialisation]"),t.initExtensions(t.options.extensions)}).then(function(){return console.log("[shaders initialisation]"),t.initShaders(t.options.shaders)}).then(function(){return console.log("[textures initialisation]"),t.initTextures(t.options.textures)}).then(function(){return console.log("[framebuffers initialisation]"),t.initFramebuffers(t.options.framebuffers)}).then(function(){t.postSetup();var e=0;!function r(){for(var i=0;i<t.stats.length;i++)t.stats[i].begin();t.renderTick.call(t,t.gl,e++);for(var n=0;n<t.stats.length;n++)t.stats[n].end();requestAnimFrame(function(){r()})}(),function i(){t.timeSinceStart=(new Date).getTime()-t.startTime,t.logicTick.call(t,t.gl,e),setTimeout(i,1/60*1e3)}()})},r.compareArray=function(t,e){return t&&e?t[0]===e[0]&&t[1]===e[1]&&t[2]===e[2]:!1},r.prototype.getPropertiesFromProg=function(t){var e=[],r=[];for(var i in t)"number"==typeof t[i]?e.push(i):null!==t[i]&&"WebGLUniformLocation"===t[i].constructor.name&&r.push(t[i]);return{attributes:e,uniforms:r}},r.prototype.initExtensions=function(t){var e,r,i=$.Deferred();for(r=0;r<t.data.length;r++)e=t.data[r],"name"in e&&""!==e.name?"source"in e?(this.ext[e.name]=this.gl.getExtension(e.source),this.ext[e.name]?console.log("initExtensions: [%d/%d] - %s loaded",r+1,t.data.length,e.name):console.warn('initExtensions: couldn\'t load "%s"',e.name)):console.warn("initExtensions: extension must have a source (%s).",e.name):console.warn("initExtensions: extension's name cannot be empty.");return i.resolve(),i.promise()},r.prototype.initFramebuffers=function(t){var e,r,i=$.Deferred();for(r=0;r<t.data.length;r++)e=t.data[r],"name"in e&&""!==e.name?this.fbo[e.name]=this.createFramebuffer(e):console.warn("initFramebuffers: framebuffer name cannot be empty.");return i.resolve(),i.promise()},r.prototype.addShaderProgram=function(t){},r.prototype.concatArrays=function(){for(var t=[],e=0;e<arguments.length;e++)arguments[e]&&(t=t.concat(arguments[e]));for(var r=0;r<t.length;++r)for(var i=r+1;i<t.length;++i)t[r]===t[i]&&t.splice(i--,1);return t},r.prototype.optionsInitialisation=function(t,e){for(var r in e)if(e.hasOwnProperty(r))if(r in t){"options"in t[r]||(t[r].options=e[r].options),"data"in t[r]||(t[r].data=e[r].data),"defaults"in t[r]||(t[r].defaults=e[r].defaults);var i=t[r].data,n=t[r].defaults,o=e[r].defaults,a=!0,s=!1,u=void 0;try{for(var h,c=i[Symbol.iterator]();!(a=(h=c.next()).done);a=!0){var f=h.value;for(var m in o)f[m]instanceof Array||n[m]instanceof Array||o[m]instanceof Array?f[m]=this.concatArrays(f[m],n[m],o[m]):f[m]=f[m]||n[m]||o[m]}}catch(p){s=!0,u=p}finally{try{!a&&c["return"]&&c["return"]()}finally{if(s)throw u}}var l=t[r].options,d=e[r].options;for(var g in d)l[g]=l[g]||d[g]}else t[r]=e[r]},r.prototype.changeFramebufferResolution=function(t,e,r){var i=this.fbo[t];this.fbo[t]=this.newFramebuffer(i.name,r,e,i.magFilter,i.minFilter,i.type,i.format,i.internalFormat,i.depth)},r.prototype.newFramebuffer=function(t,e,r,i,n,o,a,s,u){var h={},c=this.gl;if(h.framebuffer=c.createFramebuffer(),c.bindFramebuffer(c.FRAMEBUFFER,h.framebuffer),h.texture=c.createTexture(),c.bindTexture(c.TEXTURE_2D,h.texture),h.name=t,h.height=e,h.width=r,h.depth=u,h.magFilter=i,h.minFilter=n,h.type=o,h.format=a,h.internalFormat=s,c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,i),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,n),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.CLAMP_TO_EDGE),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.CLAMP_TO_EDGE),c.texImage2D(c.TEXTURE_2D,0,s,r,e,0,a,o,null),c.framebufferTexture2D(c.FRAMEBUFFER,c.COLOR_ATTACHMENT0,c.TEXTURE_2D,h.texture,0),u){var f=c.createRenderbuffer();c.bindRenderbuffer(c.RENDERBUFFER,f),c.renderbufferStorage(c.RENDERBUFFER,c.DEPTH_COMPONENT16,r,e),c.framebufferRenderbuffer(c.FRAMEBUFFER,c.DEPTH_ATTACHMENT,c.RENDERBUFFER,f)}var m=c.checkFramebufferStatus(c.FRAMEBUFFER);return m!==c.FRAMEBUFFER_COMPLETE&&console.warn("Framebuffer '"+t+"' unrenderable"),c.bindTexture(c.TEXTURE_2D,null),c.bindRenderbuffer(c.RENDERBUFFER,null),c.bindFramebuffer(c.FRAMEBUFFER,null),h},r.prototype.createFramebuffer=function(t){var e=this.gl,r=e[t.filtering.toUpperCase()],i=e[t.filtering.toUpperCase()],n="function"==typeof t.width?t.width(e):t.width,o="function"==typeof t.height?t.height(e):t.height,a=e[t.type.toUpperCase()],s=e[t.format.toUpperCase()],u=e[t.internalFormat.toUpperCase()],h=this.newFramebuffer(t.name,o,n,r,i,a,s,u,t.depth);return h},r.prototype.initShaders=function(t){var e=this,i=this.gl,n=$.Deferred(),o=t.data.length,a=o,s=[],u=function(u,h,c){var f=t.data[c];if(f.name in s){var m=e.shaderPrograms[f.name]=new r.ShaderContainer(e);h===i.VERTEX_SHADER?(m.setVertexCode(u),m.setFragCode(s[f.name])):(m.setFragCode(u),m.setVertexCode(s[f.name])),m.compile(),console.log("["+(c+1)+"/"+o+"] - '"+f.name+"' linked"),a-=1,a||n.resolve()}else s[f.name]=u},h=function(t,e){var r={timestamp:(new Date).getTime()};$.ajax({url:t,data:r,type:"GET",success:e})};return $.each(t.data,function(e,r){var n=t.options.loadPath+r.name+"."+t.options.fragExt,o=t.options.loadPath+r.name+"."+t.options.vertexExt;h(n,function(t){u(t,i.FRAGMENT_SHADER,e)}),h(o,function(t){u(t,i.VERTEX_SHADER,e)})}),n.promise()},r.prototype.getModel=function(t,e){var r;"square2d"===t?r=[-e,-e,0,-e,e,0,e,-e,0,e,e,0]:"square"===t&&(r=[-e,0,-e,-e,0,e,e,0,-e,e,0,e]),r.itemSize=3,r.numItems=4;var i=[0,1,2,1,2,3];i.itemSize=1,i.numItems=6;var n=[0,0,0,1,1,0,1,1];n.itemSize=2,n.numItems=4;var o=[0,1,0,0,1,0,0,1,0,0,1,0];o.itemSize=3,o.numItems=4;var a={vertices:r,indices:i,uv:n,normals:o};return a},r.prototype.SimpleModels={cube:function(t){var e=[-t,-t,t,t,-t,t,t,t,t,-t,t,t,-t,-t,-t,-t,t,-t,t,t,-t,t,-t,-t,-t,t,-t,-t,t,t,t,t,t,t,t,-t,-t,-t,-t,t,-t,-t,t,-t,t,-t,-t,t,t,-t,-t,t,t,-t,t,t,t,t,-t,t,-t,-t,-t,-t,-t,t,-t,t,t,-t,t,-t];e.itemSize=3,e.numItems=24;var r=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23];r.itemSize=1,r.numItems=36;var i=[0,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,1,0,0,1,0,0,1,0,0,1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0];i.itemSize=3,i.numItems=24;var n=[0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1,0,0,0,1,1,0,1,1];n.itemSize=2,n.numItems=24;var o={vertices:e,indices:r,uv:n,normals:i};return o}},r.prototype.createBuffer=function(t,e){var i,n,o=this.gl,a=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,a),o.bufferData(o.ARRAY_BUFFER,new Float32Array(e.vertices),o.STATIC_DRAW),a.itemSize=e.vertices.itemSize,a.numItems=e.vertices.numItems;var s=o.createBuffer();o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,s),o.bufferData(o.ELEMENT_ARRAY_BUFFER,new Uint16Array(e.indices),o.STATIC_DRAW),s.itemSize=e.indices.itemSize,s.numItems=e.indices.numItems,"normals"in e&&(n=o.createBuffer(),o.bindBuffer(o.ARRAY_BUFFER,n),o.bufferData(o.ARRAY_BUFFER,new Float32Array(e.normals),o.STATIC_DRAW),n.itemSize=e.normals.itemSize,n.numItems=e.normals.numItems),"uv"in e&&(i=o.createBuffer(),o.bindBuffer(o.ARRAY_BUFFER,i),o.bufferData(o.ARRAY_BUFFER,new Float32Array(e.uv),o.STATIC_DRAW),i.itemSize=e.uv.itemSize,i.numItems=e.uv.numItems),this.buffers[t]={id:r.lastBufferId++,vertexPosition:a,vertexIndex:s,uv:i,normals:n}},r.lastBufferId=0,r.prototype.addStats=function(t){var e=new Stats;e.setMode(t),e.dom.style.position="absolute",e.dom.style.left=100*this.stats.length+"px",e.dom.style.bottom="10px",e.dom.style.top="",document.body.appendChild(e.domElement),this.stats.push(e)},r.prototype.createTextureFromArray=function(t,e){var r=this.gl;this.textures[t]=r.createTexture(),r.bindTexture(r.TEXTURE_2D,this.textures[t]),r.pixelStorei(r.UNPACK_ALIGNMENT,1),r.texImage2D(r.TEXTURE_2D,0,r.RGB,5,5,0,r.RGB,r.UNSIGNED_BYTE,new Uint8Array(e)),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.bindTexture(r.TEXTURE_2D,null)},r.prototype.initTextures=function(t){var e=this.gl,r=this,i=$.Deferred(),n=t.data.length,o=n,a=["jpg","jpeg","png"],s=["name","source"],u=function(){o-=1,o||i.resolve()},h=function(r,i){var n=t.data[i],o=n.filtering.toUpperCase(),a=e[o],s=n.mipmap&&"LINEAR"===a?e.LINEAR_MIPMAP_LINEAR:e[o],h=e[n.internalFormat.toUpperCase()],c=e[n.format.toUpperCase()];e.bindTexture(e.TEXTURE_2D,r),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!0),e.texImage2D(e.TEXTURE_2D,0,h,c,e.UNSIGNED_BYTE,r.image),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,s),n.mipmap&&e.generateMipmap(e.TEXTURE_2D),e.bindTexture(e.TEXTURE_2D,null),console.log("["+(i+1)+"/"+t.data.length+"] - '"+n.name+"' binded"),u()},c=function f(i){i<t.data.length-1&&setTimeout(function(){f(i+1)},0);var n=t.data[i],o=n.source.split(".")[1],c=!0,m=!1,p=void 0;try{for(var l,d=s[Symbol.iterator]();!(c=(l=d.next()).done);c=!0){var g=l.value;if(!(g in n)||""===n[g])return console.warn("initTextures: property "+g+" is required."),void u()}}catch(v){m=!0,p=v}finally{try{!c&&d["return"]&&d["return"]()}finally{if(m)throw p}}if(-1===a.indexOf(o))return console.warn("image extension "+o+" is not supported"),void u();var E=e.createTexture();r.textures[n.name]=E,r.textures[n.name].image=new Image,r.textures[n.name].image.onload=function(){h(E,i)},r.textures[n.name].image.onerror=function(){console.warn("image "+this.src+" can't be loaded."),u()},r.textures[n.name].image.src=t.options.loadPath+n.source};return t.data.length>0?c(0):i.resolve(),i.promise()},r.prototype.getShaderContainer=function(t){return this.shaderPrograms[t]},window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t,e){window.setTimeout(t,1e3/60)}}(),t.exports=r},function(t,e,r){"use strict";var i=r(1);i.ShaderContainer=function(t){this.engine=t,this.currentBufferId=-1,this.program=null,this.vertexCode=null,this.fragCode=null,this.fragCompiled=null,this.vertexCompiled=null,this.vertexCodeHasChanged=!1,this.fragCodeHasChanged=!1,this.logs={frag:[],vert:[]},this.textureBinding={},this.uniformBinding={},this.currentColor=null,this.updateTextures=function(){for(var t=this.engine.gl,e=0;e<Object.keys(this.textureBinding).length;e++){var r=Object.keys(this.textureBinding)[e],i=void 0;if(this.textureBinding.hasOwnProperty(r)){if(!(r in this.program)){console.warn("unknown uniform '"+r+"'. Can't bind texture to it.");continue}var n=this.textureBinding[r];if(n instanceof Object&&"framebuffer"in n)i=n.texture;else{if(!(n in this.engine.textures)){console.warn(n+" is not a texture and cant be binded");continue}i=this.engine.textures[n]}t.activeTexture(t.TEXTURE0+e),t.bindTexture(t.TEXTURE_2D,i),t.uniform1i(this.program[r],e)}}},this.updateUniforms=function(t,e){var r=this.engine.gl;"targetResolution"in this.program&&r.uniform2fv(this.program.targetResolution,[e.width,e.height]),"canvasResolution"in this.program&&r.uniform2fv(this.program.canvasResolution,[r.viewportWidth,r.viewportHeight]),"uTime"in this.program&&r.uniform1f(this.program.uTime,(Date.now()-this.engine.startTime)/1e3),"uMouse"in this.program&&r.uniform2fv(this.program.uMouse,[t.mouse.currentX,r.viewportHeight-t.mouse.currentY]),"uPMatrix"in this.program&&r.uniformMatrix4fv(this.program.uPMatrix,!1,t.camera.pMatrix),"uMVMatrix"in this.program&&r.uniformMatrix4fv(this.program.uMVMatrix,!1,t.camera.mvMatrix),"uNormalMatrix"in this.program&&r.uniformMatrix3fv(this.program.uNormalMatrix,!1,t.camera.normalMatrix);for(var i=0;i<Object.keys(this.uniformBinding).length;i++){var n=Object.keys(this.uniformBinding)[i];if(this.uniformBinding.hasOwnProperty(n)){if(!(n in this.program)){console.warn("unknown uniform '"+n+"'. Can't bind value to it.");continue}var o=this.uniformBinding[n];"number"==typeof o&&r.uniform1f(this.program[n],o),"boolean"==typeof o&&r.uniform1f(this.program[n],o),3===o.length?r.uniform3fv(this.program[n],o):4===o.length?r.uniform4fv(this.program[n],o):16===o.length?r.uniformMatrix4fv(this.program[n],!1,o):25===o.length&&r.uniform1fv(this.program[n],!1,o)}}}},i.ShaderContainer.prototype={updatePositionUniforms:function(t){var e=this.engine.gl;this.program.uColor&&(i.compareArray(this.currentColor,t.color)||(e.uniform4fv(this.program.uColor,t.color),this.currentColor=t.color)),this.program.uTranslation&&(i.compareArray(this.currentPosition,t.position)||(e.uniform3fv(this.program.uTranslation,t.position),this.currentPosition=[],this.currentPosition[0]=t.position[0],this.currentPosition[1]=t.position[1],this.currentPosition[2]=t.position[2])),this.program.uOrientation&&(i.compareArray(this.currentOrientation,t.properties.orientation)||(e.uniform3fv(this.program.uOrientation,t.properties.orientation),this.currentOrientation=t.properties.orientation)),this.program.uScale&&(i.compareArray(this.currentScale,t.scale)||(e.uniform3fv(this.program.uScale,t.scale),this.currentScale=t.scale))},bindTexture:function(t,e){return this.textureBinding[t]=e,this},bindUniform:function(t,e){return this.uniformBinding[t]=e,this},getVertexCode:function(){return this.vertexCode},getFragCode:function(){return this.fragCode},setVertexCode:function(t){this.vertexCode=t},setFragCode:function(t){this.fragCode=t},compileShader:function(t){var e,r,i=function(t){t=String(t);for(var e,r=[];e=t.match(/ERROR\:([^\n]+)/);){t=t.slice(e.index+1);var i=e[1].trim(),n=i.split(":"),o=n.slice(2).join(":").trim(),a=parseInt(n[0],10),i=parseInt(n[1],10);r.push({message:o,file:a,line:i})}return r},n=this.engine.gl;t===n.FRAGMENT_SHADER?(e=this.fragCode,r="frag"):(e=this.vertexCode,r="vert");var o=n.createShader(t);return n.shaderSource(o,e),n.compileShader(o),n.getShaderParameter(o,n.COMPILE_STATUS)?(this.logs[r]=[],o):(console.error("shader compilation error : "+n.getShaderInfoLog(o)),this.logs[r]=i(n.getShaderInfoLog(o)),null)},attachShader:function(){var t=this.engine.gl,e=t.createProgram();if(t.attachShader(e,this.fragCompiled),t.attachShader(e,this.vertexCompiled),t.linkProgram(e),t.getProgramParameter(e,t.LINK_STATUS)){for(var r=t.getProgramParameter(e,t.ACTIVE_UNIFORMS),i=0;r>i;++i){var n=t.getActiveUniform(e,i);e[n.name]=t.getUniformLocation(e,n.name)}for(var o=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES),a=0;o>a;++a){var s=t.getActiveAttrib(e,a);e[s.name]=t.getAttribLocation(e,s.name)}this.program=e}else console.error("couldn't link program "+name+" "+t.getProgramInfoLog(e))},compile:function(){var t=this.engine.gl;return this.fragCompiled=this.compileShader(t.FRAGMENT_SHADER),this.vertexCompiled=this.compileShader(t.VERTEX_SHADER),this.attachShader()},findShaderProperties:function(){var t=[],e=[];for(var r in this.program)"number"==typeof this.program[r]?t.push(r):null!==this.program[r]&&"WebGLUniformLocation"===this.program[r].constructor.name&&e.push(this.program[r]);return{attributes:t,uniforms:e}},init:function(){var t=this.engine.gl;this.currentBufferId=-1,t.useProgram(this.program);var e=this.findShaderProperties(),r=!0,i=!1,n=void 0;try{for(var o,a=e.attributes[Symbol.iterator]();!(r=(o=a.next()).done);r=!0){var s=o.value;t.enableVertexAttribArray(this.program[s])}}catch(u){i=!0,n=u}finally{try{!r&&a["return"]&&a["return"]()}finally{if(i)throw n}}},clean:function(){var t=this.engine.gl;this.currentBufferId=-1,t.useProgram(null);var e=this.findShaderProperties(),r=!0,i=!1,n=void 0;try{for(var o,a=e.attributes[Symbol.iterator]();!(r=(o=a.next()).done);r=!0){var s=o.value;t.disableVertexAttribArray(this.program[s])}}catch(u){i=!0,n=u}finally{try{!r&&a["return"]&&a["return"]()}finally{if(i)throw n}}}},t.exports=i.ShaderContainer},function(t,e,r){"use strict";var i=r(1);i.Object=function(t){this.buffer=t,this.properties={position:[0,0,0],orientation:[1,0,0],scale:[1,1,1],color:[0,0,0,1],euler:vec3.create(),quat:quat.create()},this.mvMatrix=mat4.create(),mat4.identity(this.mvMatrix)},i.Object.prototype={updateQuaternionFromEulers:function(){var t=Math.cos(this.properties.euler[0]/2),e=Math.cos(this.properties.euler[1]/2),r=Math.cos(this.properties.euler[2]/2),i=Math.sin(this.properties.euler[0]/2),n=Math.sin(this.properties.euler[1]/2),o=Math.sin(this.properties.euler[2]/2);this.properties.quat[0]=i*e*r+t*n*o,this.properties.quat[1]=t*n*r-i*e*o,this.properties.quat[2]=t*e*o+i*n*r,this.properties.quat[3]=t*e*r-i*n*o},onEulerChange:function(){this.updateQuaternionFromEulers(),mat4.fromQuat(this.mvMatrix,this.properties.quat),mat4.translate(this.mvMatrix,this.mvMatrix,[-this.position[0],-this.position[1],-this.position[2]])},onMvmatrixChange:function(){this.updateEulersFromMatrix(),this.updateQuaternionFromEulers()},onQuaternionChange:function(){mat4.fromQuat(this.mvMatrix,this.properties.quat),mat4.translate(this.mvMatrix,this.mvMatrix,this.position),this.updateEulersFromMatrix()},updateEulersFromMatrix:function(){var t=this.mvMatrix,e=t[0],r=t[4],i=t[8],n=(t[1],t[5]),o=t[9],a=(t[2],t[6]),s=t[10];this.properties.euler[1]=Math.asin(Math.min(Math.max(i,-1),1)),Math.abs(i)<.99999?(this.properties.euler[0]=Math.atan2(-o,s),this.properties.euler[2]=Math.atan2(-r,e)):(this.properties.euler[0]=Math.atan2(a,n),this.properties.euler[2]=0)},eulerToVector:function(){this.direction[0]=Math.cos(this.euler[0])*Math.cos(this.euler[1]),this.direction[1]=Math.sin(this.euler[1]),this.direction[2]=Math.sin(this.euler[0])*Math.cos(this.euler[1])},quatRotateY:function(t){var e=t/2,r=Math.sin(e),i=[0,1,0],n=quat4.create();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=Math.cos(e),quat4.multiplyVec3(n,this.direction,this.direction),this},quatRotateX:function(t){var e=t/2,r=Math.sin(e),i=[1,0,0],n=quat4.create();return n[0]=i[0]*r,n[1]=i[1]*r,n[2]=i[2]*r,n[3]=Math.cos(e),quat4.multiplyVec3(n,this.direction,this.direction),this},rotateX:function(t){return this.rotate([1,0,0],t),this},rotateY:function(t){return this.rotate([0,1,0],t),this},rotateZ:function(t){return this.rotate([0,0,1],t),this},rotate:function(t,e){var r=e/2,i=Math.sin(r),n=this.position[0],o=this.position[1],a=this.position[2],s=t[0]*i,u=t[1]*i,h=t[2]*i,c=Math.cos(r),f=c*n+u*a-h*o,m=c*o+h*n-s*a,p=c*a+s*o-u*n,l=-s*n-u*o-h*a;return this.position[0]=f*c+l*-s+m*-h-p*-u,this.position[1]=m*c+l*-u+p*-s-f*-h,this.position[2]=p*c+l*-h+f*-u-m*-s,this},update:function(){return mat4.identity(this.mvMatrix),mat4.rotate(this.mvMatrix,this.mvMatrix,this.properties.euler[0],[1,0,0]),mat4.rotate(this.mvMatrix,this.mvMatrix,this.properties.euler[1],[0,1,0]),mat4.rotate(this.mvMatrix,this.mvMatrix,this.properties.euler[2],[0,0,1]),mat4.translate(this.mvMatrix,this.mvMatrix,[-this.position[0],-this.position[1],-this.position[2]]),mat3.normalFromMat4(this.normalMatrix,this.mvMatrix),this.hasChanged=!1,this},translateX:function(t){return this.translate([1,0,0],t),this},translateY:function(t){return this.translate([0,1,0],t),this},translateZ:function(t){return this.translate([0,0,1],t),this},translate:function(t,e){return this.position[0]+=t[0]*e,this.position[1]+=t[1]*e,this.position[2]+=t[2]*e,this},rotateFromCenter:function(t,e,r){return this.translate(t,-1),this.rotate(e,r),this.translate(t,1),this},rotateXFromCenter:function(t,e){return this.translate(t,-1),this.rotateX(e),this.translate(t,1),this},rotateYFromCenter:function(t,e){return this.translate(t,-1),this.rotateY(e),this.translate(t,1),this},rotateZFromCenter:function(t,e){return this.translate(t,-1),this.rotateZ(e),this.translate(t,1),this},copy:function(){var t=new i.Object(this.buffer);return t.position=this.position,t.orientation=this.orientation,t.scale=this.scale,t.color=this.color,t},set euler(t){this.properties.euler[0]=t[0],this.properties.euler[1]=t[1],this.properties.euler[2]=t[2],this.onEulerChange()},get euler(){return this.properties.euler},set pitch(t){this.properties.euler[0]=t,this.onEulerChange()},get pitch(){return this.properties.euler[0]},set yaw(t){this.properties.euler[1]=t,this.onEulerChange()},get yaw(){return this.properties.euler[1]},set roll(t){this.properties.euler[2]=t,this.onEulerChange()},get roll(){return this.properties.euler[2]},set color(t){4===t.length?this.properties.color=t:(t.push(1),this.properties.color=t)},get color(){return this.properties.color},set position(t){this.properties.position[0]=t[0],this.properties.position[1]=t[1],this.properties.position[2]=t[2]},get position(){return this.properties.position},set scale(t){this.properties.scale=t},get scale(){return this.properties.scale}},t.exports=i.Object},function(t,e,r){"use strict";var i=r(1);i.Object=r(3),i.Camera=function(){i.Object.call(this,null),this.fov=45,this.near=1,this.far=100,this.pMatrix=mat4.create(),mat4.identity(this.pMatrix),this.normalMatrix=mat3.create(),mat3.identity(this.normalMatrix)},i.Camera.prototype={__proto__:Object.create(i.Object.prototype),perspective:function(t,e,r,i){return mat4.perspective(this.pMatrix,t*Math.PI/180,e,r,i),this.fov=t,this.far=i,this.near=r,this},orthogonal:function(t,e,r,i,n,o){return mat4.ortho(this.pMatrix,t,e,r,i,n,o),this.far=o,this.near=n,this},lookAt:function(t,e,r){return mat4.lookAt(this.mvMatrix,t,e,r),this.position=t,this.onMvmatrixChange(),this.hasChanged=!1,this}},t.exports=i.Camera},function(t,e,r){"use strict";var i=r(1);i.Mouse=function(t){this.scene=t,this.currentX=0,this.currentY=0,this.rightClickDown=!1},i.Mouse.prototype={enable:function(t){document.addEventListener("mousemove",this.move.bind(this),!1),t&&(document.addEventListener("mouseup",this.clickUp.bind(this),!1),document.addEventListener("mousedown",this.clickDown.bind(this),!1),document.addEventListener("contextmenu",function(t){return t.preventDefault(),-1},!1))},disable:function(){},move:function(t){if(this.currentX=t.clientX,this.currentY=t.clientY,this.rightClickDown){var e=t.movementX||t.mozMovementX||0,r=t.movementY||t.mozMovementY||0;this.scene.camera.pitch+=.001*r,this.scene.camera.yaw+=.001*e}},clickUp:function(t){2===t.button&&(this.rightClickDown=!1,document.exitPointerLock=document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock,document.exitPointerLock())},clickDown:function(t){t.preventDefault(),2===t.button&&(this.rightClickDown=!0,this.ptrLock($("#webgl-canvas")[0]))},ptrLock:function(t){t.requestPointerLock=t.requestPointerLock||t.mozRequestPointerLock||t.webkitRequestPointerLock,t.requestPointerLock()}},t.exports=i.Mouse},function(t,e,r){"use strict";var i=r(1);i.ScenePart=function(t,e){this.objects=t,this.shaderContainer=e},i.ScenePart.prototype={setObjects:function(t){this.objects=t},getObjects:function(){return this.objects},setShaderContainer:function(t){this.shaderContainer=t},getShaderContainer:function(){return this.shaderContainer},addObjects:function(t){return this.objects.concat(t)}},t.exports=i.ScenePart},function(t,e,r){"use strict";var i=r(1);i.Camera=r(4),i.Mouse=r(5),i.Renderer=r(8),i.Scene=function(t){this.engine=t,this.camera=new i.Camera,this.mouse=new i.Mouse(this),this.renderer=new i.Renderer(this.engine.gl),this.parts=[],this.fov=45},i.Scene.prototype={addPart:function(t,e,r){t in this.parts?console.warn("Scene already has a part named "+t):this.parts[t]=new i.ScenePart(e,r)},render:function(t){this.renderWithViewport(t,{x:0,y:0,width:t.width,height:t.height})},renderWithViewport:function(t,e){this.renderer.setViewport(e),this.renderer.setTarget(t),this.renderer.setScene(this),this.renderer.render()},getPart:function(t){return this.parts[t]}},t.exports=i.Scene},function(t,e,r){"use strict";var i=r(1);i.Renderer=function(t){this.gl=t,this.target=null,this.viewport=null,this.scene=null,this.indexType=t.UNSIGNED_SHORT},i.Renderer.prototype={setScene:function(t){this.scene=t},setTarget:function(t){this.target=t},setViewport:function(t){this.viewport=t},bindVertexAttribPointer:function(t,e){t>=0&&null!=e&&(this.gl.bindBuffer(this.gl.ARRAY_BUFFER,e),this.gl.vertexAttribPointer(t,e.itemSize,this.gl.FLOAT,!1,0,0))},renderObject:function(t,e){var r=e.program;e.updatePositionUniforms(t),t.buffer.id!==e.currentBufferId&&(this.bindVertexAttribPointer(r.aVertexPosition,t.buffer.vertexPosition),this.bindVertexAttribPointer(r.aTexturePosition,t.buffer.uv),this.bindVertexAttribPointer(r.aVertexNormal,t.buffer.normals)),this.draw(t.buffer.vertexIndex),e.currentBufferId=t.buffer.id},draw:function(t){this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,t),this.gl.drawElements(this.gl.TRIANGLES,t.numItems,this.indexType,0)},render:function(){var t=this.gl,e=this.viewport,r=this.target;t.bindFramebuffer(t.FRAMEBUFFER,r.framebuffer),t.viewport(e.x,e.y,e.width,e.height),r.framebuffer&&(t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT),t.clearColor(0,0,0,1)),r.depth?t.enable(t.DEPTH_TEST):t.disable(t.DEPTH_TEST);for(var i in this.scene.parts)this.renderScenePart(this.scene.parts[i]);t.disable(t.DEPTH_TEST),t.bindFramebuffer(t.FRAMEBUFFER,null)},renderScenePart:function(t){var e=t.getObjects(),r=t.getShaderContainer();r.init(),r.updateTextures(),r.updateUniforms(this.scene,this.viewport);var i=!0,n=!1,o=void 0;try{for(var a,s=e[Symbol.iterator]();!(i=(a=s.next()).done);i=!0){var u=a.value;this.renderObject(u,r)}}catch(h){n=!0,o=h}finally{try{!i&&s["return"]&&s["return"]()}finally{if(n)throw o}}r.clean()}},t.exports=i.Renderer}])});