import * as React from 'react';
import { UNIFORM_TYPE, UniformSettings } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import rasterizationFragmentShader from '../../lib/gl/shaders/dom.frag';
import rasterizationVertexShader from '../../lib/gl/shaders/base.vert';
import Section from '../components/Section/Section';
import DOMRasterizationCanvas from '../components/DOMRasterizationCanvas/DOMRasterizationCanvas';

interface Props {
	isActive: boolean;
}

const BASE_RASTERIZATION_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uTime: {
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0,
	},
	uSamplerResolution0: {
		defaultValue: { x: 0, y: 0 },
		name: 'uSamplerResolution0',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: 0 },
	},
	uColor: {
		defaultValue: { x: 1.0, y: 0.647, z: 1.0, w: 1.0 },
		name: 'uColor',
		readonly: true,
		type: UNIFORM_TYPE.VEC_4,
		value: { x: 1.0, y: 0.647, z: 1.0, w: 1.0 },
	},
	uDitherSteps: {
		defaultValue: 6.0,
		name: 'uDitherSteps',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 6.0,
	},
};

const DOMRasterizationPage = ({ isActive }: Props) => {
	const rasterizationUniforms = React.useRef<UniformSettings>(BASE_RASTERIZATION_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);
	if (!isActive) return <></>;

	return (
		<div>
			<Section title='' fullScreen={true} fragmentShader={rasterizationFragmentShader} vertexShader={rasterizationVertexShader} attributes={attributes} uniforms={rasterizationUniforms}>
				<DOMRasterizationCanvas fragmentShader={rasterizationFragmentShader} vertexShader={rasterizationVertexShader} uniforms={rasterizationUniforms} setAttributes={setAttributes} />
			</Section>
		</div>
	);
};

export default DOMRasterizationPage;
