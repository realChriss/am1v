export const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`

export const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_seed;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash2(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 2; i++) {
    v += a * noise(p + u_seed);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

float rainLayer(vec2 uv, float t, float cols, float speed, float len, float lean, float density) {
  vec2 p = vec2(uv.x * cols + uv.y * lean, uv.y);
  float id = floor(p.x);
  vec2 r = hash2(vec2(id, 3.7));
  if (hash(vec2(id, 11.3)) > density) return 0.0;

  float fall = p.y * (1.7 + 1.1 * hash(vec2(id, 5.1)))
             + t * speed * (0.7 + r.x) + r.y;
  float cycle = floor(fall);
  float y = fract(fall);

  vec2 q = hash2(vec2(id, cycle));
  float x = fract(p.x) - 0.5 + (q.x - 0.5) * 0.82;
  float streak = smoothstep(len * (0.65 + 0.80 * q.y), 0.0, y)
               * smoothstep(0.075, 0.0, abs(x));
  return streak * (0.25 + 0.75 * q.y);
}

void main() {
  vec2 res = max(u_res, vec2(1.0));
  vec2 uv = (gl_FragCoord.xy - 0.5 * res) / res.y;
  vec2 o = uv + u_seed;
  float t = u_time;

  float rain = rainLayer(o,         t, 13.0, 3.60, 0.45, 1.6, 0.55) * 0.46
             + rainLayer(o +  7.0,  t, 21.0, 2.60, 0.36, 1.9, 0.46) * 0.26
             + rainLayer(o + 19.0,  t, 33.0, 1.85, 0.28, 2.2, 0.40) * 0.15;

  float haze = fbm(uv * 0.9 + vec2(0.0, t * 0.02)) * 0.058;
  float col = 0.018 + haze + rain;

  float d = length(uv * vec2(1.0, 1.25));
  col *= mix(0.52, 1.0, smoothstep(0.1, 1.1, d));
  col *= 1.0 - 0.42 * smoothstep(0.75, 1.7, d);

  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.011;

  gl_FragColor = vec4(vec3(max(col, 0.0)), 1.0);
}
`
