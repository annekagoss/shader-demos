float noise(vec2 n, float x) {
  n += x;
  return fract(sin(dot(n.xy, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
}

float noisePass(vec2 uv, float n) {
  float a = 1.0;
  float b = 2.0;
  float c = -12.0;
  float t = 1.0;

  return (1.0 / (a * 4.0 + b * 4.0 - c)) *
         (noise(uv + vec2(-1.0, -1.0) * t, n) * a +
          noise(uv + vec2(0.0, -1.0) * t, n) * b +
          noise(uv + vec2(1.0, -1.0) * t, n) * a +
          noise(uv + vec2(-1.0, 0.0) * t, n) * b +
          noise(uv + vec2(0.0, 0.0) * t, n) * c +
          noise(uv + vec2(1.0, 0.0) * t, n) * b +
          noise(uv + vec2(-1.0, 1.0) * t, n) * a +
          noise(uv + vec2(0.0, 1.0) * t, n) * b +
          noise(uv + vec2(1.0, 1.0) * t, n) * a);
}

float createDither(vec2 uv, float n) {
  float a = 1.0;
  float b = 2.0;
  float c = -2.0;
  float t = 1.0;

  return (4.0 / (a * 4.0 + b * 4.0 - c)) *
         (noisePass(uv + vec2(-1.0, -1.0) * t, n) * a +
          noisePass(uv + vec2(0.0, -1.0) * t, n) * b +
          noisePass(uv + vec2(1.0, -1.0) * t, n) * a +
          noisePass(uv + vec2(-1.0, 0.0) * t, n) * b +
          noisePass(uv + vec2(0.0, 0.0) * t, n) * c +
          noisePass(uv + vec2(1.0, 0.0) * t, n) * b +
          noisePass(uv + vec2(-1.0, 1.0) * t, n) * a +
          noisePass(uv + vec2(0.0, 1.0) * t, n) * b +
          noisePass(uv + vec2(1.0, 1.0) * t, n) * a);
}

vec3 dither(vec2 uv, vec3 color, float steps) {
  float ditherValue = createDither(uv, 0.0);
  return floor(0.5 + color * steps - 0.5 + ditherValue) * (1.0 / (steps - 1.0));
}

// clang-format off
#pragma glslify: export(dither)
// clang-format on