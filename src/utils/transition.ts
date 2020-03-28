const SPEED = 0.001;
const DURATION = 0.1;

const easeInOutQuad = (time: number, initial: number, final: number, duration: number): number => {
	if ((time /= duration / 2) < 1) return (final / 2) * time * time + initial;
	return (-final / 2) * (--time * (time - 2) - 1) + initial;
};

const easeInOutCubic = (time: number, initial: number, final: number, duration: number) => {
	if ((time /= duration / 2) < 1) return (final / 2) * time * time * time + initial;
	return (final / 2) * ((time -= 2) * time * time + 2) + initial;
};

export const updateTransitionProgress = (
	gl: React.MutableRefObject<WebGLRenderingContext>,
	uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>,
	transitionTimeRef: React.MutableRefObject<number>,
	slideIndexRef: React.MutableRefObject<number>,
	isTransitioningRef: React.MutableRefObject<boolean>,
	transitionProgressRef: React.MutableRefObject<number>,
	transitionDirectionRef: React.MutableRefObject<number>,
	texturesRef: React.MutableRefObject<WebGLTexture[]>,
	fakeTexturesRef: React.MutableRefObject<number[]>
) => {
	if (!isTransitioningRef.current) return;

	if (transitionTimeRef.current >= DURATION) {
		isTransitioningRef.current = false; // Stop transition
		slideIndexRef.current += transitionDirectionRef.current; // Increment/decrement slide index
		transitionProgressRef.current = 0;
		transitionTimeRef.current = 0;
		if (transitionDirectionRef.current === 1) {
			texturesRef.current = rotateArray(texturesRef.current, transitionDirectionRef.current);
			bindTextures(gl.current, texturesRef.current.slice(0, 2), uniformLocations.current);
		}
		return;
	}

	if (transitionDirectionRef.current === 1) {
		transitionProgressRef.current = easeInOutQuad(transitionTimeRef.current, 0, 1, DURATION);
	} else {
		transitionProgressRef.current = 1.0 - easeInOutQuad(transitionTimeRef.current, 0, 1, DURATION);
		if (transitionProgressRef.current === 1) {
			texturesRef.current = rotateArray(texturesRef.current, transitionDirectionRef.current);
			fakeTexturesRef.current = rotateArray(fakeTexturesRef.current, transitionDirectionRef.current);
			bindTextures(gl.current, texturesRef.current.slice(0, 2), uniformLocations.current);
		}
	}
	transitionTimeRef.current += SPEED;
};

const rotateArray = (array: Array<any>, direction: number): Array<any> => {
	if (direction === -1) array.unshift(array.pop());
	else array.push(array.shift());
	return array;
};

const bindTextures = (gl: WebGLRenderingContext, textures: WebGLTexture[], uniformLocations: Record<string, WebGLUniformLocation>) => {
	textures.map((texture, i) => {
		gl.activeTexture(gl[`TEXTURE${i}`] as number);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.uniform1i(uniformLocations[`uDiffuse${i}`], i);
	});
};
