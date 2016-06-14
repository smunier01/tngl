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


void main( void ) {
  vec2 position = (gl_FragCoord.xy / targetResolution.xy);
  vec2 pixel = 1.0 / targetResolution;

  vec4 dying = vec4(1.0, mod(uTime * 0.1, 0.8), 0.4, 1.0);
  vec4 live = vec4(0.0, 0.0, 0.0, 0.9);

  vec4 me = texture2D(uSample0, position);
  if (gl_FragCoord.x <= 0.5 && gl_FragCoord.y <= 0.5) {

    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    
  } else if (gl_FragCoord.x > targetResolution.x - 1.0 && gl_FragCoord.y > targetResolution.y - 1.0) {

    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    
  } else {

    float sumr = 0.0;
    float sumb = 0.0;
    float sumg = 0.0;

    vec4 sum;
    
    for (int x = -1; x < 2; x++) {
      for (int y = -1; y < 2; y++) {
        if ((x != 0 || y != 0) /*&& (x == 0 || y == 0)*/) { 
          sum += texture2D(uSample0, position + pixel * vec2(x, y));
        }
      }
    }

    float rnd1 = mod(fract(sin(dot(position + uTime * 0.001, vec2(14.9898,78.233))) * 43758.5453), 1.0);

    if (sum.r > 0.9 && sum.b > 0.9) {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    } else if ((me.b > 0.9 || me.r > 0.9) && (sum.g > 0.9)) {
      gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    } else if (sum.r > 0.9 && sum.r < 1.2 && sum.g < 0.9) {
      if (rnd1 >= 0.0) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = me;
      }
    } else if (sum.b > 0.9 && sum.b < 1.1 && sum.g < 0.9) {
      if (rnd1 >= 0.0) {
        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
      } else {
        gl_FragColor = me;
      }
    } else {
      gl_FragColor = me;
    }
  }
}
