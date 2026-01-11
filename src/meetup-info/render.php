<?php
/**
 * Meetup Info block
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 *
 * @package meetup-playwright
 */

$title    = $attributes['title'] ?? __( 'Playwright + AI', 'meetup-playwright' );
$date     = $attributes['date'] ?? __( 'January 2026', 'meetup-playwright' );
$location = $attributes['location'] ?? __( 'WordPress Meetup', 'meetup-playwright' );
?>

<div
	<?php echo get_block_wrapper_attributes( [ 'class' => 'meetup-info' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-testid="meetup-info"
>
	<h3 class="meetup-info__title" data-testid="meetup-title"><?php echo esc_html( $title ); ?></h3>
	<p class="meetup-info__details" data-testid="meetup-details">
		<?php
		printf(
			/* translators: 1: Date, 2: Location */
			esc_html__( '📅 %1$s | 📍 %2$s', 'meetup-playwright' ),
			esc_html( $date ),
			esc_html( $location )
		);
		?>
	</p>
</div>
