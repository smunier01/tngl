precision mediump float;

#define PI 3.1415926535897932384626433832795

uniform sampler2D uSample0;
uniform sampler2D uDepthMap;

uniform vec3 uLightPosition;
varying vec2 vUv;
varying vec4 vWorldPosition;

// light uniforms
uniform mat4 uLightMVMatrix;
uniform mat4 uLightPMatrix;

float linstep(float low, float high, float v){
    return clamp((v-low)/(high-low), 0.0, 1.0);
}

float VSM(sampler2D depths, vec2 uv, float compare){
    vec2 moments = texture2D(depths, uv).xy;
    float p = smoothstep(compare-0.02, compare, moments.x);
    float variance = max(moments.y - moments.x*moments.x, -0.001);
    float d = compare - moments.x;
    float p_max = linstep(0.2, 1.0, variance / (variance + d*d));
    return clamp(max(p, p_max), 0.0, 1.0);
}


/*
float linstep(float low, float high, float v){
  return clamp((v-low)/(high-low), 0.0, 1.0);
}
*/
/*
float VSM(sampler2D depths, vec2 uv, float compare){
  vec2 moments = texture2D(depths, uv).xy;
  float p = smoothstep(compare-0.02, compare, moments.x);
  float variance = max(moments.y - moments.x*moments.x, -0.001);
  float d = compare - moments.x;
  float p_max = linstep(0.2, 1.0, variance / (variance + d*d));
  return clamp(max(p, p_max), 0.0, 1.0);
}
*/
float attenuation(vec3 dir){
  float dist = length(dir);
  float radiance = 1.0/(1.0+pow(dist/10.0, 2.0));
  return clamp(radiance*10.0, 0.0, 1.0);
}
        
float influence(vec3 normal, float coneAngle){
  float minConeAngle = ((360.0-coneAngle-10.0)/360.0)*PI;
  float maxConeAngle = ((360.0-coneAngle)/360.0)*PI;
  return smoothstep(minConeAngle, maxConeAngle, acos(normal.z));
}

float influence2(vec3 pos, float maxi, vec3 normal, float coneAngle){
  float dist = length(pos);
  float minConeAngle = ((360.0-coneAngle-10.0)/360.0)*PI;
  float maxConeAngle = ((360.0-coneAngle)/360.0)*PI;
  return smoothstep(minConeAngle, maxConeAngle, acos(normal.z)) * (1.0 - pow((dist / maxi), 2.0));
}

float lambert(vec3 surfaceNormal, vec3 lightDirNormal){
  return max(0.0, dot(surfaceNormal, lightDirNormal));
}
        
vec3 skyLight(vec3 normal){
  return vec3(smoothstep(0.0, PI, PI-acos(normal.y)))*0.4;
}
vec3 gamma(vec3 color){
  return pow(color, vec3(2.2));
}


uniform float uLightNearPlane;
uniform float uLightFarPlane;

varying vec4 vLightPosition;

float LinearDepthConstant = (1.0 / (uLightFarPlane - uLightNearPlane));

void main () {

  mat3 lightRot = mat3(uLightMVMatrix);
  vec3 worldNormal = vec3(0.0, 1.0, 0.0);
  vec3 lightPosition = (uLightMVMatrix * vWorldPosition).xyz;
  vec3 lightPosNormal = normalize(lightPosition);
  vec3 lightSurfaceNormal = lightRot * worldNormal;
  vec4 lightDevice = uLightPMatrix * vec4(lightPosition, 1.0);
  vec2 lightDeviceNormal = lightDevice.xy / lightDevice.w;
  vec2 lightUV = lightDeviceNormal * 0.5 + 0.5;

  float lightDepth = clamp((length(lightPosition) - uLightNearPlane) * LinearDepthConstant, 0.0, 1.0);

  float shadow1 = VSM(uDepthMap, lightUV, lightDepth);
  
  vec2 moments = texture2D(uDepthMap, lightUV).xy;
  // 
  /*
  vec3 depth = vLightPosition.xyz / vLightPosition.w;
  float f = clamp((length(vLightPosition2) - Near) * LinearDepthConstant, 0.0, 1.0);
  float v = (vLightPosition.z - Near) * LinearDepthConstant;
  float h = (vLightPosition2.z - Near) * LinearDepthConstant;
  
  float shadow1 = VSM(uDepthMap, depth.xy, f);
  vec4 colora = texture2D(uDepthMap, depth.xy);
  */
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

  //float attenuation = length(lightPosition) / uLightFarPlane;


  vec3 excident = (
                   skyLight(worldNormal) + 
                   lambert(lightSurfaceNormal, -lightPosNormal) *
                   influence(lightPosNormal, 55.0) *
                   attenuation(lightPosition) *
                   shadow1
                   );
  
  vec2 tt = vLightPosition.xy / max(0.0, vLightPosition.w);
  float x = tt.x;
  float y = tt.y;
  /*
  float t1 = smoothstep(0.9, 1.0, 1.0 - lightUV.x);
  float t2 = smoothstep(0.9, 1.0, lightUV.x);    
  float t3 = smoothstep(0.9, 1.0, 1.0 - lightUV.y);
  float t4 = smoothstep(0.9, 1.0, lightUV.y);

  float t = max(t1 + t2, t3 + t4);
  */
  float t = float(x > 0.0 && x < 1.0 && y > 0.0 && y < 1.0);

  // a = 0 & b = 1 --> 0
  // a = 1 & b = 1 --> 1
  // a = 0 & b = 0 --> 1
  // a = 1 & b = 0 --> 1

  
  
  vec3 textureColor = texture2D(uSample0, vUv * 64.0).rgb;
  float lightContrib = (min(shadow1 - t, 0.0) + 1.0);
  gl_FragColor = vec4(textureColor * vec3(influence2(lightPosition, 50.0, lightPosNormal, 45.0) * shadow1), 1.0);
  //gl_FragColor = vec4(vec3(textureColor * lightContrib), 1.0);
  //gl_FragColor = vec4(moments.xx, (length(lightPosition)) > uLightFarPlane, 1.0);
  //gl_FragColor = vec4(texture2D(uSample0, vUv * 64.0).rgb * (shadow1 - attenuation), 1.0);
  //gl_FragColor = vec4(texture2D(uDepthMap, depth.xy).rgb, 1.0);
}
