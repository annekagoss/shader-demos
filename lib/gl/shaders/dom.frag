#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uDiffuse0;
uniform vec2 uSamplerResolution0;
uniform float uTime;
uniform vec4 uColor;

const float SCALE = 5.;
const float SPEED = .00025;
const float MAX_SHIFT_AMT = .005;

#pragma glslify:fractalNoise = require('./common/fractalNoise.glsl');

vec4 colorShift(sampler2D sampler, float shift, vec2 st, float backgroundLuminance) {
	vec4 unshifted = texture2D(sampler, st);
	
	if (backgroundLuminance > 0.5) {
		float ra = texture2D(sampler, st - vec2(shift, 0.)).a;
		float ba = texture2D(sampler, st + vec2(shift, 0.)).a;
		float a = max(max(ra, ba), unshifted.a);
		vec3 left = vec3(ra-unshifted.a, 0, unshifted.b);
		vec3 right = vec3(unshifted.r, 0, ba-unshifted.a);
		return vec4(left + right, a);
	}
	
	float r = texture2D(sampler, st - vec2(shift, 0.)).r;
	float b = texture2D(sampler, st + vec2(shift, 0.)).b;
	return vec4(r, unshifted.g, b, unshifted.a);
}

float luminance(vec4 color, vec3 background) {
	vec3 rgb = mix(background, color.rgb, color.a);
	return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
}

void main() {
	vec2 st = gl_FragCoord.xy/uResolution;
	st.x *= uResolution.x/uResolution.y;
	float noise = fractalNoise(st, uTime*SPEED, 1, SCALE, 4);
	
	vec2 imageSt = gl_FragCoord.xy/uSamplerResolution0;
	imageSt.y = (uResolution.y/uSamplerResolution0.y) - imageSt.y;
	imageSt = mix(imageSt, imageSt*noise + .2, .05);
	
	float backgroundLuminance = luminance(uColor, vec3(1.0));
	float shift = MAX_SHIFT_AMT*noise;
	vec4 image = colorShift(uDiffuse0, shift, imageSt, backgroundLuminance);
	
	if (backgroundLuminance > 0.5) {
		gl_FragColor = mix(uColor, vec4(image.rgb, 1.0), image.a);
	} else {
		gl_FragColor = uColor + image;
	}
}