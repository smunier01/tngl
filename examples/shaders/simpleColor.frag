precision mediump float;

uniform vec4 uColor;

varying vec3 vNormal;

void main () {

  vec3 lightPosition = normalize(vec3(0.5, 0.5, 0.0));
  
  gl_FragColor = vec4(uColor.rgb * max(0.2, dot(lightPosition, vNormal)), uColor.a);
}
