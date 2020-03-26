import * as React from 'react';
import { InitializeProps, initializeRenderer, initializeMesh, bindMaterials } from '../../lib/gl/initialize';
import { loadMaterialTextures, loadImageTextures } from '../../lib/gl/textureLoader';
import { Materials, Texture } from '../../types';

export const useInitializeGL = (props: InitializeProps) => {
	React.useEffect(() => {
		initializeGL(props);
	}, []);
};

export const initializeGL = (props: InitializeProps) => {
	if (props.canvasRef.current === undefined) return;
	const { gl, program, outlineProgram } = initializeRenderer(props);

	const shouldLoadImageTextures: boolean = props.imageTextures && props.imageTextures !== {};
	const shouldLoadMaterialTextures: boolean = props.mesh && props.mesh.materials && props.mesh.materials !== {};

	if (shouldLoadImageTextures) {
		loadImageTextures(gl, props.imageTextures).then((loadedTextures: WebGLTexture) => {
			console.log({ loadedTextures });
			initializeMeshAndProgram(props, gl, program, outlineProgram);
		});
		return;
	}

	if (shouldLoadMaterialTextures) {
		loadMaterialTextures(gl, props.mesh.materials).then((loadedMaterials: Materials): void => {
			props.mesh.materials = loadedMaterials;
			bindMaterials(gl, props.uniformLocations, props.mesh.materials);
			initializeMeshAndProgram(props, gl, program, outlineProgram);
		});
		return;
	}

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
