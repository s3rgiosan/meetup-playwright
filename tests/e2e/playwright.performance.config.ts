/**
 * External dependencies
 */
import { fileURLToPath } from 'url';
import { defineConfig, devices } from '@playwright/test';

/**
 * WordPress dependencies
 */
// @ts-ignore
import baseConfig from '@wordpress/scripts/config/playwright.config.js';

/**
 * Performance Test Configuration
 *
 * Dedicated configuration for performance tests with settings optimized
 * for consistent and accurate measurements.
 */
const config = defineConfig( {
	...baseConfig,

	testDir: './specs',
	testMatch: '**/performance.spec.ts',

	reporter: process.env.CI
		? [ [ 'blob' ], [ './config/performance-reporter.ts' ] ]
		: [ [ 'list' ], [ './config/performance-reporter.ts' ] ],

	fullyParallel: false,
	workers: 1,
	retries: 0,
	timeout: 600_000,
	reportSlowTests: null,
	forbidOnly: !! process.env.CI,

	globalSetup: fileURLToPath(
		new URL( './config/global-setup.ts', 'file:' + __filename ).href
	),

	projects: [
		{
			name: 'performance',
			use: {
				...devices[ 'Desktop Chrome' ],
				video: 'off',
				trace: 'off',
			},
		},
	],
} );

export default config;
