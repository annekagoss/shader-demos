import {ColorName, Colors, GLSLColor, GLSLColors, LightIntensities, Vector3, Face, Buffers} from '../../types';

const COLOR_VAL_REGEX: RegExp = /\d+/g;

export function glSupported(window: any): boolean {
	// Check https://github.com/AnalyticalGraphicsInc/webglreport for more detailed compatibility tests
	const supported: boolean = window.WebGLRenderingContext || window.WebGL2RenderingContext;
	if (!supported) {
		console.warn('WebGL is not supported on this device. Skipping 3D.'); // eslint-disable-line no-console
	}
	return supported;
}

export function supportsDepth(gl: WebGLRenderingContext): boolean {
	const hasExtension: boolean = !!gl.getExtension('WEBGL_depth_texture');
	const isTouch: boolean = 'ontouchstart' in window;
	const maxTextures: number = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
	return hasExtension && !isTouch && maxTextures > 8;
}

export function glslColors(colors: Colors): GLSLColors {
	return Object.keys(colors).reduce((result, name) => {
		if (!!ColorName[name]) {
			result[name] = glslColor(colors[name], true);
		} else {
			result[name] = glslColor(colors[name], false);
		}
		return result;
	}, {} as GLSLColors);
}

function glslColor(color: string, allowAlpha: boolean): GLSLColor {
	if (color.indexOf('#') === 0) {
		return hexToRGB(color, allowAlpha);
	}

	const values: string[] = color.match(COLOR_VAL_REGEX);
	if (!values) return;
	if (values.length < 4) {
		return values.map(string => parseInt(string) / 255);
	}
	const alpha: number = parseFloat(values.pop());
	const rgb: number[] = values.map(string => parseInt(string) / 255);
	return allowAlpha ? [...rgb, alpha] : rgb;
}

function hexToRGB(color: string, allowAlpha: boolean): GLSLColor {
	if (color === '#') return;
	const strippedColor: string = color.substr(1);
	const colorLength: number = strippedColor.length;
	const re: RegExp = new RegExp('.{1,'.concat((colorLength / 3).toString(), '}'), 'g');
	const values: string[] = strippedColor.match(re);
	if (!values) return;

	const rgb: number[] = values.map(string => parseInt(string, 16) / 255);
	return allowAlpha ? [...rgb, 1] : rgb;
}

export function applyBrightness(brightness: number, defaults: LightIntensities): LightIntensities {
	return Object.keys(defaults).reduce((result, lightName) => {
		if (lightName === 'ambient') {
			result[lightName] = defaults[lightName];
			return result;
		}
		result[lightName] = defaults[lightName] * brightness;
		return result;
	}, {} as LightIntensities);
}

export function degreesToRadians(degrees: number): number {
	return degrees * (Math.PI / 180);
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function lerp(v0: number, v1: number, t: number): number {
	return v0 * (1 - t) + v1 * t;
}

export function interpolateVectors(sourceVector: Vector3, targetVector: Vector3, amount: number): Vector3 {
	const x: number = lerp(sourceVector.x, targetVector.x, amount);
	const y: number = lerp(sourceVector.y, targetVector.y, amount);
	const z: number = lerp(sourceVector.z, targetVector.z, amount);
	return {x, y, z};
}

export function addVectors(a: Vector3, b: Vector3): Vector3 {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
		z: a.z + b.z
	};
}

export function subtractVectors(a: Vector3, b: Vector3): Vector3 {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
		z: a.z - b.z
	};
}

export function multiplyScalar(v: Vector3, scalar: number): Vector3 {
	return {
		x: v.x * scalar,
		y: v.y * scalar,
		z: v.z * scalar
	};
}

export function crossVectors(a: Vector3, b: Vector3): Vector3 {
	return {
		x: a.y * b.z - a.z * b.y,
		y: a.z * b.x - a.x * b.z,
		z: a.x * b.y - a.y * b.x
	};
}

export function normalizeVector(v: Vector3): Vector3 {
	const magnitude: number = vectorMagnitude(v);
	if (magnitude === 0) return v;
	return multiplyScalar(v, 1 / magnitude);
}

export function vectorMagnitude({x, y, z}: Vector3): number {
	return Math.sqrt(x * x + y * y + z * z);
}

export const computeFaceNormal = (face: Face): Vector3 | undefined => {
	const {a, b, c} = face;
	const cb: Vector3 = subtractVectors(c, b);
	const ab: Vector3 = subtractVectors(a, b);
	const cross: Vector3 = crossVectors(cb, ab);
	/* We need to use === on -0 here because the recommended Object.is
  is not supported on IE. */
	if (cross.x === -0) cross.x = 0; // eslint-disable-line no-compare-neg-zero
	if (cross.y === -0) cross.y = 0; // eslint-disable-line no-compare-neg-zero
	if (cross.z === -0) cross.z = 0; // eslint-disable-line no-compare-neg-zero
	return normalizeVector(cross);
};

export const formatAttributes = (buffersRef: React.MutableRefObject<Buffers>): Record<string, string>[] => {
	if (!buffersRef.current) return [];
	return Object.keys(buffersRef.current).reduce((result, bufferName) => {
		const buffer = buffersRef.current[bufferName];
		if (!buffer || !buffer.data) return result;
		result.push({
			name: bufferName,
			value: `${buffer.data
				.slice(0, 10)
				.map(item => Math.round(item * 100) / 100)
				.join(', ')}... (${buffer.data.length} total)`
		});
		return result;
	}, []);
};
