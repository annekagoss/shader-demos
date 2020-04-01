import * as React from 'react';
import cx from 'classnames';
import { UniformSettings, Vector2, MESH_TYPE, RGBA } from '../../../types';
import { assignUniforms, InitializeProps } from '../../../lib/gl/initialize';
import { BASE_TRIANGLE_MESH } from '../../../lib/gl/settings';
import { useAnimationFrame } from '../../hooks/animation';
import { useWindowSize } from '../../hooks/resize';
import { useMouse } from '../../hooks/mouse';
import styles from './DOMRasterizationCanvas.module.scss';
import { useRasterizeToGL } from '../../hooks/rasterize';
import { parseColorFromString } from '../../utils/color';

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
	setText?: (val: string) => void;
	buttonActive: boolean;
	setButtonActive?: (val: boolean) => void;
	inputFocused: boolean;
	setInputFocused?: (val: boolean) => void;
}

const SourceElement = React.forwardRef(
	(
		{
			buttonActive,
			setButtonActive,
			inputFocused,
			setInputFocused,
			text,
			setText,
			isCursorCopy = false
		}: SourceElementProps,
		ref: React.RefObject<HTMLDivElement>
	) => {
		const buttonRef: React.RefObject<HTMLButtonElement> = React.useRef<
			HTMLButtonElement
		>();
		const textColor: string = isCursorCopy ? 'transparent' : 'white';
		const buttonBorder: string = isCursorCopy
			? 'solid 1px transparent'
			: 'solid 1px white';
		const hoverButtonColor: string = isCursorCopy
			? 'transparent'
			: 'rgb(0, 0, 255)';
		const buttonColor: string = buttonActive ? hoverButtonColor : textColor;
		const buttonBackground: string = buttonActive
			? textColor
			: 'transparent';
		const inputBorder: string = inputFocused
			? `solid 1px ${textColor}`
			: 'solid 1px transparent';

		return (
			<div
				className={cx(
					styles.canvasForeground,
					styles.sourceElement,
					isCursorCopy && styles.cursorCopy
				)}
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
				}}
			>
				<div
					style={{
						padding: 0,
						margin: 0
					}}
				>
					<div
						style={{
							marginBottom: 80,
							fontSize: 40,
							color: textColor,
							lineHeight: 1,
							fontFamily: 'Roboto, sans-serif',
							fontWeight: 'bold',
							letterSpacing: 1
						}}
					>
						type a color
					</div>
					<form
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-start'
						}}
					>
						<input
							type='text'
							style={{
								width: 200,
								backgroundColor: 'transparent',
								borderTop: inputBorder,
								borderRight: inputBorder,
								borderBottom: buttonBorder,
								borderLeft: inputBorder,
								color: textColor,
								caretColor: 'transparent',
								fontSize: 40,
								minWidth: 500,
								padding: '8px 20px',
								fontFamily: 'Roboto, sans-serif',
								lineHeight: 1,
								fontWeight: 'bold',
								marginBottom: 40,
								letterSpacing: 1
							}}
							value={text}
							onChange={e => {
								if (!isCursorCopy) return;
								setText && setText(e.target.value);
							}}
							onFocus={() =>
								setInputFocused && setInputFocused(true)
							}
							onBlur={() =>
								setInputFocused && setInputFocused(false)
							}
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
							onClick={() => setText && setText('')}
							onMouseEnter={() =>
								setButtonActive && setButtonActive(true)
							}
							onMouseLeave={() =>
								setButtonActive && setButtonActive(false)
							}
						>
							{' '}
							clear
						</button>
					</form>
				</div>
			</div>
		);
	}
);

interface SourceProps {
	uniforms: React.MutableRefObject<UniformSettings>;
}

const Source = React.forwardRef(({ uniforms }: SourceProps, ref) => {
	const {
		sourceRef,
		cursorRef
	}: Record<string, React.RefObject<HTMLDivElement>> = ref;
	const [text, setText] = React.useState<string>('blue');
	const [buttonActive, setButtonActive] = React.useState<boolean>(false);
	const [inputFocused, setInputFocused] = React.useState<boolean>(false);

	React.useEffect(() => {
		console.log(text);
		console.log(parseColorFromString(text));
		const color: RGBA = parseColorFromString(text);
		if (Boolean(color)) {
			uniforms.current.uColor.value = color;
		}

		console.log(uniforms.current.uColor.value);
	}, [text]);
	return (
		<>
			<SourceElement
				ref={sourceRef}
				text={text}
				buttonActive={buttonActive}
				inputFocused={inputFocused}
			/>
			<SourceElement
				ref={cursorRef}
				isCursorCopy={true}
				text={text}
				setText={setText}
				buttonActive={buttonActive}
				setButtonActive={setButtonActive}
				inputFocused={inputFocused}
				setInputFocused={setInputFocused}
			/>
		</>
	);
});

const render = ({
	gl,
	uniformLocations,
	uniforms,
	time,
	mousePos,
	texture
}: RenderProps) => {
	if (!gl) return;
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.activeTexture(gl.TEXTURE0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const DOMRasterizatioCanvas = ({
	fragmentShader,
	vertexShader,
	uniforms,
	setAttributes
}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<
		HTMLCanvasElement
	>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current.uResolution.value.x * window.devicePixelRatio,
		y: uniforms.current.uResolution.value.y * window.devicePixelRatio
	});
	const initialMousePosition = uniforms.current.uMouse
		? uniforms.current.uMouse.defaultValue
		: { x: 0.5, y: 0.5 };
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: size.current.x * initialMousePosition.x,
		y: size.current.y * -initialMousePosition.y
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<
		Record<string, WebGLUniformLocation>
	>();
	const imageTexturesRef: React.MutableRefObject<Record<
		string,
		string
	>> = React.useRef<Record<string, string>>({});
	const texturesRef: React.MutableRefObject<WebGLTexture[]> = React.useRef<
		WebGLTexture[]
	>([]);

	const sourceElementRef: React.RefObject<HTMLDivElement> = React.useRef<
		HTMLDivElement
	>();
	const cursorElementRef: React.RefObject<HTMLImageElement> = React.useRef<
		HTMLImageElement
	>();

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
	useRasterizeToGL({
		sourceElementRef,
		cursorElementRef,
		imageTexturesRef,
		initializeGLProps
	});

	React.useEffect(() => {
		setAttributes([
			{ name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ') }
		]);
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
			<Source
				ref={{
					sourceRef: sourceElementRef,
					cursorRef: cursorElementRef
				}}
				uniforms={uniforms}
			/>
		</div>
	);
};

export default DOMRasterizatioCanvas;
