<?php
/**
 * Plugin Name:       NARD Coming Soon
 * Description:       Puts the NARD coming-soon page on the public site. Every other public URL redirects home. Deactivate to bring the shop back.
 * Version:           1.4.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            NARD
 * License:           GPL-2.0-or-later
 * Text Domain:       nard-coming-soon
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function nard_coming_soon_nocache() {
	if ( function_exists( 'nocache_headers' ) ) {
		nocache_headers();
	}

	header( 'Cache-Control: no-store, no-cache, must-revalidate, max-age=0' );
	header( 'Pragma: no-cache' );
	header( 'Expires: 0' );
	header( 'CDN-Cache-Control: no-store' );
	header( 'Cloudflare-CDN-Cache-Control: no-store' );
	header( 'Surrogate-Control: no-store' );
	header( 'Vary: Cookie' );
}

function nard_coming_soon_request_path() {
	$uri  = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '';
	$path = is_string( $uri ) ? wp_parse_url( $uri, PHP_URL_PATH ) : '';
	return is_string( $path ) ? strtolower( $path ) : '';
}

function nard_coming_soon_is_system_request() {
	if ( is_admin() || wp_doing_ajax() || ( function_exists( 'wp_doing_cron' ) && wp_doing_cron() ) ) {
		return true;
	}

	if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST ) ) {
		return true;
	}

	if ( function_exists( 'wp_is_json_request' ) && wp_is_json_request() ) {
		return true;
	}

	if ( isset( $_GET['rest_route'] ) ) {
		return true;
	}

	$path = nard_coming_soon_request_path();
	if ( '' === $path ) {
		return false;
	}

	$parts = array_values( array_filter( explode( '/', trim( $path, '/' ) ), 'strlen' ) );
	if ( array() === $parts ) {
		return false;
	}

	$dirs  = array( 'wp-admin', 'wp-json' );
	$files = array(
		'wp-login.php',
		'wp-signup.php',
		'wp-activate.php',
		'wp-cron.php',
		'xmlrpc.php',
		'admin-ajax.php',
		'admin-post.php',
		'async-upload.php',
	);

	if ( array_intersect( $parts, $dirs ) || in_array( end( $parts ), $files, true ) ) {
		return true;
	}

	$login = wp_parse_url( wp_login_url(), PHP_URL_PATH );
	return is_string( $login ) && untrailingslashit( $path ) === untrailingslashit( strtolower( $login ) );
}

function nard_coming_soon_staff_session() {
	if ( ! is_user_logged_in() ) {
		return false;
	}

	// Preview often lands on the normal page address, with no preview flag left in the URL.
	return current_user_can( 'manage_options' )
		|| current_user_can( 'edit_pages' )
		|| current_user_can( 'edit_posts' )
		|| current_user_can( 'edit_products' )
		|| current_user_can( 'customize' );
}

function nard_coming_soon_bypass() {
	if ( nard_coming_soon_is_system_request() ) {
		return true;
	}

	// Logged-in admins can add ?nard_site=1 to see the normal site.
	if ( isset( $_GET['nard_site'] ) && current_user_can( 'manage_options' ) ) {
		return true;
	}

	// Editors, including Preview and View, see the real site while logged in.
	if ( nard_coming_soon_staff_session() ) {
		return true;
	}

	return false;
}

function nard_coming_soon_is_preview_request() {
	if ( is_preview() || is_customize_preview() ) {
		return true;
	}

	if ( isset( $_GET['customize_changeset_uuid'] ) ) {
		return true;
	}

	if ( isset( $_GET['wp_customize'] ) && is_string( $_GET['wp_customize'] ) && 'on' === strtolower( wp_unslash( $_GET['wp_customize'] ) ) ) {
		return true;
	}

	if ( isset( $_GET['preview_id'] ) || isset( $_GET['preview_nonce'] ) ) {
		return true;
	}

	if ( ! isset( $_GET['preview'] ) || ! is_string( $_GET['preview'] ) ) {
		return false;
	}

	$requested = strtolower( trim( wp_unslash( $_GET['preview'] ) ) );
	return in_array( $requested, array( 'true', '1', 'yes' ), true );
}

function nard_coming_soon_render() {
	// A logged-out preview goes to the login screen, then back to that preview.
	if ( nard_coming_soon_is_preview_request() && ! is_user_logged_in() ) {
		auth_redirect();
	}

	if ( nard_coming_soon_bypass() ) {
		if ( ! nard_coming_soon_is_system_request() ) {
			nard_coming_soon_nocache();
		}
		return;
	}

	$build_dir = plugin_dir_path( __FILE__ ) . 'build/';
	if ( ! file_exists( $build_dir . 'nard-coming-soon.js' ) ) {
		return;
	}

	if ( ! is_front_page() ) {
		nard_coming_soon_nocache();
		wp_safe_redirect( home_url( '/' ), 302 );
		exit;
	}

	$build_url = plugin_dir_url( __FILE__ ) . 'build/';
	$version   = (string) filemtime( $build_dir . 'nard-coming-soon.js' );

	nard_coming_soon_nocache();
	status_header( 200 );
	require plugin_dir_path( __FILE__ ) . 'template.php';
	exit;
}
add_action( 'template_redirect', 'nard_coming_soon_render', 0 );

function nard_coming_soon_block_cache() {
	if ( ! defined( 'DONOTCACHEPAGE' ) ) {
		define( 'DONOTCACHEPAGE', true );
	}
}
add_action( 'init', 'nard_coming_soon_block_cache', 0 );
add_action( 'send_headers', 'nard_coming_soon_nocache' );

function nard_coming_soon_admin_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( $screen && isset( $screen->id ) && 'plugins' !== $screen->id && 'dashboard' !== $screen->id && 'options-reading' !== $screen->id ) {
		return;
	}

	echo '<div class="notice notice-info"><p><strong>NARD Coming Soon is on.</strong> ';
	echo 'Visitors see only the countdown. Shop and cart URLs redirect home. ';
	echo 'While you are logged in, Preview and View open the real page. Log out or use a private window to check the countdown. ';
	echo 'Settings → Reading needs a real homepage. Purge LiteSpeed, WP Super Cache, and Cloudflare after updating. ';
	echo 'Deactivate this plugin when the drop goes live.</p></div>';
}
add_action( 'admin_notices', 'nard_coming_soon_admin_notice' );

// Lets the NARD shop app read the public product list (no API keys) from GitHub Pages.
function nard_coming_soon_allowed_origins( $origins ) {
	$origins[] = 'https://nappyycoder.github.io';
	return $origins;
}
add_filter( 'allowed_http_origins', 'nard_coming_soon_allowed_origins' );
