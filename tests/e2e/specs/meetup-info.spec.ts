import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test.describe('Meetup Info Block', () => {
	test.describe('Block Attributes and Expected Behavior', () => {
		test('default attribute values are applied correctly', async ({ admin, editor }) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			const editorCanvas = editor.canvas;

			await expect(editorCanvas.locator('.meetup-info__title')).toHaveText(
				'Playwright + AI'
			);
			await expect(editorCanvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Janeiro 2026'
			);
			await expect(editorCanvas.locator('[data-testid="meetup-location"]')).toContainText(
				'Lisboa, Portugal'
			);
		});

		test('attributes persist after save and reload', async ({ admin, editor, page }) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Custom Title',
					date: 'Custom Date',
					location: 'Custom Location',
				},
			});

			await editor.saveDraft();
			await page.reload();

			await editor.canvas.locator('.meetup-info').waitFor({ state: 'visible', timeout: 10000 });

			await expect(editor.canvas.locator('.meetup-info__title')).toHaveText('Custom Title');
			await expect(editor.canvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Custom Date'
			);
			await expect(editor.canvas.locator('[data-testid="meetup-location"]')).toContainText(
				'Custom Location'
			);
		});
	});

	test.describe('InspectorControls Editing Scenarios', () => {
		test('title field can be edited via InspectorControls', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			await editor.canvas.locator('.meetup-info').click();

			const settingsButton = page.getByRole('button', { name: 'Settings' });
			const isSettingsOpen = await settingsButton
				.getAttribute('aria-pressed')
				.then((value) => value === 'true')
				.catch(() => false);

			if (!isSettingsOpen) {
				await settingsButton.click();
			}

			const blockSettingsPanel = page
				.getByRole('region', { name: 'Editor settings' })
				.getByRole('tabpanel', { name: 'Block' });

			const titleControl = blockSettingsPanel.getByRole('textbox', { name: 'Title' });
			await titleControl.waitFor({ state: 'visible' });
			await titleControl.fill('Updated Title');
			await titleControl.blur();

			await expect(editor.canvas.locator('.meetup-info__title')).toHaveText('Updated Title');
		});

		test('date field can be edited via InspectorControls', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			await editor.canvas.locator('.meetup-info').click();

			const settingsButton = page.getByRole('button', { name: 'Settings' });
			const isSettingsOpen = await settingsButton
				.getAttribute('aria-pressed')
				.then((value) => value === 'true')
				.catch(() => false);

			if (!isSettingsOpen) {
				await settingsButton.click();
			}

			const blockSettingsPanel = page
				.getByRole('region', { name: 'Editor settings' })
				.getByRole('tabpanel', { name: 'Block' });

			const dateControl = blockSettingsPanel.getByRole('textbox', { name: 'Date' });
			await dateControl.waitFor({ state: 'visible' });
			await dateControl.fill('March 2026');
			await dateControl.blur();

			await expect(editor.canvas.locator('[data-testid="meetup-date"]')).toContainText(
				'March 2026'
			);
		});

		test('location field can be edited via InspectorControls', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			await editor.canvas.locator('.meetup-info').click();

			const settingsButton = page.getByRole('button', { name: 'Settings' });
			const isSettingsOpen = await settingsButton
				.getAttribute('aria-pressed')
				.then((value) => value === 'true')
				.catch(() => false);

			if (!isSettingsOpen) {
				await settingsButton.click();
			}

			const blockSettingsPanel = page
				.getByRole('region', { name: 'Editor settings' })
				.getByRole('tabpanel', { name: 'Block' });

			const locationControl = blockSettingsPanel.getByRole('textbox', {
				name: 'Location',
			});
			await locationControl.waitFor({ state: 'visible' });
			await locationControl.fill('Porto, Portugal');
			await locationControl.blur();

			await expect(editor.canvas.locator('[data-testid="meetup-location"]')).toContainText(
				'Porto, Portugal'
			);
		});

		test('multiple fields can be updated independently', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			await editor.canvas.locator('.meetup-info').click();

			const settingsButton = page.getByRole('button', { name: 'Settings' });
			const isSettingsOpen = await settingsButton
				.getAttribute('aria-pressed')
				.then((value) => value === 'true')
				.catch(() => false);

			if (!isSettingsOpen) {
				await settingsButton.click();
			}

			const blockSettingsPanel = page
				.getByRole('region', { name: 'Editor settings' })
				.getByRole('tabpanel', { name: 'Block' });

			const titleControl = blockSettingsPanel.getByRole('textbox', { name: 'Title' });
			await titleControl.waitFor({ state: 'visible' });
			await titleControl.fill('Title 1');
			await titleControl.blur();

			const dateControl = blockSettingsPanel.getByRole('textbox', { name: 'Date' });
			await dateControl.waitFor({ state: 'visible' });
			await dateControl.fill('Date 1');
			await dateControl.blur();

			const locationControl = blockSettingsPanel.getByRole('textbox', {
				name: 'Location',
			});
			await locationControl.waitFor({ state: 'visible' });
			await locationControl.fill('Location 1');
			await locationControl.blur();

			await expect(editor.canvas.locator('.meetup-info__title')).toHaveText('Title 1');
			await expect(editor.canvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Date 1'
			);
			await expect(editor.canvas.locator('[data-testid="meetup-location"]')).toContainText(
				'Location 1'
			);
		});

		test('InspectorControls panel can be toggled', async ({ admin, editor, page }) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			await editor.canvas.locator('.meetup-info').click();

			const settingsButton = page.getByRole('button', { name: 'Settings' });
			await settingsButton.waitFor({ state: 'visible' });

			const meetupSettingsButton = page.getByRole('button', {
				name: 'Meetup Settings',
			});

			const isPanelOpen = await meetupSettingsButton.isVisible().catch(() => false);

			if (!isPanelOpen) {
				await settingsButton.click();
			}

			await expect(meetupSettingsButton).toBeVisible();

			const blockSettingsPanel = page
				.getByRole('region', { name: 'Editor settings' })
				.getByRole('tabpanel', { name: 'Block' });

			const titleControl = blockSettingsPanel.getByRole('textbox', { name: 'Title' });
			await expect(titleControl).toBeVisible();
		});
	});

	test.describe('Frontend Rendering Validation Points', () => {
		test('HTML structure is correct on frontend', async ({ admin, editor, page }) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			const meetupBlock = page.locator('[data-testid="meetup-info"]');
			await expect(meetupBlock).toBeVisible();
			await expect(meetupBlock).toHaveClass(/meetup-info/);

			await expect(meetupBlock.locator('h3.meetup-info__title[data-testid="meetup-title"]')).toBeVisible();
			await expect(
				meetupBlock.locator('p.meetup-info__details[data-testid="meetup-details"]')
			).toBeVisible();
			await expect(
				meetupBlock.locator('span.meetup-info__date[data-testid="meetup-date"]')
			).toBeVisible();
			await expect(
				meetupBlock.locator('span.meetup-info__location[data-testid="meetup-location"]')
			).toBeVisible();
		});

		test('default values render correctly on frontend', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			await expect(page.locator('[data-testid="meetup-title"]')).toHaveText(
				'Playwright + AI'
			);
			await expect(page.locator('[data-testid="meetup-date"]')).toContainText(
				'Janeiro 2026'
			);
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText(
				'Lisboa, Portugal'
			);

			const detailsText = await page
				.locator('[data-testid="meetup-details"]')
				.textContent();
			expect(detailsText).toContain('📅');
			expect(detailsText).toContain('📍');
			expect(detailsText).toContain(' | ');
		});

		test('custom values render correctly on frontend', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Custom Meetup Title',
					date: 'December 2026',
					location: 'Remote',
				},
			});
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			await expect(page.locator('[data-testid="meetup-title"]')).toHaveText(
				'Custom Meetup Title'
			);
			await expect(page.locator('[data-testid="meetup-date"]')).toContainText('December 2026');
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText('Remote');
		});

		test('HTML entities are escaped on frontend', async ({ admin, editor, page }) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: '<script>alert("xss")</script>',
					date: '<strong>test</strong>',
					location: '&amp;test',
				},
			});
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			const titleText = await page.locator('[data-testid="meetup-title"]').textContent();
			expect(titleText).toContain('<script>');
			expect(titleText).not.toContain('alert');

			const dateText = await page.locator('[data-testid="meetup-date"]').textContent();
			expect(dateText).toContain('<strong>');

			const locationText = await page.locator('[data-testid="meetup-location"]').textContent();
			expect(locationText).toContain('&amp;');
		});

		test('special characters render correctly on frontend', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: "Test's Title with \"quotes\"",
					date: 'Date with émojis 🎉',
					location: 'Location with unicode: 中文',
				},
			});
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			await expect(page.locator('[data-testid="meetup-title"]')).toContainText("Test's Title");
			await expect(page.locator('[data-testid="meetup-date"]')).toContainText('émojis');
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText('中文');
		});

		test('empty string attributes use fallback defaults on frontend', async ({
			admin,
			editor,
			page,
			requestUtils,
		}) => {
			await admin.createNewPost();
			const postId = await editor.publishPost();

			const post = await requestUtils.rest({
				path: `/wp/v2/posts/${postId}`,
				method: 'GET',
				params: { context: 'edit' },
			});

			const rawContent = post.content.raw;
			const blockMatch = rawContent.match(
				/<!--\s*wp:meetup\/info\s+({[^}]+})\s+(?:\/-->|-->)/s
			);

			if (blockMatch) {
				const blockAttributes = JSON.parse(blockMatch[1]);
				blockAttributes.title = '';
				blockAttributes.date = '';
				blockAttributes.location = '';

				const updatedContent = rawContent.replace(
					blockMatch[0],
					`<!-- wp:meetup/info ${JSON.stringify(blockAttributes)} /-->`
				);

				await requestUtils.rest({
					path: `/wp/v2/posts/${postId}`,
					method: 'POST',
					data: { content: updatedContent },
				});
			} else {
				const emptyBlockContent = `<!-- wp:meetup/info {"title":"","date":"","location":""} /-->`;
				await requestUtils.rest({
					path: `/wp/v2/posts/${postId}`,
					method: 'POST',
					data: { content: emptyBlockContent },
				});
			}

			await page.reload();
			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			await expect(page.locator('[data-testid="meetup-title"]')).toHaveText(
				'Playwright + AI'
			);
			await expect(page.locator('[data-testid="meetup-date"]')).toContainText(
				'Janeiro 2026'
			);
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText(
				'Lisboa, Portugal'
			);
		});
	});

	test.describe('Edge Cases and Error States', () => {
		test('very long text values are handled correctly', async ({
			admin,
			editor,
			page,
		}) => {
			const longText = 'A'.repeat(1000);

			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: longText,
					date: longText,
					location: longText,
				},
			});
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			await expect(page.locator('[data-testid="meetup-title"]')).toHaveText(longText);
			await expect(page.locator('[data-testid="meetup-date"]')).toContainText(longText);
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText(longText);

			const titleBox = await page.locator('[data-testid="meetup-title"]').boundingBox();
			expect(titleBox?.width).toBeGreaterThan(0);
		});

		test('whitespace-only values are handled gracefully', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: '   ',
					date: '\t\t',
					location: '\n\n',
				},
			});
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			const titleText = await page.locator('[data-testid="meetup-title"]').textContent();
			expect(titleText?.trim()).toBe('');
		});

		test('unicode and emoji characters in input render correctly', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: '🎉 Meetup Title 🚀',
					date: '📅 Date with émojis',
					location: '📍 Location: 北京',
				},
			});
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			await expect(page.locator('[data-testid="meetup-title"]')).toContainText('🎉');
			await expect(page.locator('[data-testid="meetup-date"]')).toContainText('📅');
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText('📍');
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText('北京');
		});

		test('rapid field updates are captured correctly', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			await editor.canvas.locator('.meetup-info').click();

			const settingsButton = page.getByRole('button', { name: 'Settings' });
			const isSettingsOpen = await settingsButton
				.getAttribute('aria-pressed')
				.then((value) => value === 'true')
				.catch(() => false);

			if (!isSettingsOpen) {
				await settingsButton.click();
			}

			const blockSettingsPanel = page
				.getByRole('region', { name: 'Editor settings' })
				.getByRole('tabpanel', { name: 'Block' });

			const titleControl = blockSettingsPanel.getByRole('textbox', { name: 'Title' });
			await titleControl.waitFor({ state: 'visible' });

			await titleControl.fill('Title 1');
			await page.waitForTimeout(100);
			await titleControl.fill('Title 2');
			await page.waitForTimeout(100);
			await titleControl.fill('Title 3');
			await titleControl.blur();

			await expect(editor.canvas.locator('.meetup-info__title')).toHaveText('Title 3');
		});

		test('block can be duplicated with attributes preserved', async ({
			admin,
			editor,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Original Title',
					date: 'Original Date',
					location: 'Original Location',
				},
			});

			await editor.canvas.locator('.meetup-info').click();

			await editor.page.keyboard.press('ControlOrMeta+Shift+D');

			await editor.page.waitForTimeout(500);

			const blocks = editor.canvas.locator('.meetup-info');
			await expect(blocks).toHaveCount(2);

			const titles = editor.canvas.locator('.meetup-info__title');
			await expect(titles.first()).toHaveText('Original Title');
			await expect(titles.last()).toHaveText('Original Title');
		});

		test('block removal and undo restores attributes', async ({ admin, editor }) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Title to Restore',
					date: 'Date to Restore',
					location: 'Location to Restore',
				},
			});

			await editor.canvas.locator('.meetup-info').click();
			await editor.page.keyboard.press('Delete');

			await editor.page.waitForTimeout(300);

			await editor.page.keyboard.press('ControlOrMeta+Z');

			await editor.canvas.locator('.meetup-info').waitFor({ state: 'visible' });

			await expect(editor.canvas.locator('.meetup-info__title')).toHaveText(
				'Title to Restore'
			);
			await expect(editor.canvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Date to Restore'
			);
			await expect(editor.canvas.locator('[data-testid="meetup-location"]')).toContainText(
				'Location to Restore'
			);
		});

		test('multiple block instances maintain independent attributes', async ({
			admin,
			editor,
		}) => {
			await admin.createNewPost();

			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Block 1 Title',
					date: 'Block 1 Date',
					location: 'Block 1 Location',
				},
			});

			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Block 2 Title',
					date: 'Block 2 Date',
					location: 'Block 2 Location',
				},
			});

			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Block 3 Title',
					date: 'Block 3 Date',
					location: 'Block 3 Location',
				},
			});

			const titles = editor.canvas.locator('.meetup-info__title');
			await expect(titles.nth(0)).toHaveText('Block 1 Title');
			await expect(titles.nth(1)).toHaveText('Block 2 Title');
			await expect(titles.nth(2)).toHaveText('Block 3 Title');
		});

		test('block renders correctly in different post types', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost({ postType: 'page' });
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Page Block Title',
					date: 'Page Block Date',
					location: 'Page Block Location',
				},
			});
			await editor.publishPost();

			const pageUrl = await page
				.getByRole('link', { name: 'View Page', exact: true })
				.getAttribute('href');
			await page.goto(pageUrl!);

			await expect(page.locator('[data-testid="meetup-title"]')).toHaveText(
				'Page Block Title'
			);
			await expect(page.locator('[data-testid="meetup-date"]')).toContainText(
				'Page Block Date'
			);
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText(
				'Page Block Location'
			);
		});

		test('editor preview matches frontend rendering', async ({ admin, editor, page }) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Preview Test Title',
					date: 'Preview Test Date',
					location: 'Preview Test Location',
				},
			});

			const editorTitle = await editor.canvas
				.locator('.meetup-info__title')
				.textContent();
			const editorDate = await editor.canvas
				.locator('[data-testid="meetup-date"]')
				.textContent();
			const editorLocation = await editor.canvas
				.locator('[data-testid="meetup-location"]')
				.textContent();

			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			const frontendTitle = await page
				.locator('[data-testid="meetup-title"]')
				.textContent();
			const frontendDate = await page
				.locator('[data-testid="meetup-date"]')
				.textContent();
			const frontendLocation = await page
				.locator('[data-testid="meetup-location"]')
				.textContent();

			expect(frontendTitle?.trim()).toBe(editorTitle?.trim());
			expect(frontendDate?.trim()).toBe(editorDate?.trim());
			expect(frontendLocation?.trim()).toBe(editorLocation?.trim());
		});

		test('all data-testid attributes are present', async ({ admin, editor, page }) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			await expect(page.locator('[data-testid="meetup-info"]')).toBeVisible();
			await expect(page.locator('[data-testid="meetup-title"]')).toBeVisible();
			await expect(page.locator('[data-testid="meetup-details"]')).toBeVisible();
			await expect(page.locator('[data-testid="meetup-date"]')).toBeVisible();
			await expect(page.locator('[data-testid="meetup-location"]')).toBeVisible();
		});

		test('block serialization stores attributes correctly', async ({
			admin,
			editor,
			requestUtils,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Serialization Test',
					date: 'May 2026',
					location: 'Test Location',
				},
			});

			const postId = await editor.publishPost();

			await editor.page
				.getByRole('link', { name: 'View Post', exact: true })
				.waitFor({ state: 'visible', timeout: 10000 });
			await editor.page.waitForTimeout(500);

			const post = await requestUtils.rest({
				path: `/wp/v2/posts/${postId}`,
				method: 'GET',
				params: { context: 'edit' },
			});

			const rawContent = post.content.raw;
			const blockMatch = rawContent.match(
				/<!--\s*wp:meetup\/info\s+({[^}]+})\s+(?:\/-->|-->)/s
			);

			expect(blockMatch).not.toBeNull();
			expect(blockMatch![1]).toBeDefined();

			const blockAttributes = JSON.parse(blockMatch![1]);
			expect(blockAttributes.title).toBe('Serialization Test');
			expect(blockAttributes.date).toBe('May 2026');
			expect(blockAttributes.location).toBe('Test Location');
		});
	});
});
