// spec: tests/e2e/specs/plan.md
// seed: tests/e2e/seed.spec.ts

import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Meetup Info Block', () => {
	test('Negative Testing - Empty Required Fields', async ({
		admin,
		editor,
		page,
	}) => {
		// 1. Start with a fresh editor state (new post)
		await admin.createNewPost();
		await editor.canvas.locator('body').waitFor();

		// 2. Insert the Meetup Info block (as in Scenario 1)
		await editor.canvas.click('body');
		await page.keyboard.press('/');
		await page.getByRole('searchbox', { name: 'Search' }).fill('Meetup Info');
		await page
			.getByRole('option', { name: 'Meetup Info', exact: false })
			.click();

		// 3. Clear the Title field completely (leave empty)
		const titleField = page.getByRole('textbox', { name: 'Title' });
		await titleField.clear();

		// 4. Verify the preview updates to show an empty heading (h3 with no text)
		const titlePreview = editor.canvas.locator(
			'[data-testid="meetup-title"]'
		);
		await expect(titlePreview).toHaveText('');

		// 5. Clear the Date field completely
		const dateField = page.getByRole('textbox', { name: 'Date' });
		await dateField.clear();

		// 6. Verify the preview shows: "📅 " (date emoji with empty value)
		const datePreview = editor.canvas.locator('[data-testid="meetup-date"]');
		await expect(datePreview).toHaveText('📅 ');

		// 7. Clear the Location field completely
		const locationField = page.getByRole('textbox', { name: 'Location' });
		await locationField.clear();

		// 8. Verify the preview shows: "📅  | 📍 " (both emojis with empty values)
		const locationPreview = editor.canvas.locator(
			'[data-testid="meetup-location"]'
		);
		await expect(locationPreview).toHaveText('📍 ');
		const detailsPreview = editor.canvas.locator(
			'[data-testid="meetup-details"]'
		);
		await expect(detailsPreview).toContainText('📅  | 📍 ');

		// 9. Attempt to publish the post with all empty fields
		await editor.canvas
			.getByRole('textbox', { name: 'Add title' })
			.fill('Test Post with Empty Fields');

		// 10. Verify if WordPress allows publishing (block may not have validation)
		await page.getByRole('button', { name: 'Publish', exact: true }).click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();

		// 11. If published, verify frontend rendering with empty values
		await expect(
			page.getByText('Post published.', { exact: false })
		).toBeVisible();

		await page.getByRole('link', { name: /View Post/i }).first().click();

		const blockContainer = page.locator('[data-testid="meetup-info"]');
		await expect(blockContainer).toBeVisible();

		const frontendTitle = page.locator('[data-testid="meetup-title"]');
		await expect(frontendTitle).toHaveText('');

		const frontendDate = page.locator('[data-testid="meetup-date"]');
		await expect(frontendDate).toHaveText('📅 ');

		const frontendLocation = page.locator('[data-testid="meetup-location"]');
		await expect(frontendLocation).toHaveText('📍 ');

		// 12. Test with very long text:
		//     - Enter a title with 200+ characters
		//     - Enter a date with 100+ characters
		//     - Enter a location with 100+ characters
		await admin.createNewPost();
		await editor.canvas.locator('body').waitFor();
		await editor.canvas.click('body');
		await page.keyboard.press('/');
		await page.getByRole('searchbox', { name: 'Search' }).fill('Meetup Info');
		await page
			.getByRole('option', { name: 'Meetup Info', exact: false })
			.click();

		const longTitle =
			'This is a very long title that exceeds 200 characters to test how the block handles extremely long text input. It should display properly or wrap gracefully without breaking the layout or causing any rendering issues in the editor preview.';
		await titleField.clear();
		await titleField.fill(longTitle);

		const longDate =
			'This is a very long date string with 100+ characters to test edge cases. It includes multiple dates and times and various formatting that might be entered by users.';
		await dateField.clear();
		await dateField.fill(longDate);

		const longLocation =
			'This is a very long location string with 100+ characters to test how the block handles extremely long location names. It should display properly or wrap gracefully.';
		await locationField.clear();
		await locationField.fill(longLocation);

		// 13. Verify preview handles long text appropriately
		await expect(titlePreview).toHaveText(longTitle);
		await expect(datePreview).toContainText(longDate);
		await expect(locationPreview).toContainText(longLocation);

		// 14. Publish and verify frontend rendering with long text
		await editor.canvas
			.getByRole('textbox', { name: 'Add title' })
			.fill('Test Post with Long Text');

		await page.getByRole('button', { name: 'Publish', exact: true }).click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();

		await expect(
			page.getByText('Post published.', { exact: false })
		).toBeVisible();

		await page.getByRole('link', { name: /View Post/i }).first().click();

		await expect(page.locator('[data-testid="meetup-info"]')).toBeVisible();
		await expect(page.locator('[data-testid="meetup-title"]')).toHaveText(
			longTitle
		);
		await expect(page.locator('[data-testid="meetup-date"]')).toContainText(
			longDate
		);
		await expect(
			page.locator('[data-testid="meetup-location"]')
		).toContainText(longLocation);
	});
});
