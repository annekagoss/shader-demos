import * as React from 'react';
import cx from 'classnames';
import { UniformSettings, Vector2, MESH_TYPE } from '../../../types';
import { assignUniforms, InitializeProps } from '../../../lib/gl/initialize';
import { BASE_TRIANGLE_MESH } from '../../../lib/gl/settings';
import { useInitializeGL } from '../../hooks/gl';
import { useAnimationFrame } from '../../hooks/animation';
import { useWindowSize } from '../../hooks/resize';
import { useMouse } from '../../hooks/mouse';
import styles from './DOMRasterizationCanvas.module.scss';
import { useRasterizeToGL } from '../../hooks/rasterize';

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

const render = ({ gl, uniformLocations, uniforms, time, mousePos, texture }: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.activeTexture(gl.TEXTURE0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const DOMRasterizatioCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const sourceElementRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>();
	const targetElementRef: React.RefObject<HTMLImageElement> = React.useRef<HTMLImageElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current.uResolution.value.x * window.devicePixelRatio,
		y: uniforms.current.uResolution.value.y * window.devicePixelRatio
	});
	const initialMousePosition = uniforms.current.uMouse ? uniforms.current.uMouse.defaultValue : { x: 0.5, y: 0.5 };
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({ x: size.current.x * initialMousePosition.x, y: size.current.y * -initialMousePosition.y });
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const imageTexturesRef: React.MutableRefObject<Record<string, string>> = React.useRef<Record<string, string>>({});
	const texturesRef: React.MutableRefObject<WebGLTexture[]> = React.useRef<WebGLTexture[]>([]);

	const buttonRef: React.RefObject<HTMLButtonElement> = React.useRef<HTMLButtonElement>();
	const [text, setText] = React.useState<string>('');

	const initializeGLProps: InitializeProps = {
		gl,
		uniformLocations,
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		meshType: MESH_TYPE.BASE_TRIANGLES,
		imageTextures: imageTexturesRef.current,
		texturesRef
	};
	useRasterizeToGL({ sourceElementRef, targetElementRef, imageTexturesRef, initializeGLProps });

	React.useEffect(() => {
		setAttributes([{ name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ') }]);
	}, []);

	useWindowSize(canvasRef, gl, uniforms.current, size);
	useMouse(mousePosRef, canvasRef);

	useAnimationFrame(canvasRef, (time: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current
		});
	});

	return (
		<div className={styles.canvasContainer}>
			<canvas ref={canvasRef} className={styles.fullScreenCanvas} />
			<div
				className={cx(styles.canvasForeground, styles.sourceElement)}
				ref={sourceElementRef}
				style={{
					position: 'absolute',
					right: 0,
					left: 0,
					bottom: 0,
					top: 0,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					margin: 0,
					padding: 0
				}}>
				<div
					style={{
						padding: 0,
						margin: 0
					}}>
					<div
						style={{
							marginBottom: 80,
							fontSize: 40,
							color: 'white',
							lineHeight: 1,
							fontFamily: 'Roboto, sans-serif',
							fontWeight: 'bold',
							letterSpacing: 1
						}}>
						type a color
					</div>
					<form style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
						<input
							type='text'
							style={{
								width: 200,
								backgroundColor: 'transparent',
								border: 'solid 1px transparent',
								borderBottom: 'solid 1px white',
								color: 'white',
								fontSize: 40,
								minWidth: 500,
								padding: '4px 4px 1px 4px',
								fontFamily: 'Roboto, sans-serif',
								lineHeight: 1,
								fontWeight: 'bold',
								marginBottom: 40,
								letterSpacing: 1
							}}
							value={text}
							onChange={e => setText(e.target.value)}
						/>
						<button
							ref={buttonRef}
							style={{
								background: 'transparent',
								border: 'solid 1px white',
								color: 'white',
								fontSize: 28,
								fontFamily: 'Roboto, sans-serif',
								lineHeight: 1,
								fontWeight: 'bold',
								padding: '10px 20px',
								letterSpacing: 1
							}}
							type='button'
							onClick={() => setText('')}
							onMouseEnter={() => {
								buttonRef.current.style.background = 'white';
								buttonRef.current.style.color = 'rgb(0, 0, 255)';
							}}
							onMouseLeave={() => {
								buttonRef.current.style.background = 'transparent';
								buttonRef.current.style.color = 'white';
							}}>
							{' '}
							clear
						</button>
					</form>
				</div>
			</div>
			{/* <img ref={targetElementRef} /> */}
		</div>
	);
};

export default DOMRasterizatioCanvas;
