/**
 * External dependencies
 */
import { fileURLToPath } from 'url';

/**
 * `defineConfig` - Playwright helper that provides TypeScript autocomplete
 *                  and validation for configuration options.
 * `devices` - Pre-configured device profiles (viewport, user agent, etc.)
 *             for common browsers and devices like 'Desktop Chrome', 'iPhone 14'.
 */
import { defineConfig, devices } from '@playwright/test';

/**
 * WordPress dependencies
 */
/**
 * `baseConfig` - WordPress's default Playwright configuration from @wordpress/scripts.
 *
 * This provides sensible defaults for WordPress E2E testing:
 * - testDir: './specs' (where test files live)
 * - baseURL: process.env.WP_BASE_URL || 'http://localhost:8889'
 * - storageState: path to authenticated session file
 * - timeout settings, retry logic, reporter configuration
 *
 * We spread this config and override only what we need to customize.
 */
// @ts-ignore
import baseConfig from '@wordpress/scripts/config/playwright.config.js';

/**
 * Playwright Configuration
 */
const config = defineConfig({
  /**
   * Spread the WordPress base configuration.
   *
   * This includes all WordPress-recommended defaults:
   * - testDir, outputDir, snapshotDir paths
   * - baseURL from WP_BASE_URL env var (default: http://localhost:8889)
   * - storageState path for authenticated sessions
   * - Timeouts, retries, and reporter settings
   */
  ...baseConfig,

  /**
   * Global Setup - runs ONCE before all tests.
   *
   * Points to our custom global-setup.ts file that:
   * 1. Authenticates with WordPress REST API
   * 2. Saves session to storageState file
   * 3. Resets test environment (deletes posts, activates theme, etc.)
   */
  globalSetup: fileURLToPath(
    new URL('./config/global-setup.ts', 'file:' + __filename).href
  ),

  reporter: [
    ['list'],
    ['html']
  ],

  /**
   * Projects - Define which browsers/devices to test against.
   *
   * Each project runs all tests with its specific configuration.
   * You can add multiple projects to test across browsers:
   * - 'chromium' (Chrome, Edge)
   * - 'firefox'
   * - 'webkit' (Safari)
   * - Mobile devices like 'iPhone 14', 'Pixel 5'
   */
  projects: [
    {
      /**
       * Project name - appears in test reports and CLI output.
       * Use descriptive names like 'Desktop Chrome' or 'Mobile Safari'.
       */
      name: 'chromium',

      /**
       * Device configuration from Playwright's device registry.
       *
       * `devices['Desktop Chrome']` provides:
       * - viewport: { width: 1280, height: 720 }
       * - userAgent: Chrome's user agent string
       * - deviceScaleFactor: 1
       * - isMobile: false
       * - hasTouch: false
       *
       * Spread syntax allows adding/overriding specific options.
       */
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

export default config;
