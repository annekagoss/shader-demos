import { useEffect } from 'react';
import { Interaction } from '../../types';
import { normalizeOrientation } from '../../lib/gl/interaction';

export const useGyroscope = (interactionRef: React.MutableRefObject<Interaction>) => {
	const handleOrientationChange = (e: DeviceOrientationEvent) => {
		interactionRef.current.gyroscope.beta = e.beta;
		interactionRef.current.gyroscope.alpha = e.alpha;
	};
	useEffect(() => {
		interactionRef.current.gyroscope.enabled = Boolean('ondeviceorientation' in window) && Boolean('ontouchstart' in window);
		if (!interactionRef.current.gyroscope.enabled) return;

		if (typeof DeviceOrientationEvent.requestPermission === 'function') {
			DeviceOrientationEvent.requestPermission()
				.then(permissionState => {
					if (permissionState === 'granted') {
						interactionRef.current.gyroscope.enabled = true;
					}
				})
				.catch(e => {
					console.error(e);
					interactionRef.current.gyroscope.enabled = false;
				});
		}
		if (!interactionRef.current.gyroscope.enabled) return;

		window.addEventListener('deviceorientation', handleOrientationChange);
		return () => {
			window.removeEventListener('deviceorientation', handleOrientationChange);
		};
	}, []);
};
