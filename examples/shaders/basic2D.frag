precision mediump float;
uniform sampler2D uSample0;
uniform vec2 targetResolution;

varying vec2 vUv;

void main () {
  gl_FragColor = vec4(texture2D(uSample0, vUv).rgba);
  //gl_FragColor = vec4(vUv.y > 0.5, 0.0, 0.0, 1.0);
}
