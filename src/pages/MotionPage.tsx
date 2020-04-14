import * as React from 'react';
import { UNIFORM_TYPE, UniformSettings } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import Section from '../components/Section/Section';
import BaseCanvas from '../components/BaseCanvas';
import FeedbackCanvas from '../components/FeedbackCanvas/FeedbackCanvas';
import baseVertexShader from '../../lib/gl/shaders/base.vert';
import translationFragmentShader from '../../lib/gl/shaders/translate.frag';
import scaleFragmentShader from '../../lib/gl/shaders/scale.frag';
import rotationFragmentShader from '../../lib/gl/shaders/rotation.frag';
import signalFragmentShader from '../../lib/gl/shaders/signal.frag';
import noiseFragmentShader from '../../lib/gl/shaders/noise.frag';
import feedbackFragmentShader from '../../lib/gl/shaders/feedback.frag';

import translationDiagram from '../assets/diagrams/1.0 Translation.png';
import scaleDiagram from '../assets/diagrams/1.1 Scale.png';
import rotationDiagram from '../assets/diagrams/1.2 Rotation.png';
import signalDiagram from '../assets/diagrams/1.3 Signal.png';
import noiseDiagram from '../assets/diagrams/1.4 Noise.png';
import feedbackDiagram from '../assets/diagrams/1.5 Feedback.png';

const BASE_TRANSLATION_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uRectDimensions: {
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uRectDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 },
	},
	uMouse: {
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uMouse',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 },
	},
};

const BASE_SCALE_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uMaxScale: {
		defaultValue: { x: 1.0, y: 1.0 },
		name: 'uMaxScale',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 1.0, y: 1.0 },
	},
};

const BASE_ROTATION_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uSpeed: {
		defaultValue: 1,
		name: 'uSpeed',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 1,
	},
};

const BASE_SIGNAL_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uFrequency: {
		defaultValue: 1.0,
		name: 'uFrequency',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 1.0,
	},
	uSpeed: {
		defaultValue: 1.0,
		name: 'uSpeed',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 1.0,
	},
	uSignalType: {
		defaultValue: 0,
		isBool: false,
		isRadio: true,
		radioChoices: ['Sine', 'Square', 'Sawtooth', 'Triangle'],
		name: 'uSignalType',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0,
	},
};

const BASE_NOISE_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uFractal: {
		defaultValue: 1,
		isBool: true,
		name: 'uFractal',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1,
	},
	uOctaves: {
		defaultValue: 4,
		isBool: false,
		name: 'uOctaves',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 4,
	},
};

const BASE_FEEDBACK_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uMouse: {
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uMouse',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 },
	},
	uOffset: {
		defaultValue: { x: 0, y: -0.01 },
		name: 'uOffset',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: -0.01 },
	},
	uAlpha: {
		defaultValue: 0.95,
		name: 'uAlpha',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.95,
	},
	uSmoke: {
		defaultValue: 0,
		isBool: true,
		name: 'uSmoke',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0,
	},
};

interface Props {
	isActive: boolean;
}

const MotionPage = ({ isActive }: Props) => {
	const translationUniforms = React.useRef<UniformSettings>(
		BASE_TRANSLATION_UNIFORMS
	);
	const scaleUniforms = React.useRef<UniformSettings>(BASE_SCALE_UNIFORMS);
	const rotationUniforms = React.useRef<UniformSettings>(
		BASE_ROTATION_UNIFORMS
	);
	const signalUniforms = React.useRef<UniformSettings>(BASE_SIGNAL_UNIFORMS);
	const noiseUniforms = React.useRef<UniformSettings>(BASE_NOISE_UNIFORMS);
	const feedbackUniforms = React.useRef<UniformSettings>(
		BASE_FEEDBACK_UNIFORMS
	);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	return (
		<div>
			<Section
				title='1.0: Translation'
				notes={`To change the position of a shape in a shader, you actually change the coordinate system itself.  In this example we move the screen space around in a circle, and then draw the square inside it.  If there are multiple Form that are moving independantly would each have their own unique coordinate system.`}
				image={translationDiagram}
				fragmentShader={translationFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={translationUniforms}
			>
				<BaseCanvas
					fragmentShader={translationFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={translationUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='1.1: Scale'
				notes={`GLSL's native support for matrices allows us to apply complex spatial transformations efficiently. Scaling is probably the simplest of these transformations.  Notice that we need to normalize and then re-center the coordinate system before and after applying the matrix.`}
				image={scaleDiagram}
				fragmentShader={scaleFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={scaleUniforms}
			>
				<BaseCanvas
					fragmentShader={scaleFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={scaleUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='1.2: Rotation'
				notes={`Here we use another 2x2 matrix to rotate the coordinate system around the origin x:0 y: 0.`}
				image={rotationDiagram}
				fragmentShader={rotationFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={rotationUniforms}
			>
				<BaseCanvas
					fragmentShader={rotationFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={rotationUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='1.3: Signal'
				notes={`Like noise, signals can be a powerful tool for generating and animating graphics. If with think of the x-axis as the time domain we can draw signals by offsetting them in time instead of space.`}
				image={signalDiagram}
				fragmentShader={signalFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={signalUniforms}
			>
				<BaseCanvas
					fragmentShader={signalFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={signalUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='1.4: Noise'
				notes={`Noise is a powerful tool to create organic effects.  This is an example of 3D Simplex Noise, where we animate the noise by mapping the 3rd dimension to time.`}
				image={noiseDiagram}
				fragmentShader={noiseFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={noiseUniforms}
			>
				<BaseCanvas
					fragmentShader={noiseFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={noiseUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='1.5: Feedback'
				notes={`This shader takes in itself as in input to generate this smear effect. On each frame it recursively applies an offset and opacity to the frame before it.  To achieve this we need two offscreen frame buffers and target textures that are alternated each frame (called PingPonging.)`}
				image={feedbackDiagram}
				fragmentShader={feedbackFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={feedbackUniforms}
			>
				<FeedbackCanvas
					fragmentShader={feedbackFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={feedbackUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
		</div>
	);
};

export default MotionPage;
