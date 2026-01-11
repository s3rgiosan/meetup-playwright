import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

registerBlockType('meetup/info', {
	edit: function ({ attributes, setAttributes }) {
		const blockProps = useBlockProps({
			className: 'meetup-info',
		});

		return (
			<div {...blockProps}>
				<InspectorControls>
					<PanelBody title={__('Meetup Settings', 'meetup-playwright')}>
						<TextControl
							label={__('Title', 'meetup-playwright')}
							value={attributes.title}
							onChange={(value) => setAttributes({ title: value })}
						/>
						<TextControl
							label={__('Date', 'meetup-playwright')}
							value={attributes.date}
							onChange={(value) => setAttributes({ date: value })}
						/>
						<TextControl
							label={__('Location', 'meetup-playwright')}
							value={attributes.location}
							onChange={(value) => setAttributes({ location: value })}
						/>
					</PanelBody>
				</InspectorControls>
				<div className="meetup-info__content">
					<h3 className="meetup-info__title">{attributes.title}</h3>
					<p className="meetup-info__details">
						{`📅 ${attributes.date} | 📍 ${attributes.location}`}
					</p>
				</div>
			</div>
		);
	},
	save: () => null,
});
