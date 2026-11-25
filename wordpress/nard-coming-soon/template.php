<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$nard_title       = get_bloginfo( 'name' ) . ' | The signal arrives soon';
$nard_description = 'A new NARD collection is coming. Get a text when it goes live.';
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<title><?php echo esc_html( $nard_title ); ?></title>
	<meta name="description" content="<?php echo esc_attr( $nard_description ); ?>">
	<meta name="theme-color" content="#050505">
	<meta property="og:type" content="website">
	<meta property="og:title" content="<?php echo esc_attr( $nard_title ); ?>">
	<meta property="og:description" content="<?php echo esc_attr( $nard_description ); ?>">
	<meta property="og:url" content="<?php echo esc_url( home_url( '/' ) ); ?>">
	<meta name="twitter:card" content="summary">
	<?php
	$nard_icon = plugin_dir_url( __FILE__ ) . 'icon.png';
	if ( has_site_icon() ) :
		?>
		<link rel="icon" href="<?php echo esc_url( get_site_icon_url( 64 ) ); ?>">
		<link rel="apple-touch-icon" href="<?php echo esc_url( get_site_icon_url( 180 ) ); ?>">
	<?php else : ?>
		<link rel="icon" href="<?php echo esc_url( $nard_icon ); ?>">
		<link rel="apple-touch-icon" href="<?php echo esc_url( $nard_icon ); ?>">
	<?php endif; ?>
	<meta property="og:image" content="<?php echo esc_url( has_site_icon() ? get_site_icon_url( 512 ) : $nard_icon ); ?>">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jockey+One&family=Outfit:wght@400;500;600;700&display=swap">
	<link rel="stylesheet" href="<?php echo esc_url( $build_url . 'nard-coming-soon.css?ver=' . $version ); ?>">
	<script type="module" src="<?php echo esc_url( $build_url . 'nard-coming-soon.js?ver=' . $version ); ?>"></script>
</head>
<body>
	<div id="nard-coming-soon"></div>
	<noscript>
		<p style="color:#ffd400;font-family:sans-serif;text-align:center;padding:4rem 1rem;">
			The Static Drop is coming. Turn on JavaScript to see the countdown.
		</p>
	</noscript>
</body>
</html>
