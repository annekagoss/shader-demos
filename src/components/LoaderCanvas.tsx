import * as React from 'react';
import { UniformSetting, Vector2, Matrix, Vector3, Mesh, Buffers, MESH_TYPE, Buffer, OBJData, FBO } from '../../types';
import { initializeGL } from '../hooks/gl';
import { useAnimationFrame } from '../hooks/animation';
import { useWindowSize } from '../hooks/resize';
import { assignProjectionMatrix, assignUniforms } from '../../lib/gl/initialize';
import { createMat4, applyTransformation, invertMatrix, transposeMatrix } from '../../lib/gl/matrix';
import { addVectors } from '../../lib/gl/math';
import { useOBJLoaderWebWorker } from '../hooks/webWorker';
import { formatAttributes, isSafari } from '../utils/general';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
	OBJData: OBJData;
	rotationDelta: Vector3;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSetting[];
	time: number;
	size: Vector2;
	rotation: Vector3;
	buffers: Buffers;
	outlineProgram: WebGLProgram;
	program: WebGLProgram;
	outlineUniformLocations: Record<string, WebGLUniformLocation>;
	baseVertexBuffer: Buffer;
	FBOA: React.MutableRefObject<FBO>;
	FBOB: React.MutableRefObject<FBO>;
	pingPong: number;
}

const IS_SAFARI: boolean = isSafari();
const IS_MOBILE: boolean = Boolean('ontouchstart' in window);
const ENABLE_FRAMEBUFFER: boolean = !IS_SAFARI && !IS_MOBILE;
const ENABLE_WEBWORKER: boolean = !IS_SAFARI && !IS_MOBILE;

const render = (props: RenderProps) => {
	if (!props.gl) return;
	const { gl, size, uniforms, uniformLocations, outlineUniformLocations, program, outlineProgram, FBOA, FBOB } = props;

	if (!ENABLE_FRAMEBUFFER || parseInt(uniforms.find(uniform => uniform.name === 'uMaterialType').value) !== 2) {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.useProgram(program);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		draw(props);
		return;
	}

	gl.activeTexture(gl.TEXTURE4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOA.current.buffer);
	gl.viewport(0, 0, FBOA.current.textureWidth, FBOA.current.textureHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(program);
	gl.uniform1i(uniformLocations.uOutlinePass, 1);
	draw(props);

	gl.activeTexture(gl.TEXTURE5);
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOB.current.buffer);
	gl.uniform1i(uniformLocations.uOutlinePass, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	draw(props);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, size.x, size.y);
	gl.useProgram(outlineProgram);

	gl.activeTexture(gl.TEXTURE4);
	gl.bindTexture(gl.TEXTURE_2D, FBOA.current.targetTexture);
	gl.uniform1i(outlineUniformLocations.uOutline, 4);

	gl.activeTexture(gl.TEXTURE5);
	gl.bindTexture(gl.TEXTURE_2D, FBOB.current.targetTexture);
	gl.uniform1i(outlineUniformLocations.uSource, 5);

	gl.uniform2fv(outlineUniformLocations.uResolution, [size.x, size.y]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	drawOutlines(props);
};

const drawOutlines = ({ gl, outlineProgram, program, baseVertexBuffer, buffers }: RenderProps) => {
	const vertexPosition = gl.getAttribLocation(outlineProgram, 'aBaseVertexPosition');
	gl.enableVertexAttribArray(vertexPosition);
	gl.bindBuffer(gl.ARRAY_BUFFER, baseVertexBuffer.buffer);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(vertexPosition);
};

const draw = ({ gl, uniformLocations, uniforms, buffers, time, size, rotation, outlineProgram, program }: RenderProps): void => {
	assignProjectionMatrix(gl, uniformLocations, size);
	const modelViewMatrix: Matrix = applyTransformation(createMat4(), {
		translation: uniforms.find(uniform => uniform.name === 'uTranslation').value,
		rotation: {
			x: Math.sin(time * 0.0005) * 0.25,
			y: rotation.y,
			z: rotation.z
		},
		scale: uniforms.find(uniform => uniform.name === 'uScale').value
	});
	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, modelViewMatrix);
	let normalMatrix: Float32Array = invertMatrix(modelViewMatrix);
	normalMatrix = transposeMatrix(normalMatrix);
	gl.uniformMatrix4fv(uniformLocations.uNormalMatrix, false, normalMatrix);
	assignUniforms(uniforms, uniformLocations, gl, time);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.barycentricBuffer.buffer);
	const barycentricLocation = gl.getAttribLocation(program, 'aBarycentric');
	gl.vertexAttribPointer(barycentricLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(barycentricLocation);

	const vertexCount: number = buffers.indexBuffer.numItems;
	const indexType: number = gl.UNSIGNED_SHORT;
	const indexOffset: number = 0;
	gl.drawElements(gl.TRIANGLES, vertexCount, indexType, indexOffset);
};

const LoaderCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes, OBJData, rotationDelta }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current[0].value.x * window.devicePixelRatio,
		y: uniforms.current[0].value.y * window.devicePixelRatio
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();
	const buffersRef: React.MutableRefObject<Buffers> = React.useRef<Buffers>({
		vertexBuffer: null,
		normalBuffer: null,
		indexBuffer: null,
		textureBuffer: null,
		textureAddressBuffer: null,
		barycentricBuffer: null
	});
	const rotationRef: React.MutableRefObject<Vector3> = React.useRef<Vector3>({ x: 0, y: 0, z: 0 });
	const meshRef: React.MutableRefObject<Mesh> = React.useRef<Mesh>();
	// Toon outline pass
	const programRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const outlineProgramRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const outlineUniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();
	const baseVertexBufferRef: React.MutableRefObject<Buffer> = React.useRef<Buffer>();
	const FBOA: React.MutableRefObject<FBO> = React.useRef();
	const FBOB: React.MutableRefObject<FBO> = React.useRef();

	useOBJLoaderWebWorker({
		onLoadHandler: message => {
			meshRef.current = message;
			initializeGL({
				gl,
				uniformLocations,
				canvasRef,
				buffersRef: buffersRef,
				fragmentSource: fragmentShader,
				vertexSource: vertexShader,
				uniforms: uniforms.current,
				size,
				mesh: meshRef.current,
				meshType: MESH_TYPE.OBJ,
				outlineProgramRef,
				programRef,
				outlineUniformLocations,
				baseVertexBufferRef,
				FBOA,
				FBOB
			});
			setAttributes(formatAttributes(buffersRef));
		},
		OBJData,
		useWebWorker: ENABLE_WEBWORKER
	});

	useWindowSize(canvasRef, gl, uniforms.current, size);

	useAnimationFrame(canvasRef, (time: number, pingPong: number) => {
		rotationRef.current = addVectors(rotationRef.current, rotationDelta);
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			size: size.current,
			rotation: rotationRef.current,
			buffers: buffersRef.current,
			outlineProgram: outlineProgramRef.current,
			program: programRef.current,
			outlineUniformLocations: outlineUniformLocations.current,
			baseVertexBuffer: baseVertexBufferRef.current,
			FBOA,
			FBOB,
			pingPong
		});
	});

	return <canvas ref={canvasRef} width={size.current.x} height={size.current.y} />;
};

export default LoaderCanvas;
