const fragment = /* GLSL */ `
precision highp float;

varying vec2 vUv;
varying vec2 vPUv;

varying vec4 rgba;

void main() {

  gl_FragColor = rgba;
}`

const vertex = /* GLSL */ `
precision highp float;
const float PI = 3.1415926535897932384626433832795;

attribute vec3 offset; 
attribute float index;
attribute vec3 color;

varying vec2 vUv;
varying vec2 vPUv;

varying vec4 rgba;

uniform float uTime;
uniform float uSize;

uniform vec2 uTextureSize;

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float random(float n) {
	return fract(sin(n) * 43758.5453123);
}

// https://github.com/mattdesl/glsl-random/blob/master/lowp.glsl
highp float random2D(vec2 co) {
  return fract(sin(dot(co.xy,vec2(12.9898,78.233))) * 43758.5453);
}

// https://github.com/mattatz/ShibuyaCrowd/blob/master/source/shaders/common/quaternion.glsl
vec3 random_point_on_plane(vec2 uv) {
  float u = random2D(uv) * 2.0 - 1.0;
  float theta = random2D(uv + 0.333) * PI * 2.0;
  float u2 = sqrt(1.0 - u * u);
  return vec3(u2 * cos(theta), u2 * sin(theta), u);
}

void main() {
    vec2 puv = (offset.xy / uTextureSize); // calculating how the texture should be applied onto each particle
	  vUv = uv; // the uv coordinates  of the particle
    vPUv = puv;
    
    vec3 displaced = offset;
    displaced.xy -= uTextureSize * 0.5;

    // float rndz = random(index) + snoise(vec2(index * 0.1, uTime * 0.1));
    // displaced.z += uSize * (random(index) * 2.0 * (sin(index) + 5.0));
    // displaced.xy += psize * vec2(random(index) - 0.5, random(offset.x + index) - 0.5);

    float psize = sqrt(snoise(vec2(uTime * 0.5, index)) * (log(uTextureSize.x) * 1.2) );
    psize = max(psize * uSize, 0.0);

    displaced += random_point_on_plane(puv) * psize; 

    rgba = vec4(color, 1.0);

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
	  mvPosition.xyz += position;
	  vec4 finalPosition = projectionMatrix * mvPosition;

    gl_Position = finalPosition;
}`

export { vertex, fragment }