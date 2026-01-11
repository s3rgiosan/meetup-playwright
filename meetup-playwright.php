<?php
/**
 * Plugin Name:       Meetup Playwright + AI
 * Description:       Demo plugin for Playwright + AI talk
 * Plugin URI:        https://github.com/s3rgiosan/meetup-playwright
 * Requires at least: 6.7
 * Requires PHP:      8.2
 * Version:           1.0.0
 * Author:            Sérgio Santos
 * Author URI:        https://s3rgiosan.dev/?utm_source=wp-plugins&utm_medium=meetup-playwright&utm_campaign=author-uri
 * License:           GPL-3.0-or-later
 * License URI:       https://spdx.org/licenses/GPL-3.0-or-later.html
 * Update URI:        https://s3rgiosan.dev/
 * GitHub Plugin URI: https://github.com/s3rgiosan/meetup-playwright
 * Text Domain:       meetup-playwright
 *
 * @package meetup-playwright
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'init',
	function () {
		register_block_type( __DIR__ . '/build/meetup-info' );
	}
);
