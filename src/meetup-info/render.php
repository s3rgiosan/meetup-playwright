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
$date     = $attributes['date'] ?? __( 'Janeiro 2026', 'meetup-playwright' );
$location = $attributes['location'] ?? __( 'Lisboa, Portugal', 'meetup-playwright' );
?>

<div
	<?php echo get_block_wrapper_attributes( [ 'class' => 'meetup-info' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-testid="meetup-info"
>
	<h3 class="meetup-info__title" data-testid="meetup-title"><?php echo esc_html( $title ); ?></h3>
	<p class="meetup-info__details" data-testid="meetup-details">
		<span class="meetup-info__date" data-testid="meetup-date">
			📅 <?php echo esc_html( $date ); ?>
		</span>
		<span class="meetup-info__separator"> | </span>
		<span class="meetup-info__location" data-testid="meetup-location">
			📍 <?php echo esc_html( $location ); ?>
		</span>
	</p>
</div>
