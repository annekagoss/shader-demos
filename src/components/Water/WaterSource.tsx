import * as React from 'react';
import cx from 'classnames';
import { UniformSettings, RGBA } from '../../../types';
import { parseColorFromString, luminanceFromRGBA } from '../../utils/color';
import styles from './WaterCanvas.module.scss';

interface Props {
	content: React.ReactNode;
}

interface SourceElementProps {
	isCursorCopy?: boolean;
	children: React.ReactNode;
}

const SourceElement = React.forwardRef(({ children, isCursorCopy = false }: SourceElementProps, ref: React.RefObject<HTMLDivElement>) => {
	return (
		<div className={cx(styles.canvasForeground, styles.sourceElement, isCursorCopy && styles.cursorCopy)} ref={ref}>
			{children}
		</div>
	);
});

const WaterSource = React.forwardRef(({ content }: Props, ref) => {
	const { sourceRef, cursorRef }: Record<string, React.RefObject<HTMLDivElement>> = ref;
	return (
		<>
			<SourceElement ref={sourceRef}>{content}</SourceElement>
			<SourceElement ref={cursorRef} isCursorCopy={true}>
				{content}
			</SourceElement>
		</>
	);
});

export default WaterSource;
