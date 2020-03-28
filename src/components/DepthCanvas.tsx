import * as React from 'react';
import { UniformSettings, Vector2, Matrix, Vector3, FaceArray, MESH_TYPE, Buffers } from '../../types';
import { assignProjectionMatrix, assignUniforms } from '../../lib/gl/initialize';
import { applyRotation, createMat4 } from '../../lib/gl/matrix';
import { addVectors } from '../../lib/gl/math';
import { useInitializeGL } from '../hooks/gl';
import { useAnimationFrame } from '../hooks/animation';
import { useWindowSize, updateRendererSize } from '../hooks/resize';
import { formatAttributes } from '../utils/general';
import { useMouse } from '../hooks/mouse';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSettings>;
	setAttributes: (attributes: any[]) => void;
	pageMousePosRef?: React.MutableRefObject<Vector2>;
	faceArray: FaceArray;
	rotationDelta: Vector3;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	size: Vector2;
	numVertices: number;
	rotation: Vector3;
}

const render = ({ gl, uniformLocations, uniforms, time, mousePos, size, numVertices, rotation }: RenderProps) => {
	if (!gl) return;
	assignProjectionMatrix(gl, uniformLocations, size);
	const modelViewMatrix: Matrix = applyRotation(createMat4().slice(), rotation);
	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, modelViewMatrix);
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.drawArrays(gl.TRIANGLES, 0, numVertices);
};

const DepthCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef, faceArray, rotationDelta }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current.uResolution.value.x * window.devicePixelRatio,
		y: uniforms.current.uResolution.value.y * window.devicePixelRatio
	});
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({ x: size.current.x * 0.5, y: size.current.y * -0.5 });
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const numVertices: number = faceArray.flat().length;
	const buffersRef: React.MutableRefObject<Buffers> = React.useRef<Buffers>({
		vertexBuffer: null,
		normalBuffer: null,
		indexBuffer: null,
		textureBuffer: null,
		textureAddressBuffer: null,
		barycentricBuffer: null
	});
	const rotationRef: React.MutableRefObject<Vector3> = React.useRef<Vector3>({ x: 0, y: 0, z: 0 });

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		buffersRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		faceArray,
		meshType: MESH_TYPE.FACE_ARRAY
	});

	React.useEffect(() => {
		setAttributes(formatAttributes(buffersRef));
	}, []);

	useWindowSize(canvasRef, gl, uniforms.current, size);
	useMouse(mousePosRef, canvasRef);

	useAnimationFrame(canvasRef, (time: number) => {
		rotationRef.current = addVectors(rotationRef.current, rotationDelta);
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			size: size.current,
			numVertices,
			rotation: rotationRef.current
		});
	});

	return <canvas ref={canvasRef} />;
};

export default DepthCanvas;
