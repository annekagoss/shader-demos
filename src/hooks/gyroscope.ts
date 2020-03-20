import { useEffect } from 'react';
import { Interaction } from '../../types';
import { normalizeOrientation } from '../../lib/gl/interaction';

export const useGyroscope = (interactionRef: React.MutableRefObject<Interaction>) => {
	const handleOrientationChange = (e: DeviceOrientationEvent) => {
		const { beta, gamma } = normalizeOrientation(e);
		interactionRef.current.gyroscope.beta = beta;
		interactionRef.current.gyroscope.gamma = gamma;
	};
	useEffect(() => {
		interactionRef.current.gyroscope.enabled = Boolean('ondeviceorientation' in window) && Boolean('ontouchstart' in window);
		if (!interactionRef.current.gyroscope.enabled) return;
		window.addEventListener('deviceorientation', handleOrientationChange);
		return () => {
			window.removeEventListener('deviceorientation', handleOrientationChange);
		};
	}, []);
};
