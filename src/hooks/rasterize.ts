import * as React from 'react';
import { InitializeProps } from '../../lib/gl/initialize';
import { initializeGL } from './gl';
import { throttle } from './helpers';
import { loadTextures } from '../../lib/gl/textureLoader';

interface RasterizeToGLProps {
	sourceElementRef: React.RefObject<HTMLElement>;
	targetElementRef: React.RefObject<HTMLImageElement>;
	imageTexturesRef: React.MutableRefObject<Record<string, string>>;
	initializeGLProps: InitializeProps;
}

export const useRasterizeToGL = (props: RasterizeToGLProps) => {
	React.useEffect(() => {
		if (!props.sourceElementRef || !props.sourceElementRef.current) {
			initializeGL(props.initializeGLProps);
			return;
		}
		rasterizeElementAndInitializeGL(props);
		const refreshImageOnEvent = throttle(30, () => refreshImage(props));
		props.sourceElementRef.current.addEventListener('mousemove', refreshImageOnEvent);
		props.sourceElementRef.current.addEventListener('keydown', refreshImageOnEvent);
		props.sourceElementRef.current.addEventListener('keyup', refreshImageOnEvent);
		const mouseUpHandler = () => {
			setTimeout(() => {
				refreshImageOnEvent();
			}, 0);
		};
		props.sourceElementRef.current.addEventListener('mouseup', mouseUpHandler);
		window.addEventListener('load', () => refreshImage(props));
		window.addEventListener('resize', () => refreshImage(props));

		return () => {
			props.sourceElementRef.current.removeEventListener('mousemove', refreshImageOnEvent);
			props.sourceElementRef.current.removeEventListener('keydown', refreshImageOnEvent);
			props.sourceElementRef.current.removeEventListener('keyup', refreshImageOnEvent);
			props.sourceElementRef.current.removeEventListener('mouseup', mouseUpHandler);
			window.removeEventListener('load', () => refreshImage(props));
			window.removeEventListener('resize', () => refreshImage(props));
		};
	}, []);
};

const refreshImage = async ({ sourceElementRef, targetElementRef, imageTexturesRef, initializeGLProps }: RasterizeToGLProps) => {
	const { DOMImage, size } = await rasterizeElement(sourceElementRef.current, targetElementRef.current);
	imageTexturesRef.current = { DOMImage };
	initializeGLProps.uniforms.uSamplerResolution0.value = size;
	loadTextures(initializeGLProps.gl.current, initializeGLProps.uniformLocations.current, { DOMImage });
};

const rasterizeElementAndInitializeGL = async ({ sourceElementRef, targetElementRef, imageTexturesRef, initializeGLProps }: RasterizeToGLProps) => {
	const { DOMImage, size } = await rasterizeElement(sourceElementRef.current, targetElementRef.current);
	imageTexturesRef.current = { DOMImage };
	initializeGLProps.uniforms.uSamplerResolution0.value = size;
	initializeGLProps.imageTextures = imageTexturesRef.current;
	initializeGL(initializeGLProps);
};

const rasterizeElement = async (sourceElement: HTMLElement, targetElement: HTMLImageElement) => {
	if (!sourceElement) return;
	const { width, height } = sourceElement.getBoundingClientRect();
	const SVGDataURI = makeSVGDataURI(sourceElement, width, height);
	const image: HTMLImageElement = await createImageFromURI(SVGDataURI);
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext('2d');
	context.drawImage(image, 0, 0);
	const png = canvas.toDataURL();
	if (targetElement) targetElement.src = png;
	return { DOMImage: png, size: { x: width, y: height } };
};

const makeSVGDataURI = (node, width: number, height: number): string => {
	node.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
	const serializedNode = new XMLSerializer().serializeToString(node);
	const escapedNode = escapeXhtml(serializedNode);
	return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject x="0" y="0" width="100%" height="100%">${escapedNode}</foreignObject></svg>`;
};

const escapeXhtml = (s: string): string => s.replace(/#/g, '%23').replace(/\n/g, '%0A');

const createImageFromURI = (SVGDataURL: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => resolve(image);
		image.onerror = e => reject(e);
		image.src = SVGDataURL;
	});
