import { useEffect } from 'react';
import { Interaction } from '../../types';
import { normalizeOrientation } from '../../lib/gl/interaction';

export const useGyroscope = (
	interactionRef: React.MutableRefObject<Interaction>
) => {
	useEffect(() => {
		console.log('GYRO TEST 1');
		interactionRef.current.gyroscope.enabled =
			Boolean('ondeviceorientation' in window) &&
			Boolean('ontouchstart' in window);
		if (!interactionRef.current.gyroscope.enabled) return;

		if (typeof DeviceOrientationEvent.requestPermission === 'function') {
			DeviceOrientationEvent.requestPermission()
				.then(permissionState => {
					if (permissionState === 'granted') {
						interactionRef.current.gyroscope.enabled = true;
						console.log('PERMISSION GRANTED');

						window.addEventListener(
							'deviceorientation',
							(e: DeviceOrientationEvent) =>
								handleOrientationChange(e, interactionRef)
						);
						return () => {
							window.removeEventListener(
								'deviceorientation',
								(e: DeviceOrientationEvent) =>
									handleOrientationChange(e, interactionRef)
							);
						};
					}
				})
				.catch(e => {
					console.error(e);
					interactionRef.current.gyroscope.enabled = false;
				});
		}
	}, []);
};
const handleOrientationChange = (
	e: DeviceOrientationEvent,
	interactionRef: React.MutableRefObject<Interaction>
) => {
	if (!interactionRef.current.gyroscope.enabled) return;
	console.log('enabled');
	interactionRef.current.gyroscope.beta = e.beta;
	interactionRef.current.gyroscope.alpha = e.alpha;
};
