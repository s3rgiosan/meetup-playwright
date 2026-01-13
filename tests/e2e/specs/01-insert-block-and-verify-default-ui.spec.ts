// spec: tests/e2e/specs/plan.md
// seed: tests/e2e/seed.spec.ts

import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Meetup Info Block', () => {
	test('Insert Block and Verify Default UI', async ({ admin, editor, page }) => {
		// 1. Navigate to http://localhost:8889/wp-admin/post-new.php
		await admin.createNewPost();

		// 2. Wait for the editor to load completely
		await editor.canvas.locator('body').waitFor();

		// 3. Click the "Add block" button (or press `/` to open block inserter)
		await editor.canvas.click('body');
		await page.keyboard.press('/');

		// 4. Search for "Meetup Info" in the block inserter
		await page
			.getByRole('searchbox', { name: 'Search' })
			.fill('Meetup Info');

		// 5. Click on the "Meetup Info" option to insert the block
		await page
			.getByRole('option', { name: 'Meetup Info', exact: false })
			.click();

		// 6. Verify the block is inserted in the editor canvas
		const blockInCanvas = editor.canvas.locator(
			'[data-testid="meetup-info"]'
		);
		await expect(blockInCanvas).toBeVisible();

		// 7. Open the Block settings panel (if not already open)
		// Settings panel should be open by default when block is selected

		// 8. Verify the Title field displays default value: "Playwright + AI"
		const titleField = page.getByRole('textbox', { name: 'Title' });
		await expect(titleField).toHaveValue('Playwright + AI');

		// 9. Verify the Date field displays default value: "Janeiro 2026"
		const dateField = page.getByRole('textbox', { name: 'Date' });
		await expect(dateField).toHaveValue('Janeiro 2026');

		// 10. Verify the Location field displays default value: "Lisboa, Portugal"
		const locationField = page.getByRole('textbox', { name: 'Location' });
		await expect(locationField).toHaveValue('Lisboa, Portugal');

		// 11. Verify the block preview in the editor canvas shows:
		//     - Heading (h3) with text "Playwright + AI"
		//     - Paragraph containing: "📅 Janeiro 2026 | 📍 Lisboa, Portugal"
		const titlePreview = editor.canvas.locator(
			'[data-testid="meetup-title"]'
		);
		await expect(titlePreview).toHaveText('Playwright + AI');
		await expect(titlePreview).toHaveRole('heading', { level: 3 });

		const detailsPreview = editor.canvas.locator(
			'[data-testid="meetup-details"]'
		);
		await expect(detailsPreview).toContainText('📅 Janeiro 2026');
		await expect(detailsPreview).toContainText('📍 Lisboa, Portugal');
	});
});
