import * as React from 'react';
import { UNIFORM_TYPE, UniformSetting } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import transitionFragmentShader from '../../lib/gl/shaders/transition.frag';
import transitionVertexShader from '../../lib/gl/shaders/base.vert';
import Section from '../components/Section/Section';
import TransitionCanvas from '../components/TransitionCanvas/TransitionCanvas';

interface Props {
	isActive: boolean;
}

const BASE_TRANSITION_UNIFORMS: UniformSettings = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: 0,
		name: 'uSlideIndex',
		readonly: true,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	},
	{
		defaultValue: 0.0,
		name: 'uTransitionProgress',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.0
	}
];

const TransitionPage = ({ isActive }: Props) => {
	const transitionUniforms = React.useRef<UniformSettings>(BASE_TRANSITION_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);
	if (!isActive) return <></>;
	return (
		<div>
			<Section title='' fullScreen={true} fragmentShader={transitionFragmentShader} vertexShader={transitionVertexShader} attributes={attributes} uniforms={transitionUniforms}>
				<TransitionCanvas fragmentShader={transitionFragmentShader} vertexShader={transitionVertexShader} uniforms={transitionUniforms} setAttributes={setAttributes} />
			</Section>
		</div>
	);
};

export default TransitionPage;
