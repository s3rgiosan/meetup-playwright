/**
 * External dependencies
 */
import * as fs from 'fs';
import * as path from 'path';
import type {
	Reporter,
	TestCase,
	TestResult,
	FullResult,
} from '@playwright/test/reporter';

/**
 * Statistical helper functions
 */
function median( values: number[] ): number {
	const sorted = [ ...values ].sort( ( a, b ) => a - b );
	const mid = Math.floor( sorted.length / 2 );
	return sorted.length % 2 !== 0
		? sorted[ mid ]
		: ( sorted[ mid - 1 ] + sorted[ mid ] ) / 2;
}

function percentile( values: number[], p: number ): number {
	const sorted = [ ...values ].sort( ( a, b ) => a - b );
	const index = Math.ceil( ( p / 100 ) * sorted.length ) - 1;
	return sorted[ Math.max( 0, index ) ];
}

function stats( values: number[] ) {
	if ( values.length === 0 ) {
		return null;
	}
	return {
		count: values.length,
		min: Math.min( ...values ),
		max: Math.max( ...values ),
		median: median( values ),
		q25: percentile( values, 25 ),
		q75: percentile( values, 75 ),
	};
}

interface CuratedResults {
	[ metric: string ]: ReturnType< typeof stats >;
}

/**
 * Performance Reporter
 *
 * Custom Playwright reporter that aggregates performance metrics from tests
 * and outputs them as JSON files with statistical analysis.
 */
class PerformanceReporter implements Reporter {
	private results: Record< string, Record< string, number[] > > = {};
	private artifactsPath: string;

	constructor() {
		this.artifactsPath =
			process.env.WP_ARTIFACTS_PATH ||
			path.join( process.cwd(), 'artifacts/performance-results' );

		if ( ! fs.existsSync( this.artifactsPath ) ) {
			fs.mkdirSync( this.artifactsPath, { recursive: true } );
		}
	}

	onTestEnd( test: TestCase, result: TestResult ): void {
		for ( const attachment of result.attachments ) {
			if (
				attachment.name.endsWith( '-results' ) &&
				attachment.contentType === 'application/json' &&
				attachment.body
			) {
				const data = JSON.parse( attachment.body.toString() );
				const suiteName = attachment.name.replace( '-results', '' );
				this.results[ suiteName ] = {
					...( this.results[ suiteName ] || {} ),
					...data,
				};
			}
		}
	}

	onEnd( result: FullResult ): void {
		const timestamp = new Date().toISOString().replace( /[:.]/g, '-' );
		const resultsId = process.env.RESULTS_ID || timestamp;

		const rawPath = path.join(
			this.artifactsPath,
			`${ resultsId }.performance-results.raw.json`
		);
		fs.writeFileSync( rawPath, JSON.stringify( this.results, null, 2 ) );

		const curated: Record< string, CuratedResults > = {};
		for ( const [ suite, metrics ] of Object.entries( this.results ) ) {
			curated[ suite ] = {};
			for ( const [ metric, values ] of Object.entries( metrics ) ) {
				if ( values.length > 0 ) {
					curated[ suite ][ metric ] = stats( values );
				}
			}
		}

		const curatedPath = path.join(
			this.artifactsPath,
			`${ resultsId }.performance-results.json`
		);
		fs.writeFileSync( curatedPath, JSON.stringify( curated, null, 2 ) );

		console.log( '\n=== Performance Results Summary ===' );
		console.log( `Status: ${ result.status }\n` );

		// Performance budgets for Core Web Vitals
		const budgets: Record< string, number > = {
			timeToFirstByte: 800,
			firstContentfulPaint: 1800,
			largestContentfulPaint: 2500,
			cumulativeLayoutShift: 0.1,
		};

		for ( const [ suite, metrics ] of Object.entries( curated ) ) {
			console.log( `\n${ suite }:` );
			console.log( '─'.repeat( 60 ) );

			// Group metrics by category
			const coreWebVitals = [
				'timeToFirstByte',
				'firstContentfulPaint',
				'largestContentfulPaint',
				'cumulativeLayoutShift',
			];
			const wordpressMetrics = [
				'wordpressTotal',
				'wordpressDb',
				'wordpressCache',
			];
			const editorMetrics = [
				'blockInsertionTime',
				'blockRenderTime',
				'settingsPanelOpenTime',
			];
			const blockMetrics = [
				'blockInsertionTime',
				'blockRenderTime',
				'attributeEditTime',
			];

			// Core Web Vitals
			const hasCWV = coreWebVitals.some( ( m ) => metrics[ m ] );
			if ( hasCWV ) {
				console.log( '\nCore Web Vitals:' );
				for ( const metric of coreWebVitals ) {
					const stat = metrics[ metric ];
					if ( stat ) {
						const budget = budgets[ metric ];
						const status = budget
							? stat.median <= budget
								? '✅'
								: stat.median <= budget * 1.2
								? '⚠️'
								: '❌'
							: '';
						const unit = metric === 'cumulativeLayoutShift' ? '' : 'ms';
						const variation = (
							( ( stat.q75 - stat.q25 ) / stat.median ) *
							100
						).toFixed( 1 );
						console.log(
							`  ${ status } ${ metric }: ${ stat.median.toFixed( 2 ) }${ unit } (${ stat.min.toFixed( 2 ) }-${ stat.max.toFixed( 2 ) }, IQR: ±${ variation }%)`
						);
						if ( budget ) {
							console.log(
								`    Budget: ${ budget }${ unit }, Status: ${ stat.median <= budget ? 'PASS' : 'FAIL' }`
							);
						}
					}
				}
			}

			// WordPress-specific metrics
			const hasWPMetrics = wordpressMetrics.some( ( m ) => metrics[ m ] );
			if ( hasWPMetrics ) {
				console.log( '\nWordPress Server-Timing:' );
				for ( const metric of wordpressMetrics ) {
					const stat = metrics[ metric ];
					if ( stat ) {
						const variation = (
							( ( stat.q75 - stat.q25 ) / stat.median ) *
							100
						).toFixed( 1 );
						console.log(
							`  ${ metric }: ${ stat.median.toFixed( 2 ) }ms (${ stat.min.toFixed( 2 ) }-${ stat.max.toFixed( 2 ) }, IQR: ±${ variation }%)`
						);
					}
				}
			}

			// Editor performance metrics
			const hasEditorMetrics = editorMetrics.some( ( m ) => metrics[ m ] );
			if ( hasEditorMetrics ) {
				console.log( '\nEditor Performance:' );
				for ( const metric of editorMetrics ) {
					const stat = metrics[ metric ];
					if ( stat ) {
						const variation = (
							( ( stat.q75 - stat.q25 ) / stat.median ) *
							100
						).toFixed( 1 );
						console.log(
							`  ${ metric }: ${ stat.median.toFixed( 2 ) }ms (${ stat.min.toFixed( 2 ) }-${ stat.max.toFixed( 2 ) }, IQR: ±${ variation }%)`
						);
					}
				}
			}

			// Block-specific metrics
			const hasBlockMetrics = blockMetrics.some( ( m ) => metrics[ m ] );
			if ( hasBlockMetrics ) {
				console.log( '\nBlock Performance:' );
				for ( const metric of blockMetrics ) {
					const stat = metrics[ metric ];
					if ( stat ) {
						const variation = (
							( ( stat.q75 - stat.q25 ) / stat.median ) *
							100
						).toFixed( 1 );
						console.log(
							`  ${ metric }: ${ stat.median.toFixed( 2 ) }ms (${ stat.min.toFixed( 2 ) }-${ stat.max.toFixed( 2 ) }, IQR: ±${ variation }%)`
						);
					}
				}
			}

			// Other metrics
			const otherMetrics = Object.keys( metrics ).filter(
				( m ) =>
					!coreWebVitals.includes( m ) &&
					!wordpressMetrics.includes( m ) &&
					!editorMetrics.includes( m ) &&
					!blockMetrics.includes( m )
			);
			if ( otherMetrics.length > 0 ) {
				console.log( '\nOther Metrics:' );
				for ( const metric of otherMetrics ) {
					const stat = metrics[ metric ];
					if ( stat ) {
						const variation = (
							( ( stat.q75 - stat.q25 ) / stat.median ) *
							100
						).toFixed( 1 );
						const unit = metric.includes( 'Time' ) ||
							metric.includes( 'Paint' ) ||
							metric.includes( 'Response' ) ||
							metric.includes( 'Loaded' )
							? 'ms'
							: '';
						console.log(
							`  ${ metric }: ${ stat.median.toFixed( 2 ) }${ unit } (${ stat.min.toFixed( 2 ) }-${ stat.max.toFixed( 2 ) }, IQR: ±${ variation }%)`
						);
					}
				}
			}
		}

		console.log( '\n' + '═'.repeat( 60 ) );
		console.log( `Raw results: ${ rawPath }` );
		console.log( `Curated results: ${ curatedPath }` );
	}
}

export default PerformanceReporter;
