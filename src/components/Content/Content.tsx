import * as React from 'react';
import styles from './Content.module.scss';

interface Item {
	Title: string;
	Subtitle: string;
}

const ITEMS: Item[] = [
	{
		Title: 'Item 1',
		Subtitle: 'The subtitle for item 1',
	},
	{
		Title: 'Item 2',
		Subtitle: 'The subtitle for item 2',
	},
	{
		Title: 'Item 3',
		Subtitle: 'The subtitle for item 3',
	},
];

interface Props {
	index: number;
}

const contentGroupStyle = {
	margin: 80,
};

const titleStyle = {
	fontSize: 80,
};

const subtitleStyle = {
	fontSize: 40,
};

const Content = ({ index }: Props) => {
	const currentItem: Item = ITEMS[index];
	return (
		<div style={contentGroupStyle}>
			<div style={titleStyle}>{currentItem.Title}</div>
			<div style={subtitleStyle}>{currentItem.Subtitle}</div>
		</div>
	);
};

export default Content;
