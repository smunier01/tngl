#ifdef GL_ES
precision highp float;
#endif

uniform vec2 targetResolution;
uniform vec2 canvasResolution;
uniform float uTime;
uniform sampler2D uSample0;
uniform vec2 uMouse;
varying vec2 vUv;
//mod(uTime * 0.1, 1.0)

vec4 dying = vec4(1.0, mod(uTime * 0.1, 1.0), 0.4, 1.0);
vec4 live = vec4(0.0, 0.0, 0.0, 0.9);
vec4 dead = vec4(1.0, 1.0, 1.0, 1.0);

void main( void ) {

  vec2 position = (gl_FragCoord.xy / targetResolution.xy);
  vec2 pixel = 1.0 / targetResolution;

  if (length(position - (uMouse / canvasResolution)) < 0.01) {

    float rnd1 = mod(fract(sin(dot(position + uTime * 0.001, vec2(14.9898,78.233))) * 43758.5453), 1.0);

    if (rnd1 > 0.5) {
      gl_FragColor = live;
    } else {
      gl_FragColor = dying;
    }

  } else {

    float sum = 0.0;

    for (int x = -1; x < 2; x++) {
      for (int y = -1; y < 2; y++) {
        if ((x != 0 || y != 0)) {
          sum += 1.0 - texture2D(uSample0, position + pixel * vec2(x, y)).a;
        }
      }
    }

    vec4 me = texture2D(uSample0, position);

    if (me.r < 0.1 && me.g < 0.1 && me.b < 0.1 && me.a < 0.1) {

      gl_FragColor = dead;

    } else if (me.a < 1.0) {
      // between 2 and 3, the cell keep living
      if ((sum >= 0.15) && (sum <= 0.35)) {
        gl_FragColor = live;
      } else  {
        gl_FragColor = dying;
      }
    } else {
      // if dead, and 3 alive neighbors
      if ((sum >= 0.25) && (sum <= 0.35)) {
        gl_FragColor = live;
      } else if (me.b < 0.85) {
        gl_FragColor = vec4(me.r, min(me.g + 0.004, 0.85),  min(me.b + 0.004, 0.85), 1.0);
      } else {
        gl_FragColor = me;
      }

    }
  }
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
