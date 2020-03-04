precision mediump float;

attribute vec4 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec3 aBarycentric;

uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uLightPositionA;
uniform vec3 uLightPositionB;
uniform vec3 uLightColorA;
uniform vec3 uLightColorB;

uniform float uSpecular;

varying vec3 vLighting;
varying float vSpecular;
varying vec3 vBarycentric;

const vec3 eye = vec3(0, 0, 6); // TODO pass in camera position as uniform

#pragma glslify: calculateLighting = require('./common/lighting.glsl');
#pragma glslify: calculateSpecular = require('./common/specular.glsl');

void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
	vec3 lighting = calculateLighting(
		uModelViewMatrix,
		aVertexNormal,
		uLightPositionA,
		uLightPositionB,
		uLightColorA,
		uLightColorB
	);
	float specular = calculateSpecular(
		uNormalMatrix,
		aVertexNormal,
		lighting,
		eye,
		uSpecular
	);
	vLighting = lighting;
	vSpecular = specular;
	vBarycentric = aBarycentric;
	//vVertexPosition = aVertexPosition.xyz * .5 + .5;
}
