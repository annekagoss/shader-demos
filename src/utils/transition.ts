const SPEED = 0.02;
const DURATION = 1;

const easeInOutQuad = (time: number, initial: number, final: number, duration: number): number => {
	if ((time /= duration / 2) < 1) return (final / 2) * time * time + initial;
	return (-final / 2) * (--time * (time - 2) - 1) + initial;
};

const easeInOutCubic = (time: number, initial: number, final: number, duration: number) => {
	if ((time /= duration / 2) < 1) return (final / 2) * time * time * time + initial;
	return (final / 2) * ((time -= 2) * time * time + 2) + initial;
};

export const updateTransitionProgress = (
	transitionTimeRef: React.MutableRefObject<number>,
	slideIndexRef: React.MutableRefObject<number>,
	isTransitioningRef: React.MutableRefObject<boolean>,
	transitionProgressRef: React.MutableRefObject<number>,
	transitionDirectionRef: React.MutableRefObject<number>
) => {
	if (!isTransitioningRef.current) return;
	if (transitionTimeRef.current >= DURATION) {
		isTransitioningRef.current = false; // Stop transition
		slideIndexRef.current += transitionDirectionRef.current; // Increment/decrement slide index
		transitionProgressRef.current = 0;
		transitionTimeRef.current = 0;
		return;
	}

	if (transitionDirectionRef.current === 1) {
		transitionProgressRef.current = easeInOutCubic(transitionTimeRef.current, 0, 1, DURATION);
	} else {
		transitionProgressRef.current = easeInOutCubic(1 - transitionTimeRef.current, 0, 1, DURATION);
	}

	transitionTimeRef.current += SPEED;
};
