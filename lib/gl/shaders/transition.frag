#ifdef GL_ES
precision mediump float;
#endif

#define blur .1

uniform vec2 uResolution;
uniform float uTransitionProgress;

float lerp(float start, float end, float t) {
  return start * (1.0 - t) + end * t;
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	float transition = st.x + lerp(-1.0 - blur, 1.0 + blur, uTransitionProgress);
	float value = smoothstep(transition - blur, transition + blur, st.y);
	gl_FragColor = vec4(vec3(value), 1.0);
}