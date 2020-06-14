import * as React from 'react';
import cx from 'classnames';
import { glSupported } from '../utils/general';
import Water from './Water/Water';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import Loader from './Loader/Loader';
import styles from './app.module.scss';

const App = () => {
	const [activePageIndex, setActivePageIndex] = React.useState<number>(0);
	const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
	if (!glSupported()) return <div>'WebGL is not supported on this device.'</div>;

	React.useEffect(() => {
		setTimeout(() => {
			setIsLoaded(true);
		}, 0);
	}, []);

	return (
		<div className={styles.app}>
			{isLoaded && (
				<>
					{/* <Header /> */}
					<Water />
					{/* <Footer /> */}
				</>
			)}
			{!isLoaded && <Loader />}
		</div>
	);
};

export default App;
