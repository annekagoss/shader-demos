import * as React from 'react';
import { InitializeProps, initializeRenderer, initializeMesh } from '../../lib/gl/initialize';
import { loadTextures } from '../../lib/gl/textureLoader';
import { Texture } from '../../types';

export const useInitializeGL = (props: InitializeProps) => {
	React.useEffect(() => {
		initializeGL(props);
	}, []);
};

export const initializeGL = async (props: InitializeProps) => {
	if (props.canvasRef.current === undefined) return;
	const { gl, program, outlineProgram } = initializeRenderer(props);

	if (!(props.imageTextures || (props.mesh && props.mesh.materials))) {
		initializeMeshAndProgram(props, gl, program, outlineProgram);
		return;
	}
	const loadedTextures: void | Record<string, Texture> = await loadTextures(gl, props.uniformLocations.current, props.imageTextures, props.mesh && props.mesh.materials);
	console.log({ loadedTextures });
	props.texturesRef.current = loadedTextures && Object.values(loadedTextures).map(({ texture }) => texture);
	initializeMeshAndProgram(props, gl, program, outlineProgram);
};

const initializeMeshAndProgram = (props: InitializeProps, gl: WebGLRenderingContext, program: WebGLProgram, outlineProgram: WebGLProgram) => {
	initializeMesh(props, gl, program, outlineProgram);
	props.gl.current = gl;
	if (props.programRef) {
		props.programRef.current = program;
	}
	if (props.outlineProgramRef) {
		props.outlineProgramRef.current = outlineProgram;
	}
};
