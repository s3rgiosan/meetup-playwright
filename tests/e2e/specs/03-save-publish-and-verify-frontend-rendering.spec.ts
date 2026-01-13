// spec: tests/e2e/specs/plan.md
// seed: tests/e2e/seed.spec.ts

import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Meetup Info Block', () => {
	test('Save/Publish and Verify Frontend Rendering', async ({
		admin,
		editor,
		page,
	}) => {
		// 1. Start with Scenario 2 completed (block edited with custom values)
		await admin.createNewPost();
		await editor.canvas.locator('body').waitFor();
		await editor.canvas.click('body');
		await page.keyboard.press('/');
		await page.getByRole('searchbox', { name: 'Search' }).fill('Meetup Info');
		await page
			.getByRole('option', { name: 'Meetup Info', exact: false })
			.click();

		const titleField = page.getByRole('textbox', { name: 'Title' });
		await titleField.clear();
		await titleField.fill('Lisbon WordPress Meetup');

		const dateField = page.getByRole('textbox', { name: 'Date' });
		await dateField.clear();
		await dateField.fill('15 de Fevereiro de 2026');

		const locationField = page.getByRole('textbox', { name: 'Location' });
		await locationField.clear();
		await locationField.fill('Porto, Portugal');

		// 2. Add a post title: "Test Post with Meetup Block"
		await editor.canvas
			.getByRole('textbox', { name: 'Add title' })
			.fill('Test Post with Meetup Block');

		// 3. Click the "Publish" button in the editor toolbar
		await page.getByRole('button', { name: 'Publish', exact: true }).click();

		// 4. Click "Publish" in the publish panel to confirm
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();

		// 5. Wait for the "Post published" notification
		await expect(
			page.getByText('Post published.', { exact: false })
		).toBeVisible();

		// 6. Click the "View Post" link (or navigate to the post URL)
		await page
			.getByRole('link', { name: /View Post/i })
			.first()
			.click();

		// 7. Verify the frontend page loads correctly
		await expect(page).toHaveURL(/\/\?p=\d+/);

		// 8. Locate the meetup block on the frontend using [data-testid="meetup-info"]
		const blockContainer = page.locator('[data-testid="meetup-info"]');
		await expect(blockContainer).toBeVisible();

		// 9. Verify the block title (h3) displays: "Lisbon WordPress Meetup" (or current value)
		const blockTitle = page.locator('[data-testid="meetup-title"]');
		await expect(blockTitle).toHaveText('Lisbon WordPress Meetup');
		await expect(blockTitle).toHaveRole('heading', { level: 3 });

		// 10. Verify the block details paragraph contains:
		//     - Date span with [data-testid="meetup-date"] showing: "📅 15 de Fevereiro de 2026"
		//     - Separator: " | "
		//     - Location span with [data-testid="meetup-location"] showing: "📍 Porto, Portugal"
		const blockDate = page.locator('[data-testid="meetup-date"]');
		await expect(blockDate).toHaveText('📅 15 de Fevereiro de 2026');

		const blockLocation = page.locator('[data-testid="meetup-location"]');
		await expect(blockLocation).toHaveText('📍 Porto, Portugal');

		const blockDetails = page.locator('[data-testid="meetup-details"]');
		await expect(blockDetails).toContainText(' | ');

		// 11. Verify the complete block structure:
		//     - Container has class meetup-info
		//     - Title is an h3 element with class meetup-info__title
		//     - Details paragraph has class meetup-info__details
		//     - Date span has class meetup-info__date
		//     - Location span has class meetup-info__location
		await expect(blockContainer).toHaveClass(/meetup-info/);
		await expect(blockTitle).toHaveClass(/meetup-info__title/);
		await expect(blockDetails).toHaveClass(/meetup-info__details/);
		await expect(blockDate).toHaveClass(/meetup-info__date/);
		await expect(blockLocation).toHaveClass(/meetup-info__location/);

		// 12. Verify the block is properly styled and visible on the frontend
		await expect(blockContainer).toBeVisible();
	});
});
