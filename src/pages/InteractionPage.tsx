import * as React from 'react';
import { UNIFORM_TYPE, UniformSetting } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import interactionVertexShader from '../../lib/gl/shaders/phong.vert';
import interactionFragmentShader from '../../lib/gl/shaders/toon.frag';
import Section from '../components/Section/Section';
import InteractionCanvas from '../components/InteractionCanvas/InteractionCanvas';

// FOX SKULL
import foxOBJ from '../assets/fox/fox3.obj';
import foxMTL from '../assets/fox/fox.mtl';
import foxDiffuseSource0 from '../assets/fox/fox_skull_0.jpg';
import foxDiffuseSource1 from '../assets/fox/fox_skull_1.jpg';

interface Props {
	isActive: boolean;
}

const BASE_INTERACTION_UNIFORMS: UniformSettings = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: { x: 0, y: 0, z: 0 },
		name: 'uTranslation',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 0, y: 0, z: 0 }
	},
	{
		defaultValue: { x: 14.9, y: 180 + 50.7, z: 28.8 },
		name: 'uRotation',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: { x: 14.9, y: 180 + 50.7, z: 28.8 }
	},
	{
		defaultValue: 0.0485,
		name: 'uScale',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.0485
	}
];

const InteractionPage = ({ isActive }: Props) => {
	const interactionUniforms = React.useRef<UniformSettings>(BASE_INTERACTION_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);
	if (!isActive) return <></>;
	const foxOBJData = {
		OBJSource: foxOBJ,
		MTLSource: foxMTL,
		textures: {
			diffuse: {
				'material_0.001': foxDiffuseSource0,
				'material_1.001': foxDiffuseSource1
			}
		}
	};

	return (
		<div>
			<Section title='' fullScreen={true} fragmentShader={interactionFragmentShader} vertexShader={interactionVertexShader} attributes={attributes} uniforms={interactionUniforms}>
				<InteractionCanvas
					fragmentShader={interactionFragmentShader}
					vertexShader={interactionVertexShader}
					uniforms={interactionUniforms}
					setAttributes={setAttributes}
					OBJData={foxOBJData}
				/>
			</Section>
		</div>
	);
};

export default InteractionPage;
