/**
 * External dependencies
 */
import Head from 'next/head';
import { useState, useMemo, useEffect } from 'react';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import Input from '@components/input';
import Flex, { FlexBlock } from '@components/flex';
import Text from '@components/text';
import Code from '@components/code';
import clampBuilder, { clampHeightBuilder } from '@utils/clamp-builder';
import { hasSameKeys } from '@utils/objects';

const App = styled.main`
	align-items: center;
	display: flex;
	min-height: calc(100vh - 4rem);
	padding: 2rem 2rem 1rem;
	text-align: center;
	width: 100%;
`;

const Footer = styled.footer`
	height: 4rem;
	display: flex;
	justify-content: center;
	align-items: center;

	& a {
		color: var(--foreground100);
		transition: color 100ms;

		&:hover {
			color: var(--foreground);
		}
	}

	& svg {
		fill: currentColor;
		height: 24px;
		width: 24px;
		vertical-align: bottom;
	}
`;

const SettingsRow = styled(Flex)`
	margin-bottom: 1.25rem;
`;

const Settings = styled.div`
	max-width: 728px;
	margin: clamp(3rem, 0.5rem + 8vw, 4rem) auto;
`;

const localStorageKey = 'clampFontSizeConfig';
const initialConfig = {
	root: '16',
	minWidth: '500px',
	maxWidth: '900px',
	minFontSize: '16px',
	maxFontSize: '48px',
};
const initialHeightConfig = {
	root: '16',
	minHeight: '340px',
	maxHeight: '800px',
	minFontSize: '16px',
	maxFontSize: '48px',
};

export default function Home(): JSX.Element {
	const [config, setConfig] = useState(initialConfig);
	const [heightConfig, setHeightConfig] = useState(initialHeightConfig);
	const [calcType, setCalcType] = useState('width');

	useEffect(() => {
		const savedConfig = localStorage.getItem(localStorageKey);
		const searchParams = new URLSearchParams(window.location.search);
		const config = searchParams.get('config');

		if (config && !Array.isArray(config)) {
			const encoded = decodeURIComponent(config);
			try {
				const buf = Buffer.from(encoded, 'base64').toString('binary');
				setConfig(JSON.parse(buf));
			} catch {
				// Do nothing
			}
		} else if (savedConfig !== null) {
			try {
				const parsedConfig = JSON.parse(savedConfig);

				if (hasSameKeys(parsedConfig, initialConfig)) {
					setConfig(JSON.parse(savedConfig));
				}
			} catch {
				// Do nothing
			}
		}
	}, []);

	useEffect(() => {
		// Save in localstorage
		localStorage.setItem(localStorageKey, JSON.stringify(config));

		// Update url
		const buf = Buffer.from(JSON.stringify(config), 'utf8');
		const urlConfig = encodeURIComponent(buf.toString('base64'));
		history.replaceState(null, '', `?config=${urlConfig}`);
	}, [config]);

	function handleChange(prop: string, value: string) {
		if (calcType === 'width') {
			setConfig((conf) => ({
				...conf,
				[prop]: value,
			}));
		} else {
			setHeightConfig((conf) => ({
				...conf,
				[prop]: value,
			}));
		}
	}

	const clamp = useMemo(() => clampBuilder(config), [config]);
	const clampHeight = useMemo(
		() => clampHeightBuilder(heightConfig),
		[heightConfig],
	);

	return (
		<>
			<Head>
				<title>Font-size clamp() generator</title>
				<meta
					name="description"
					content="Generate linearly scale font-size with clamp()"
				/>
			</Head>

			<App>
				<FlexBlock>
					<header>
						<Text variant="title" as="h1">
							Font-size Clamp Generator
						</Text>
						<Text mt={0.5}>
							Generate linearly scale font-size with clamp() For
							Tailwind
						</Text>
					</header>
					<main>
						<Settings>
							<SettingsRow gap={6}>
								<FlexBlock>
									<Input
										id="min-width"
										label={
											calcType === 'width'
												? 'Minimum viewport width'
												: 'Minimum viewport height'
										}
										value={
											calcType === 'width'
												? config.minWidth
												: heightConfig.minHeight
										}
										type="number"
										onChange={(value) =>
											calcType === 'width'
												? handleChange(
														'minWidth',
														value,
													)
												: handleChange(
														'minHeight',
														value,
													)
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<Input
										id="max-width"
										label={
											calcType === 'width'
												? 'Maximum viewport width'
												: 'Maximum viewport height'
										}
										value={
											calcType === 'width'
												? config.maxWidth
												: heightConfig.maxHeight
										}
										type="number"
										onChange={(value) =>
											calcType === 'width'
												? handleChange(
														'maxWidth',
														value,
													)
												: handleChange(
														'maxHeight',
														value,
													)
										}
									/>
								</FlexBlock>
							</SettingsRow>
							<SettingsRow gap={6}>
								<FlexBlock>
									<Input
										id="min-font-size"
										label="Minimum font size"
										type="number"
										value={
											calcType === 'width'
												? config.minFontSize
												: heightConfig.minFontSize
										}
										onChange={(value) =>
											handleChange('minFontSize', value)
										}
									/>
								</FlexBlock>
								<FlexBlock>
									<Input
										id="max-font-size"
										label="Maximum font size"
										value={
											calcType === 'width'
												? config.maxFontSize
												: heightConfig.maxFontSize
										}
										type="number"
										onChange={(value) =>
											handleChange('maxFontSize', value)
										}
									/>
								</FlexBlock>
							</SettingsRow>
							<select
								style={{
									marginLeft: 'auto',
									display: 'block',
								}}
								value={calcType}
								onChange={(value) =>
									setCalcType(value.target.value)
								}
							>
								<option value="width">Width</option>
								<option value="height">Height</option>
							</select>
						</Settings>

						{calcType === 'width' ? (
							<Code code={clamp ? `${clamp}` : ' '} />
						) : (
							<Code code={clampHeight ? `${clampHeight}` : ' '} />
						)}
					</main>
				</FlexBlock>
			</App>
			<Footer>
				<a
					href="https://github.com/walbo/font-size-clamp"
					aria-label="Contribute"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						xmlSpace="preserve"
					>
						<path
							d="M12.01.26c-6.63 0-12 5.37-12 12 0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.28-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.05.14 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.69.83.58 4.76-1.59 8.2-6.08 8.2-11.38 0-6.64-5.37-12.01-12-12.01z"
							fillRule="evenodd"
							clipRule="evenodd"
						/>
					</svg>
				</a>
			</Footer>
		</>
	);
}
