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

uniform sampler2D uNeighboring;

uniform float uAliveMin;
uniform float uAliveMax;
uniform float uDeadMin;
uniform float uDeadMax;

uniform vec3 uColorAlive;
uniform vec3 uColorDead;
uniform vec3 uColorDying;
uniform vec4 uDyingChannel;

uniform bool uClear;
uniform bool uLoop;
uniform vec3 uTransitions;
uniform vec3 uTransSpeed;

float diff = 0.05;

void main( void ) {

  vec4 dying;
  vec3 change = vec3(mod(uTime * uTransSpeed.x, 1.0), mod(uTime * uTransSpeed.y, 1.0), mod(uTime * uTransSpeed.z, 1.0));
  
  dying.rgb = (uTransitions * change) + (uColorDying * ((uTransitions - 1.0) * -1.0));

  dying.a = 1.0;

  dying *= ((uDyingChannel - 1.0) * -1.0);
  /*
    if (uTransition) {
    dying = vec4(uColorDying.r, mod(uTime * 0.1, 1.0), uColorDying.b, 1.0) * inv;
    } else {
    dying = vec4(uColorDying.r, uColorDying.g, uColorDying.b, 1.0) * inv;
    }
  */
  vec4 live = vec4(uColorAlive.r, uColorAlive.g, uColorAlive.b, 1.0 - diff);
  vec4 dead = vec4(uColorDead.r, uColorDead.g, uColorDead.b, 1.0);
 
  vec2 position = (gl_FragCoord.xy / targetResolution.xy);
  vec2 pixel = 1.0 / targetResolution;
  
  if (uClear) {
    gl_FragColor = dead;
    return;
  }
  
  if (length(position - (uMouse / canvasResolution)) < 0.01) {

    float rnd1 = mod(fract(sin(dot(position + uTime * 0.001, vec2(14.9898,78.233))) * 43758.5453), 1.0);
    
    if (rnd1 > 0.5) {
      gl_FragColor = live;
    } else {
      gl_FragColor = dying;
    }

  } else {

    float sum = 0.0;

    float v = 0.0;
    
    for (int x = -2; x < 3; x++) {
      for (int y = -2; y < 3; y++) {
        v = texture2D(uNeighboring, 1.0 / 4.0 * vec2(x + 2, y + 2)).r;
        if (v > 0.0) {
          sum += 1.0 - texture2D(uSample0, position + pixel * vec2(x, y)).a;
        }
      }
    }
    
    vec4 me = texture2D(uSample0, position);
    
    if (me.r < 0.1 && me.g < 0.1 && me.b < 0.1 && me.a < 0.1) {

      gl_FragColor = dead;

    } else if (me.a < 1.0) {
      // between 2 and 3, the cell keep living
      //if ((sum >= 0.15) && (sum <= 0.35)) {
      if ((sum >= (diff * uAliveMin) - (diff * 0.5)) && (sum <= (diff * uAliveMax) + (diff * 0.5))) { 
        gl_FragColor = live;
      } else  {
        gl_FragColor = dying;
      }
    } else {
      if ((sum >= (diff * uDeadMin) - (diff * 0.5)) && (sum <= (diff * uDeadMax) + (diff * 0.5))) { 
        gl_FragColor = live;
      } else if (length(me * uDyingChannel) < 0.85) {
        //gl_FragColor = vec4(min(me.r + 0.004, 0.85), min(me.g + 0.004, 0.85),  min(me.b + 0.004, 0.85), 1.0);
        gl_FragColor = me + (uDyingChannel * 0.004);
      } else {
        gl_FragColor = uLoop ? live : me;
      }
    }
  }

}
