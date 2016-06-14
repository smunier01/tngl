#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float uLightNearPlane;
uniform float uLightFarPlane;
float LinearDepthConstant = 1.0 / (uLightFarPlane - uLightNearPlane);

varying vec3 vVertexPosition;

void main() {

  float depth = clamp((length(vVertexPosition) - uLightNearPlane) * LinearDepthConstant, 0.0, 1.0);
  
  float dx = dFdx(depth);
  float dy = dFdy(depth);

  gl_FragColor = vec4(depth, pow(depth, 2.0) + 0.25*(dx*dx + dy*dy), 0.0, 1.0);
}
