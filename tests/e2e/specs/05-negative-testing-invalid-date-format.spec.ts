// spec: tests/e2e/specs/plan.md
// seed: tests/e2e/seed.spec.ts

import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Meetup Info Block', () => {
	test('Negative Testing - Invalid Date Format', async ({
		admin,
		editor,
		page,
	}) => {
		// 1. Start with a fresh editor state
		await admin.createNewPost();
		await editor.canvas.locator('body').waitFor();

		// 2. Insert the Meetup Info block
		await editor.canvas.click('body');
		await page.keyboard.press('/');
		await page.getByRole('searchbox', { name: 'Search' }).fill('Meetup Info');
		await page
			.getByRole('option', { name: 'Meetup Info', exact: false })
			.click();

		const dateField = page.getByRole('textbox', { name: 'Date' });
		const datePreview = editor.canvas.locator('[data-testid="meetup-date"]');

		// 3. Test various date formats in the Date field:
		//    - "32 de Janeiro de 2026" (invalid day)
		const invalidDay = '32 de Janeiro de 2026';
		await dateField.clear();
		await dateField.fill(invalidDay);

		// 4. Verify the preview displays the entered text as-is (no validation)
		await expect(datePreview).toContainText(invalidDay);

		// 5. Verify no error messages appear
		await expect(
			page.getByText(/error|invalid|validation/i)
		).not.toBeVisible();

		// Test: "30 de Fevereiro de 2026" (invalid month)
		const invalidMonth = '30 de Fevereiro de 2026';
		await dateField.clear();
		await dateField.fill(invalidMonth);
		await expect(datePreview).toContainText(invalidMonth);

		// Test: "abc123" (non-date text)
		const nonDateText = 'abc123';
		await dateField.clear();
		await dateField.fill(nonDateText);
		await expect(datePreview).toContainText(nonDateText);

		// Test: "2026-13-45" (invalid date format)
		const invalidFormat = '2026-13-45';
		await dateField.clear();
		await dateField.fill(invalidFormat);
		await expect(datePreview).toContainText(invalidFormat);

		// Test: "Yesterday" (relative date)
		const relativeDate = 'Yesterday';
		await dateField.clear();
		await dateField.fill(relativeDate);
		await expect(datePreview).toContainText(relativeDate);

		// 6. Publish the post with invalid date formats
		await editor.canvas
			.getByRole('textbox', { name: 'Add title' })
			.fill('Test Post with Invalid Date');

		await page.getByRole('button', { name: 'Publish', exact: true }).click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();

		await expect(
			page.getByText('Post published.', { exact: false })
		).toBeVisible();

		// 7. Verify frontend renders the invalid date text as entered
		await page.getByRole('link', { name: /View Post/i }).first().click();

		const frontendDate = page.locator('[data-testid="meetup-date"]');
		await expect(frontendDate).toContainText(relativeDate);

		// 8. Test with special characters in date: "15/02/2026 @ 18:00"
		await admin.createNewPost();
		await editor.canvas.locator('body').waitFor();
		await editor.canvas.click('body');
		await page.keyboard.press('/');
		await page.getByRole('searchbox', { name: 'Search' }).fill('Meetup Info');
		await page
			.getByRole('option', { name: 'Meetup Info', exact: false })
			.click();

		const specialCharsDate = '15/02/2026 @ 18:00';
		await dateField.clear();
		await dateField.fill(specialCharsDate);

		// 9. Verify preview and frontend handle special characters
		await expect(datePreview).toContainText(specialCharsDate);

		await editor.canvas
			.getByRole('textbox', { name: 'Add title' })
			.fill('Test Post with Special Characters');

		await page.getByRole('button', { name: 'Publish', exact: true }).click();
		await page
			.getByLabel('Editor publish')
			.getByRole('button', { name: 'Publish', exact: true })
			.click();

		await expect(
			page.getByText('Post published.', { exact: false })
		).toBeVisible();

		await page.getByRole('link', { name: /View Post/i }).first().click();

		await expect(page.locator('[data-testid="meetup-date"]')).toContainText(
			specialCharsDate
		);
	});
});
