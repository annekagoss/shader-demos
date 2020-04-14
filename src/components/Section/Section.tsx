import * as React from 'react';
import cx from 'classnames';
import styles from './Section.module.scss';
import { UniformSettings } from '../../../types';
import ShaderText from '../ShaderText/ShaderText';
import Inputs from '../Inputs/Inputs';

interface Props {
	children: React.ReactNode;
	notes?: string;
	image?: string;
	title: string;
	fullScreen?: boolean;
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSettings>;
	attributes: any;
}

const Section = ({
	children,
	notes = ``,
	image,
	title,
	fullScreen,
	fragmentShader,
	vertexShader,
	uniforms,
	attributes,
}: Props) => (
	<div className={cx(styles.root, fullScreen && styles.fullScreen)}>
		<div className={styles.title}>{title}</div>
		<div className={styles.contentWrapper}>
			{children}
			<div className={styles.textWrapper}>
				<ShaderText
					fragmentShader={fragmentShader}
					vertexShader={vertexShader}
				/>
				<Inputs uniforms={uniforms} attributes={attributes} />
			</div>
		</div>
		<div className={styles.notes}>{notes}</div>
		{!!image && <img src={image} className={styles.image} />}
	</div>
);

export default Section;
