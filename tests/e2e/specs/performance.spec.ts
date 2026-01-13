/**
 * WordPress dependencies
 */
import { test, Metrics } from '@wordpress/e2e-test-utils-playwright';

/**
 * Results storage
 */
const frontendResults: Record< string, number[] > = {
	timeToFirstByte: [],
	largestContentfulPaint: [],
	lcpMinusTtfb: [],
	cumulativeLayoutShift: [],
	firstContentfulPaint: [],
	serverResponse: [],
	domContentLoaded: [],
	loaded: [],
};

const editorResults: Record< string, number[] > = {
	serverResponse: [],
	firstContentfulPaint: [],
	domContentLoaded: [],
	loaded: [],
	blockInsertionTime: [],
	blockRenderTime: [],
	settingsPanelOpenTime: [],
};

const blockPerformanceResults: Record< string, number[] > = {
	blockInsertionTime: [],
	blockRenderTime: [],
	attributeEditTime: [],
};

// Store test post URL across tests
let testPostUrl: string | null = null;

/**
 * Frontend Performance Tests
 *
 * Measures Core Web Vitals and loading performance for pages
 * containing the Meetup Info block.
 */
test.describe( 'Frontend Performance', () => {
	test.afterAll( async ( { requestUtils }, testInfo ) => {
		await testInfo.attach( 'frontend-results', {
			body: JSON.stringify( frontendResults, null, 2 ),
			contentType: 'application/json',
		} );
		await requestUtils.deleteAllPosts();
	} );

	// Create test post in first test, reuse URL in subsequent tests
	test( 'Setup: Create test post with block', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { title: 'Performance Test Post' } );
		await editor.insertBlock( { name: 'meetup/info' } );
		await editor.publishPost();

		testPostUrl = await page
			.getByRole( 'link', { name: 'View Post', exact: true } )
			.getAttribute( 'href' );

		// Verify block renders on frontend
		await page.goto( testPostUrl! );
		await page.locator( '[data-testid="meetup-info"]' ).waitFor();
	} );

	const iterations = 10;

	for ( let i = 1; i <= iterations; i++ ) {
		test( `Measure Web Vitals (${ i } of ${ iterations })`, async ( {
			page,
		} ) => {
			test.skip( ! testPostUrl, 'Test post not created' );

			// Create metrics instance BEFORE navigation to capture performance events
			const metrics = new Metrics( { page } );

			// Navigate and wait for page to be ready
			await page.goto( testPostUrl!, { waitUntil: 'networkidle' } );
			await page.locator( '[data-testid="meetup-info"]' ).waitFor();

			// Wait for performance metrics to be available
			// LCP might need additional time to be calculated
			await page.waitForTimeout( 500 );

			// Collect metrics - wrap in Promise.race with timeout to prevent hanging
			const metricsTimeout = 10000; // 10 second timeout per metric
			const timeoutPromise = ( timeout: number ) =>
				new Promise( ( _, reject ) =>
					setTimeout( () => reject( new Error( 'Metrics timeout' ) ), timeout )
				);

			const ttfb = await Promise.race( [
				metrics.getTimeToFirstByte(),
				timeoutPromise( metricsTimeout ),
			] ).catch( () => 0 ) as number;

			const lcp = await Promise.race( [
				metrics.getLargestContentfulPaint(),
				timeoutPromise( metricsTimeout ),
			] ).catch( () => 0 ) as number;

			const cls = await Promise.race( [
				metrics.getCumulativeLayoutShift(),
				timeoutPromise( metricsTimeout ),
			] ).catch( () => 0 ) as number;

			const loadingDurations = await Promise.race( [
				metrics.getLoadingDurations(),
				timeoutPromise( metricsTimeout ),
			] ).catch( () => ( {
				firstContentfulPaint: 0,
				serverResponse: 0,
				domContentLoaded: 0,
				loaded: 0,
			} ) ) as {
				firstContentfulPaint: number;
				serverResponse: number;
				domContentLoaded: number;
				loaded: number;
			};

			frontendResults.timeToFirstByte.push( ttfb );
			frontendResults.largestContentfulPaint.push( lcp );
			frontendResults.lcpMinusTtfb.push( lcp - ttfb );
			frontendResults.cumulativeLayoutShift.push( cls );
			frontendResults.firstContentfulPaint.push(
				loadingDurations.firstContentfulPaint
			);
			frontendResults.serverResponse.push(
				loadingDurations.serverResponse
			);
			frontendResults.domContentLoaded.push(
				loadingDurations.domContentLoaded
			);
			frontendResults.loaded.push( loadingDurations.loaded );

			try {
				const serverTiming = await metrics.getServerTiming();
				for ( const [ key, value ] of Object.entries( serverTiming ) ) {
					frontendResults[ key ] ??= [];
					frontendResults[ key ].push( value as number );
				}

				// WordPress-specific Server-Timing metrics
				if ( serverTiming.total ) {
					frontendResults.wordpressTotal ??= [];
					frontendResults.wordpressTotal.push( serverTiming.total );
				}
				if ( serverTiming.wpDb ) {
					frontendResults.wordpressDb ??= [];
					frontendResults.wordpressDb.push( serverTiming.wpDb );
				}
				if ( serverTiming.wpCache ) {
					frontendResults.wordpressCache ??= [];
					frontendResults.wordpressCache.push( serverTiming.wpCache );
				}
			} catch {
				// Server-Timing may not be available
			}
		} );
	}
} );

/**
 * Editor Performance Tests
 *
 * Measures block editor loading performance when working with
 * the Meetup Info block.
 */
test.describe( 'Editor Performance', () => {
	test.afterAll( async ( { requestUtils }, testInfo ) => {
		await testInfo.attach( 'editor-results', {
			body: JSON.stringify( editorResults, null, 2 ),
			contentType: 'application/json',
		} );
		await requestUtils.deleteAllPosts();
	} );

	const iterations = 5;

	for ( let i = 1; i <= iterations; i++ ) {
		test( `Measure Editor Load (${ i } of ${ iterations })`, async ( {
			admin,
			editor,
			page,
		} ) => {
			// Create metrics instance with current page
			const metrics = new Metrics( { page } );

			await admin.createNewPost();

			// Measure block insertion time using browser performance timing
			const blockInsertStart = await page.evaluate( () => performance.now() );
			await editor.insertBlock( { name: 'meetup/info' } );
			const blockInsertEnd = await page.evaluate( () => performance.now() );
			const blockInsertDuration = blockInsertEnd - blockInsertStart;

			// Measure block render time using browser performance timing
			const blockRenderStart = await page.evaluate( () => performance.now() );
			await editor.canvas.locator( '.meetup-info' ).waitFor();
			const blockRenderEnd = await page.evaluate( () => performance.now() );
			const blockRenderTime = blockRenderEnd - blockRenderStart;

			const loadingDurations = await metrics.getLoadingDurations();

			editorResults.serverResponse.push(
				loadingDurations.serverResponse
			);
			editorResults.firstContentfulPaint.push(
				loadingDurations.firstContentfulPaint
			);
			editorResults.domContentLoaded.push(
				loadingDurations.domContentLoaded
			);
			editorResults.loaded.push( loadingDurations.loaded );
			editorResults.blockInsertionTime.push( blockInsertDuration );
			editorResults.blockRenderTime.push( blockRenderTime );

			// Measure settings panel open time using browser performance timing
			try {
				await editor.canvas.locator( '.meetup-info' ).click();
				const settingsStart = await page.evaluate( () => performance.now() );
				// Use a more specific selector to avoid matching multiple Settings buttons
				const settingsButton = page
					.getByRole( 'button', { name: 'Settings', pressed: false, exact: true } )
					.first();
				if ( await settingsButton.isVisible().catch( () => false ) ) {
					await settingsButton.click();
					await page
						.getByRole( 'button', { name: 'Meetup Settings' } )
						.waitFor();
				}
				const settingsEnd = await page.evaluate( () => performance.now() );
				editorResults.settingsPanelOpenTime.push(
					settingsEnd - settingsStart
				);
			} catch {
				// Settings panel timing is optional
			}
		} );
	}
} );

/**
 * Block-Specific Performance Tests
 *
 * Measures performance of block-specific operations like insertion,
 * rendering, and attribute editing.
 */
test.describe( 'Block Performance', () => {
	test.afterAll( async ( { requestUtils }, testInfo ) => {
		await testInfo.attach( 'block-performance-results', {
			body: JSON.stringify( blockPerformanceResults, null, 2 ),
			contentType: 'application/json',
		} );
		await requestUtils.deleteAllPosts();
	} );

	const iterations = 5;

	for ( let i = 1; i <= iterations; i++ ) {
		test( `Measure Block Operations (${ i } of ${ iterations })`, async ( {
			admin,
			editor,
			page,
		} ) => {
			await admin.createNewPost();

			// Measure block insertion time using browser performance timing
			const insertStart = await page.evaluate( () => performance.now() );
			await editor.insertBlock( { name: 'meetup/info' } );
			const insertEnd = await page.evaluate( () => performance.now() );
			const insertDuration = insertEnd - insertStart;
			blockPerformanceResults.blockInsertionTime.push( insertDuration );

			// Measure block render time using browser performance timing
			const renderStart = await page.evaluate( () => performance.now() );
			await editor.canvas.locator( '.meetup-info' ).waitFor();
			const renderEnd = await page.evaluate( () => performance.now() );
			const renderDuration = renderEnd - renderStart;
			blockPerformanceResults.blockRenderTime.push( renderDuration );

			// Measure attribute edit time using browser performance timing
			await editor.canvas.locator( '.meetup-info' ).click();
			// Use .first() to handle multiple Settings buttons (e.g., "Close Settings" and sidebar "Settings")
			const settingsButton = page
				.getByRole( 'button', { name: 'Settings', pressed: false, exact: true } )
				.first();
			if ( await settingsButton.isVisible().catch( () => false ) ) {
				await settingsButton.click();
			}

			const editStart = await page.evaluate( () => performance.now() );
			const titleInput = page
				.getByRole( 'textbox', { name: 'Title' } )
				.first();
			await titleInput.fill( 'Performance Test Title' );
			await titleInput.blur();
			await editor.canvas
				.locator( '.meetup-info__title' )
				.filter( { hasText: 'Performance Test Title' } )
				.waitFor();
			const editEnd = await page.evaluate( () => performance.now() );
			const editDuration = editEnd - editStart;
			blockPerformanceResults.attributeEditTime.push( editDuration );
		} );
	}
} );
