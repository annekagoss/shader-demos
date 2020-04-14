import * as React from 'react';
import { BASE_UNIFORMS } from '../utils/general';
import Section from '../components/Section/Section';
import BaseCanvas from '../components/BaseCanvas';
import baseVertexShader from '../../lib/gl/shaders/base.vert';
import helloWorldFragmentShader from '../../lib/gl/shaders/hello-world.frag';
import stepFragmentShader from '../../lib/gl/shaders/step.frag';
import lineFragmentShader from '../../lib/gl/shaders/line.frag';
import rectangleFragmentShader from '../../lib/gl/shaders/rectangle.frag';
import circleFragmentShader from '../../lib/gl/shaders/circle.frag';
import polygonFragmentShader from '../../lib/gl/shaders/polygon.frag';
import { UNIFORM_TYPE, UniformSettings } from '../../types';

import helloWorldDiagram from '../assets/diagrams/0.0 Hello World.png';
import stepDiagram from '../assets/diagrams/0.1 Step.png';
import lineDiagram from '../assets/diagrams/0.2 Line.png';
import rectangleDiagram from '../assets/diagrams/0.3 Rectangle.png';
import circleDiagram from '../assets/diagrams/0.4 Circle.png';
import polygonDiagram from '../assets/diagrams/0.5 Polygon.png';

const BASE_STEP_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uThreshold: {
		defaultValue: 0.5,
		name: 'uThreshold',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.5,
	},
};

const BASE_LINE_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uSmooth: {
		defaultValue: 1,
		isBool: true,
		name: 'uSmooth',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1,
	},
	uThickness: {
		defaultValue: 0.02,
		name: 'uThickness',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.02,
	},
};

const BASE_RECTANGLE_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uRectDimensions: {
		defaultValue: { x: 0.33, y: 0.66 },
		name: 'uRectDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.33, y: 0.66 },
	},
};

const BASE_CIRCLE_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uSmooth: {
		defaultValue: 1,
		isBool: true,
		name: 'uSmooth',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1,
	},
	uRadius: {
		defaultValue: 0.25,
		name: 'uRadius',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.25,
	},
	uCenter: {
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uCenter',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 },
	},
};

const BASE_POLYGON_UNIFORMS: UniformSettings = {
	...BASE_UNIFORMS,
	uNumSides: {
		defaultValue: 3,
		isBool: false,
		name: 'uNumSides',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 3,
	},
	uShowSDF: {
		defaultValue: 0,
		isBool: true,
		name: 'uShowSDF',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0,
	},
};

interface Props {
	isActive: boolean;
}

const FormPage = ({ isActive }: Props) => {
	const baseUniforms = React.useRef<UniformSettings>(BASE_UNIFORMS);
	const stepUniforms = React.useRef<UniformSettings>(BASE_STEP_UNIFORMS);
	const lineUniforms = React.useRef<UniformSettings>(BASE_LINE_UNIFORMS);
	const rectUniforms = React.useRef<UniformSettings>(BASE_RECTANGLE_UNIFORMS);
	const circleUniforms = React.useRef<UniformSettings>(BASE_CIRCLE_UNIFORMS);
	const polygonUniforms = React.useRef<UniformSettings>(
		BASE_POLYGON_UNIFORMS
	);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	return (
		<div>
			<Section
				title='0.0: Hello World'
				notes={`
              The fragment shader is rendered onto a base mesh. In these first examples we will use a 1x1 plane which acts as a projection screen.
              The aVertexPosition attribute holds an array of 3-vector coordinates for each vertex of the base mesh.
			`}
				image={helloWorldDiagram}
				fragmentShader={helloWorldFragmentShader}
				vertexShader={baseVertexShader}
				uniforms={baseUniforms}
				attributes={attributes}
			>
				<BaseCanvas
					fragmentShader={helloWorldFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={baseUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='0.1: Step'
				notes={` Step is one of the hardware accelerated functions that are native to GLSL. It returns either 1.0 or 0.0 based on whether a value has passed a given threshold.`}
				image={stepDiagram}
				fragmentShader={stepFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={stepUniforms}
			>
				<BaseCanvas
					fragmentShader={stepFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={stepUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='0.2: Line'
				notes={
					' Smoothstep is another hardware accelerated function.  It performs a smooth interpolation between 0 and 1 for a given value (in this case, y.)  Notice the anti-aliasing benefit smoothstep adds by toggling uSmooth on and off.'
				}
				image={lineDiagram}
				fragmentShader={lineFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={lineUniforms}
			>
				<BaseCanvas
					fragmentShader={lineFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={lineUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='0.3: Rectangle'
				notes={`Adding, subtracting, multiplying and dividing operations work exactly like blending modes in CSS or Photoshop.  Here we're using multiply  to combine the dark edges around the rectangle.`}
				image={rectangleDiagram}
				fragmentShader={rectangleFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={rectUniforms}
			>
				<BaseCanvas
					fragmentShader={rectangleFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={rectUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='0.4: Circle'
				notes={`Distance is a very useful hardware accelerated function that return the distance between two points.  The points can be represented as two floats or two n-dimensional vectors.`}
				image={circleDiagram}
				fragmentShader={circleFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={circleUniforms}
			>
				<BaseCanvas
					fragmentShader={circleFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={circleUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
			<Section
				title='0.5: Polygon'
				notes={`Signed Distance Functions are tricky, but very powerful.  They define a field of values based on each point's distance from a given boundary, where the sign determined whether the point is within the boundary.  Here we have a function that determines if a pixel is inside the boundaries of an n-sided polygon.`}
				image={polygonDiagram}
				fragmentShader={polygonFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={polygonUniforms}
			>
				<BaseCanvas
					fragmentShader={polygonFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={polygonUniforms}
					setAttributes={setAttributes}
				/>
			</Section>
		</div>
	);
};

export default FormPage;
