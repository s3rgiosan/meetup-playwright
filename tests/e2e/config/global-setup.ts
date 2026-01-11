/**
 * External dependencies
 */
/**
 * `request` - Playwright's API for making HTTP requests without a browser.
 * Used here to authenticate with WordPress REST API before tests run.
 */
import { request } from '@playwright/test';

/**
 * `FullConfig` - TypeScript type representing Playwright's complete configuration object.
 * Provides type safety for accessing config properties like projects, baseURL, etc.
 */
import type { FullConfig } from '@playwright/test';

/**
 * WordPress dependencies
 */
/**
 * `RequestUtils` - WordPress utility class for interacting with the WP REST API.
 * Provides methods for authentication, content management, and test environment setup.
 */
import { RequestUtils } from '@wordpress/e2e-test-utils-playwright';

/**
 * Global Setup Function
 *
 * This function runs ONCE before all test files execute.
 * It authenticates with WordPress and prepares a clean test environment.
 *
 * @param {FullConfig} config - Playwright's full configuration object,
 *                              containing all projects, settings, and options.
 */
async function globalSetup(config: FullConfig) {
    /**
     * Extract configuration from the first project.
     *
     * `storageState` - Path to a JSON file where authenticated session data
     *                  (cookies, localStorage) will be saved and reused by tests.
     * `baseURL` - The WordPress site URL (e.g., 'http://localhost:8889').
     */
    const { storageState, baseURL } = config.projects[0].use;

    /**
     * Ensure storageState is a string path, not an object.
     * Playwright allows storageState to be either a path string or an object,
     * but RequestUtils expects a file path for saving authentication state.
     */
    const storageStatePath =
        typeof storageState === 'string' ? storageState : undefined;

    /**
     * Create a new Playwright request context.
     *
     * This is a lightweight HTTP client (no browser needed) configured
     * with the WordPress base URL. All requests will be relative to this URL.
     */
    const requestContext = await request.newContext({
        baseURL,
    });

    /**
     * Initialize WordPress RequestUtils.
     *
     * This utility wraps the Playwright request context and adds
     * WordPress-specific functionality like REST API authentication,
     * nonce handling, and content management methods.
     *
     * `storageStatePath` tells it where to save the authenticated session.
     */
    const requestUtils = new RequestUtils(requestContext, {
        storageStatePath,
    });

    /**
     * Authenticate with WordPress REST API.
     *
     * `setupRest()` performs the following:
     * 1. Logs in to WordPress using credentials from environment variables
     *    (WP_USERNAME and WP_PASSWORD, defaults: 'admin' / 'password')
     * 2. Obtains a REST API nonce for authenticated requests
     * 3. Saves cookies and session data to the storageState file
     *
     * After this, all tests can reuse the authenticated session without
     * logging in again, making tests faster.
     */
    await requestUtils.setupRest();

    /**
     * Reset the test environment to a clean state.
     *
     * Running these in parallel (Promise.all) for speed.
     * This ensures each test run starts with predictable conditions.
     */
    await Promise.all([
        /**
         * Activate the Twenty Twenty-Five theme.
         */
        requestUtils.activateTheme('twentytwentyfive'),

        /**
         * Delete all posts using REST API.
         */
        requestUtils.deleteAllPosts(),

        /**
         * Delete all blocks using REST API.
         */
        requestUtils.deleteAllBlocks(),

        /**
         * Reset user preferences.
         */
        requestUtils.resetPreferences(),
    ]);
}

export default globalSetup;
