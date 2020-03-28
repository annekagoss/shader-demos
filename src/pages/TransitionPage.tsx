import * as React from 'react';
import { UNIFORM_TYPE, UniformSettings } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import transitionFragmentShader from '../../lib/gl/shaders/transition.frag';
import transitionVertexShader from '../../lib/gl/shaders/base.vert';
import Section from '../components/Section/Section';
import TransitionCanvas from '../components/TransitionCanvas/TransitionCanvas';

import slideImage1 from '../assets/purple-desert-1.jpg';
import slideImage2 from '../assets/red-cave-1.jpg';
import slideImage3 from '../assets/red-boulder-1.jpg';
import slideImage4 from '../assets/purple-desert-2.jpg';
import slideImage5 from '../assets/red-boulder-2.jpg';

interface Props {
	isActive: boolean;
}

const BASE_TRANSITION_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	uSlideIndex: {
		defaultValue: 0,
		name: 'uSlideIndex',
		readonly: true,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	},
	uDirection: {
		defaultValue: 1,
		name: 'uDirection',
		readonly: true,
		type: UNIFORM_TYPE.INT_1,
		value: 1
	},
	uTransitionProgress: {
		defaultValue: 0.0,
		name: 'uTransitionProgress',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.0
	}
};

const TransitionPage = ({ isActive }: Props) => {
	const transitionUniforms = React.useRef<UniformSettings>(BASE_TRANSITION_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);
	if (!isActive) return <></>;

	const slideImages: Record<string, string> = {
		slideImage1,
		slideImage2,
		slideImage3,
		slideImage4,
		slideImage5
	};
	return (
		<div>
			<Section title='' fullScreen={true} fragmentShader={transitionFragmentShader} vertexShader={transitionVertexShader} attributes={attributes} uniforms={transitionUniforms}>
				<TransitionCanvas
					fragmentShader={transitionFragmentShader}
					vertexShader={transitionVertexShader}
					uniforms={transitionUniforms}
					setAttributes={setAttributes}
					slideImages={slideImages}
				/>
			</Section>
		</div>
	);
};

export default TransitionPage;
