#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform sampler2D uDiffuse0;
uniform vec2 uSamplerResolution0;
uniform float uTime;
uniform vec4 uColor;

const float SCALE=5.;
const float SPEED=.00025;

#pragma glslify:fractalNoise=require('./common/fractalNoise.glsl');

const float MAX_SHIFT_AMT=.01;
vec4 colorShift(sampler2D sampler,float shift,vec2 st){
	vec4 unshifted=texture2D(sampler,st);
	float r=texture2D(sampler,st-vec2(shift,0.)).r;
	float b=texture2D(sampler,st+vec2(shift,0.)).b;
	return vec4(r,unshifted.g,b,unshifted.a);
}

void main(){
	vec2 st=gl_FragCoord.xy/uResolution;
	st.x*=uResolution.x/uResolution.y;
	float noise=fractalNoise(st,uTime*SPEED,1,SCALE,4);
	
	vec2 imageSt=gl_FragCoord.xy/uSamplerResolution0;
	imageSt.y=(uResolution.y/uSamplerResolution0.y)-imageSt.y;
	imageSt=mix(imageSt,imageSt*noise+.2,.05);
	
	float shift=MAX_SHIFT_AMT*noise;
	vec4 image=colorShift(uDiffuse0,shift,imageSt);
	vec4 color=uColor+image;
	
	gl_FragColor=color;
}