import * as React from 'react';
import { UniformSettings, Vector2, MESH_TYPE } from '../../../types';
import { assignUniforms } from '../../../lib/gl/initialize';
import { BASE_TRIANGLE_MESH } from '../../../lib/gl/settings';
import { useInitializeGL } from '../../hooks/gl';
import { useAnimationFrame } from '../../hooks/animation';
import { useWindowSize } from '../../hooks/resize';
import { useMouse } from '../../hooks/mouse';
import { updateTransitionProgress } from '../../utils/transition';
import styles from './TransitionCanvas.module.scss';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSettings>;
	setAttributes: (attributes: any[]) => void;
	slideImages: Record<string, string>;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSettings;
	time: number;
	mousePos: Vector2;
	texture?: HTMLImageElement;
	transitionProgress: number;
}

const render = ({ gl, uniformLocations, uniforms, time, mousePos, texture, transitionProgress }: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos, transitionProgress);

	gl.activeTexture(gl.TEXTURE0);

	if (texture) {
		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(uniformLocations.uBackground, 0);
	}

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes, slideImages }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: window.innerWidth * window.devicePixelRatio,
		y: window.innerHeight * window.devicePixelRatio * 0.75
	});
	uniforms.current.uResolution.value = size.current;
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: size.current.x * 0.5,
		y: size.current.y * -0.5
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();

	const forwardButtonRef: React.RefObject<HTMLButtonElement> = React.useRef<HTMLButtonElement>();
	const backButtonRef: React.RefObject<HTMLButtonElement> = React.useRef<HTMLButtonElement>();
	const transitionTimeRef: React.MutableRefObject<number> = React.useRef<number>(0);
	const transitionDirectionRef: React.MutableRefObject<number> = React.useRef<number>(1);
	const slideIndexRef: React.MutableRefObject<number> = React.useRef<number>(0);
	const isTransitioningRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const transitionProgressRef: React.MutableRefObject<number> = React.useRef<number>(0);

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		meshType: MESH_TYPE.BASE_TRIANGLES,
		imageTextures: slideImages
	});

	React.useEffect(() => {
		setAttributes([{ name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ') }]);
	}, []);

	useWindowSize(canvasRef, gl, uniforms.current, size);
	useMouse(mousePosRef, canvasRef);

	useAnimationFrame(canvasRef, (time: number) => {
		updateTransitionProgress(transitionTimeRef, slideIndexRef, isTransitioningRef, transitionProgressRef, transitionDirectionRef);
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			transitionProgress: transitionProgressRef.current
		});
	});

	return (
		<div className={styles.canvasContainer}>
			<canvas ref={canvasRef} width={size.current.x} height={size.current.y} className={styles.fullScreenCanvas} />
			<div className={styles.canvasForeground}>
				<button
					className={styles.button}
					onClick={() => {
						isTransitioningRef.current = true;
						transitionDirectionRef.current = -1;
					}}>
					{'<'}
				</button>
				<button
					className={styles.button}
					onClick={() => {
						isTransitioningRef.current = true;
						transitionDirectionRef.current = 1;
					}}>
					{'>'}
				</button>
			</div>
		</div>
	);
};

export default BaseCanvas;
