import * as React from 'react';
import cx from 'classnames';
import { glSupported } from '../utils/general';
import FormPage from '../pages/FormPage';
import MotionPage from '../pages/MotionPage';
import DepthPage from '../pages/DepthPage';
import InteractionPage from '../pages/InteractionPage';
import TransitionPage from '../pages/TransitionPage';
import DOMRasterizationPage from '../pages/DOMRasterizationPage';
import styles from './app.module.scss';

const App = () => {
	const [activePageIndex, setActivePageIndex] = React.useState<number>(5);
	if (!glSupported())
		return <div>'WebGL is not supported on this device.'</div>;

	return (
		<div className={styles.app}>
			<nav className={styles.navigation}>
				<ul>
					<div
						className={cx(
							styles.navItem,
							activePageIndex === 0 && styles.active
						)}
						onClick={() => {
							setActivePageIndex(0);
						}}
					>
						0. Form
					</div>
					<div
						className={cx(
							styles.navItem,
							activePageIndex === 1 && styles.active
						)}
						onClick={() => {
							setActivePageIndex(1);
						}}
					>
						1. Motion
					</div>
					<div
						className={cx(
							styles.navItem,
							activePageIndex === 2 && styles.active
						)}
						onClick={() => {
							setActivePageIndex(2);
						}}
					>
						2. Depth
					</div>
					<div
						className={cx(
							styles.navItem,
							activePageIndex === 3 && styles.active
						)}
						onClick={() => {
							setActivePageIndex(3);
						}}
					>
						3. Interaction
					</div>
					<div
						className={cx(
							styles.navItem,
							activePageIndex === 4 && styles.active
						)}
						onClick={() => {
							setActivePageIndex(4);
						}}
					>
						4. Transition
					</div>
					<div
						className={cx(
							styles.navItem,
							activePageIndex === 5 && styles.active
						)}
						onClick={() => {
							setActivePageIndex(5);
						}}
					>
						5. DOM Rasterization
					</div>
				</ul>
			</nav>
			<div className={styles.PagesContainer}>
				<FormPage isActive={activePageIndex === 0} />
				<MotionPage isActive={activePageIndex === 1} />
				<DepthPage isActive={activePageIndex === 2} />
				<InteractionPage isActive={activePageIndex === 3} />
				<TransitionPage isActive={activePageIndex === 4} />
				<DOMRasterizationPage isActive={activePageIndex === 5} />
			</div>
		</div>
	);
};

export default App;
