import * as React from 'react';
import BaseCanvas from '../BaseCanvas';
import initialBaseVertexShader from '../../../lib/gl/shaders/base.vert';
import initialWaterFragmentShader from '../../../lib/gl/shaders/water.frag';
import { BASE_UNIFORMS } from '../../utils/general';
import { UNIFORM_TYPE, UniformSettings } from '../../../types';
import WaterCanvas from './WaterCanvas';
import WaterSource from './WaterSource';

const BASE_WATER_UNIFORMS: UniformSettings = {
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
	uSamplerResolution0: {
		defaultValue: { x: 0, y: 0 },
		name: 'uSamplerResolution0',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: 0 },
	},
};

const Water = ({ children }) => {
	const [attributes, setAttributes] = React.useState<any[]>([]);
	const baseUniforms = React.useRef<UniformSettings>(BASE_WATER_UNIFORMS);
	const [waterFragmentShader, setBaseFragmentShader] = React.useState<string>(initialWaterFragmentShader);
	const [waterFragmentError, setWaterFragmentError] = React.useState<Error | null>();
	const [baseVertexShader, setBaseVertexShader] = React.useState<string>(initialBaseVertexShader);
	const [baseVertexError, setBaseVertexError] = React.useState<Error | null>();

	return (
		<WaterCanvas
			fragmentShader={waterFragmentShader}
			vertexShader={baseVertexShader}
			uniforms={baseUniforms}
			setAttributes={setAttributes}
			setFragmentError={setWaterFragmentError}
			setVertexError={setBaseVertexError}
			foregroundContent={children}
		/>
	);
};

export default Water;
