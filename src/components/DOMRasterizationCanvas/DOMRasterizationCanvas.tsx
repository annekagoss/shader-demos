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
import { stringify } from 'querystring';

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

interface SourceElementProps {
	isCursorCopy?: boolean;
	text: string;
	setText: (val: string) => void;
	buttonActive: boolean;
	setButtonActive: (val: boolean) => void;
}

const SourceElement = React.forwardRef(({ buttonActive, setButtonActive, text, setText, isCursorCopy = false }: SourceElementProps, ref: React.RefObject<HTMLDivElement>) => {
	const buttonRef: React.RefObject<HTMLButtonElement> = React.useRef<HTMLButtonElement>();
	const textColor: string = isCursorCopy ? 'transparent' : 'white';
	const buttonBorder: string = isCursorCopy ? 'solid 1px transparent' : 'solid 1px white';
	const hoverButtonColor: string = isCursorCopy ? 'transparent' : 'rgb(0, 0, 255)';
	const buttonColor: string = buttonActive ? hoverButtonColor : textColor;
	const buttonBackground: string = buttonActive ? textColor : 'transparent';

	return (
		<div
			className={cx(styles.canvasForeground, styles.sourceElement, isCursorCopy && styles.cursorCopy)}
			ref={ref}
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
						color: textColor,
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
							borderBottom: buttonBorder,
							color: textColor,
							caretColor: 'white',
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
						onChange={e => {
							if (!isCursorCopy) return;
							setText(e.target.value);
						}}
					/>
					<button
						ref={buttonRef}
						style={{
							background: buttonBackground,
							border: buttonBorder,
							color: buttonColor,
							fontSize: 28,
							fontFamily: 'Roboto, sans-serif',
							lineHeight: 1,
							fontWeight: 'bold',
							padding: '10px 20px',
							letterSpacing: 1
						}}
						type='button'
						onClick={() => setText('')}
						onMouseEnter={() => setButtonActive(true)}
						onMouseLeave={() => setButtonActive(false)}>
						{' '}
						clear
					</button>
				</form>
			</div>
		</div>
	);
});

const Source = React.forwardRef((props, ref) => {
	const { sourceRef, cursorRef }: Record<string, React.RefObject<HTMLDivElement>> = ref;
	const [text, setText] = React.useState<string>('');
	const [buttonActive, setButtonActive] = React.useState<boolean>(false);
	return (
		<>
			<SourceElement ref={sourceRef} text={text} setText={setText} buttonActive={buttonActive} setButtonActive={setButtonActive} />
			<SourceElement ref={cursorRef} isCursorCopy={true} text={text} setText={setText} buttonActive={buttonActive} setButtonActive={setButtonActive} />
		</>
	);
});

const render = ({ gl, uniformLocations, uniforms, time, mousePos, texture }: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.activeTexture(gl.TEXTURE0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const DOMRasterizatioCanvas = ({ fragmentShader, vertexShader, uniforms, setAttributes }: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
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

	const sourceElementRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>();
	const cursorElementRef: React.RefObject<HTMLImageElement> = React.useRef<HTMLImageElement>();

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
	useRasterizeToGL({ sourceElementRef, cursorElementRef, imageTexturesRef, initializeGLProps });

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

	console.log('render');

	return (
		<div className={styles.canvasContainer}>
			<canvas ref={canvasRef} className={styles.fullScreenCanvas} />
			<Source ref={{ sourceRef: sourceElementRef, cursorRef: cursorElementRef }} />
			{/* <SourceElement ref={sourceElementRef} text={text} setText={setText} />
			<SourceElement ref={cursorElementRef} isCursorCopy={true} text={text} setText={setText} /> */}
			{/* <img ref={targetElementRef} /> */}
		</div>
	);
};

export default DOMRasterizatioCanvas;
