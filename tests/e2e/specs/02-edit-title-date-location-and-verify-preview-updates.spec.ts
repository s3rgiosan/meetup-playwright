// spec: tests/e2e/specs/plan.md
// seed: tests/e2e/seed.spec.ts

import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Meetup Info Block', () => {
	test('Edit Title/Date/Location and Verify Preview Updates', async ({
		admin,
		editor,
		page,
	}) => {
		// 1. Start with Scenario 1 completed (block inserted with default values)
		await admin.createNewPost();
		await editor.canvas.locator('body').waitFor();
		await editor.canvas.click('body');
		await page.keyboard.press('/');
		await page.getByRole('searchbox', { name: 'Search' }).fill('Meetup Info');
		await page
			.getByRole('option', { name: 'Meetup Info', exact: false })
			.click();

		// 2. In the Block settings panel, locate the Title textbox
		const titleField = page.getByRole('textbox', { name: 'Title' });

		// 3. Clear the Title field and type: "Lisbon WordPress Meetup"
		await titleField.clear();
		await titleField.fill('Lisbon WordPress Meetup');

		// 4. Verify the preview heading updates immediately to show "Lisbon WordPress Meetup"
		const titlePreview = editor.canvas.locator(
			'[data-testid="meetup-title"]'
		);
		await expect(titlePreview).toHaveText('Lisbon WordPress Meetup');

		// 5. Locate the Date textbox in the settings panel
		const dateField = page.getByRole('textbox', { name: 'Date' });

		// 6. Clear the Date field and type: "15 de Fevereiro de 2026"
		await dateField.clear();
		await dateField.fill('15 de Fevereiro de 2026');

		// 7. Verify the preview updates to show: "📅 15 de Fevereiro de 2026"
		const datePreview = editor.canvas.locator('[data-testid="meetup-date"]');
		await expect(datePreview).toHaveText('📅 15 de Fevereiro de 2026');

		// 8. Locate the Location textbox in the settings panel
		const locationField = page.getByRole('textbox', { name: 'Location' });

		// 9. Clear the Location field and type: "Porto, Portugal"
		await locationField.clear();
		await locationField.fill('Porto, Portugal');

		// 10. Verify the preview updates to show: "📍 Porto, Portugal"
		const locationPreview = editor.canvas.locator(
			'[data-testid="meetup-location"]'
		);
		await expect(locationPreview).toHaveText('📍 Porto, Portugal');

		// 11. Verify the complete preview shows:
		//     - Heading: "Lisbon WordPress Meetup"
		//     - Details paragraph: "📅 15 de Fevereiro de 2026 | 📍 Porto, Portugal"
		await expect(titlePreview).toHaveText('Lisbon WordPress Meetup');
		const detailsPreview = editor.canvas.locator(
			'[data-testid="meetup-details"]'
		);
		await expect(detailsPreview).toContainText(
			'📅 15 de Fevereiro de 2026 | 📍 Porto, Portugal'
		);

		// 12. Edit Title again to: "Porto Tech Meetup"
		await titleField.clear();
		await titleField.fill('Porto Tech Meetup');

		// 13. Verify preview updates immediately
		await expect(titlePreview).toHaveText('Porto Tech Meetup');

		// 14. Edit Date to: "20 de Março de 2026"
		await dateField.clear();
		await dateField.fill('20 de Março de 2026');

		// 15. Verify preview updates immediately
		await expect(datePreview).toHaveText('📅 20 de Março de 2026');

		// 16. Edit Location to: "Braga, Portugal"
		await locationField.clear();
		await locationField.fill('Braga, Portugal');

		// 17. Verify preview updates immediately
		await expect(locationPreview).toHaveText('📍 Braga, Portugal');
	});
});
