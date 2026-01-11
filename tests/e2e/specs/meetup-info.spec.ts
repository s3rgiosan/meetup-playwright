import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Meetup Info Block', () => {
	test.describe('Block Editor', () => {
		test('block is available in the inserter', async ({ admin, page }) => {
			// Login and create new post
			await admin.createNewPost();

			// Open block inserter (toolbar button)
			await page.getByRole('button', { name: 'Block Inserter' }).click();

			// Search for our block
			await page.getByRole('searchbox', { name: 'Search' }).fill('Meetup Info');

			// Verify our block appears in results
			const blockOption = page.getByRole('option', { name: 'Meetup Info' });
			await expect(blockOption).toBeVisible();
		});

		test('block can be inserted and displays correctly', async ({ admin, editor }) => {
			// Login and create new post
			await admin.createNewPost();

			// Insert the Meetup Info block
			await editor.insertBlock({ name: 'meetup/info' });

			// Get the block content from the editor canvas
			const editorCanvas = editor.canvas;

			// Verify block is inserted with default content
			const blockTitle = editorCanvas.locator('.meetup-info__title');
			await expect(blockTitle).toHaveText('Playwright + AI');

			const blockDetails = editorCanvas.locator('.meetup-info__details');
			await expect(blockDetails).toContainText('January 2026');
			await expect(blockDetails).toContainText('WordPress Meetup');
		});
	});

	test.describe('Frontend', () => {
		test('block renders correctly on the frontend', async ({
			admin,
			editor,
			page,
		}) => {
			// Create a new post with the Meetup Info block
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			// Publish the post
			await editor.publishPost();

			// Get the post URL and navigate to it
			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			// Look for the meetup info block
			const meetupBlock = page.locator('[data-testid="meetup-info"]');
			await expect(meetupBlock).toBeVisible();

			// Verify the title
			const title = page.locator('[data-testid="meetup-title"]');
			await expect(title).toHaveText('Playwright + AI');

			// Verify the details contain date and location
			const details = page.locator('[data-testid="meetup-details"]');
			await expect(details).toContainText('January 2026');
			await expect(details).toContainText('WordPress Meetup');
		});
	});
});
