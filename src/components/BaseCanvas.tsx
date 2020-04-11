import * as React from 'react';
import { UniformSettings, Vector2, MESH_TYPE } from '../../types';
import { assignUniforms } from '../../lib/gl/initialize';
import { BASE_TRIANGLE_MESH } from '../../lib/gl/settings';
import { useInitializeGL } from '../hooks/gl';
import { useAnimationFrame } from '../hooks/animation';
import { useWindowSize } from '../hooks/resize';
import { useMouse } from '../hooks/mouse';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSettings>;
	setAttributes: (attributes: any[]) => void;
	textureSource?: string;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	texture?: HTMLImageElement;
}

const render = ({ gl, uniformLocations, uniforms, time, mousePos }: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current.uResolution.value.x,
		y: uniforms.current.uResolution.value.y,
	});
	const initialMousePosition = uniforms.current.uMouse ? uniforms.current.uMouse.defaultValue : { x: 0.5, y: 0.5 };
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: size.current.x * initialMousePosition.x,
		y: size.current.y * -initialMousePosition.y,
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		meshType: MESH_TYPE.BASE_TRIANGLES,
	});

	React.useEffect(() => {
		setAttributes([{ name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ') }]);
	}, []);

	useWindowSize(canvasRef, gl, uniforms.current, size);
	useMouse(mousePosRef, canvasRef);

	console.log('render');

	useAnimationFrame(canvasRef, (time: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
		});
	});

	return <canvas ref={canvasRef} role='img' />;
};

export default BaseCanvas;
