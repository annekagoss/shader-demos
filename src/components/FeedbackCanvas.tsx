import * as React from 'react';
import { UniformSettings, Vector2, UNIFORM_TYPE, FBO, MESH_TYPE } from '../../types';
import { BASE_TRIANGLE_MESH } from '../../lib/gl/settings';
import { useInitializeGL } from '../hooks/gl';
import { useAnimationFrame } from '../hooks/animation';
import { assignUniforms } from '../../lib/gl/initialize';
import { useWindowSize } from '../hooks/resize';
import { useMouse } from '../hooks/mouse';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSettings>;
	setAttributes: (attributes: any[]) => void;
	pageMousePosRef?: React.MutableRefObject<Vector2>;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	FBOA: FBO;
	FBOB: FBO;
	pingPong: number;
	size: Vector2;
}

const render = ({ gl, uniformLocations, uniforms, time, mousePos, FBOA, FBOB, pingPong }: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);

	const buffer: WebGLFramebuffer = pingPong === 0 ? FBOA.buffer : FBOB.buffer;
	const targetTexture: WebGLTexture = pingPong === 0 ? FBOA.targetTexture : FBOB.targetTexture;

	// Draw to frame buffer
	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	// Draw to canvas
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	gl.uniform1i(uniformLocations.frameBufferTexture0, 0);
	gl.activeTexture(gl.TEXTURE0 + 0);

	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const FeedbackCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current.uResolution.value.x * window.devicePixelRatio,
		y: uniforms.current.uResolution.value.y * window.devicePixelRatio
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({ x: size.current.x * 0.5, y: size.current.y * -0.5 });
	const FBOA: React.MutableRefObject<FBO> = React.useRef();
	const FBOB: React.MutableRefObject<FBO> = React.useRef();

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		FBOA,
		FBOB,
		meshType: MESH_TYPE.BASE_TRIANGLES
	});

	React.useEffect(() => {
		setAttributes([{ name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ') }]);
	}, []);

	useWindowSize(canvasRef, gl, uniforms.current, size);
	useMouse(mousePosRef, canvasRef);

	useAnimationFrame(canvasRef, (time: number, pingPong: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			FBOA: FBOA.current,
			FBOB: FBOB.current,
			pingPong,
			size: size.current
		});
	});

	return <canvas ref={canvasRef} width={size.current.x} height={size.current.y} />;
};

export default FeedbackCanvas;
