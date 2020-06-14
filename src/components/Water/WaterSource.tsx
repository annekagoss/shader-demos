import * as React from 'react';
import cx from 'classnames';
import { UniformSettings, RGBA } from '../../../types';
import { parseColorFromString, luminanceFromRGBA } from '../../utils/color';
import styles from './WaterCanvas.module.scss';

interface SourceElementProps {
	isCursorCopy?: boolean;
}

const SourceElement = React.forwardRef(({ isCursorCopy = false }: SourceElementProps, ref: React.RefObject<HTMLDivElement>) => {
	return <div className={cx(styles.canvasForeground, styles.sourceElement, isCursorCopy && styles.cursorCopy)} ref={ref}></div>;
});

const WaterSource = React.forwardRef((ref) => {
	const { sourceRef, cursorRef }: Record<string, React.RefObject<HTMLDivElement>> = ref;
	return (
		<>
			<SourceElement ref={sourceRef} />
			<SourceElement ref={cursorRef} isCursorCopy={true} />
		</>
	);
});

export default WaterSource;
