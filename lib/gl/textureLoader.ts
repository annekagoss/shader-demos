import { Materials, Texture } from '../../types';

interface LoadedImage {
	name: string;
	type: string;
	image: HTMLImageElement;
}

export const loadImageTextures = async (gl: WebGLRenderingContext, images: Record<string, string>): Promise<Record<string, Texture>> => {
	const promises: Promise<LoadedImage>[] = Object.keys(images).map(name => initTexture(name, 'diffuse', images[name]));

	return Promise.all(promises).then(loadedImages => {
		const loadedTextures: Record<string, Texture> = {};
		loadedImages.forEach(({ name, image }: LoadedImage) => {
			if (image && image.src) {
				loadedTextures[name] = bindTexture(gl, image);
			}
		});
		return loadedTextures;
	});
};

export const loadMaterialTextures = (gl: WebGLRenderingContext, materials: Materials): Promise<Materials> => {
	let promises: Promise<LoadedImage>[] = [];
	Object.keys(materials).forEach(name => {
		const { textures } = materials[name];
		if (textures && textures !== {}) {
			const matPromises: Promise<LoadedImage>[] = Object.keys(textures)
				.filter(type => !!textures[type])
				.map(type => initTexture(name, type, textures[type]));
			promises = promises.concat(matPromises);
		}
	});

	return Promise.all(promises).then(loadedImages => {
		const loadedMaterials: Materials = materials;
		loadedImages.forEach(({ name, type, image }: LoadedImage) => {
			if (image && image.src) {
				const boundTexture: WebGLTexture = bindTexture(gl, image);
				loadedMaterials[name].textures[type] = boundTexture;
			}
		});
		delete loadedMaterials.textures;
		return loadedMaterials;
	});
};

const initTexture = async (name: string, type: string, source: string): Promise<LoadedImage> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => resolve({ name, type, image });
		image.onerror = e => reject(e);
		image.src = source;
	});

export const bindTexture = (gl, image): Texture => {
	const level = 0;
	const internalFormat = gl.RGBA;
	const sourceFormat = gl.RGBA;
	const sourceType = gl.UNSIGNED_BYTE;
	const texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, sourceFormat, sourceType, image);
	if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
		gl.generateMipmap(gl.TEXTURE_2D);
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	return {
		texture,
		textureSize: { x: image.width, y: image.height }
	};
};

const isPowerOf2 = value => (value & (value - 1)) === 0;
