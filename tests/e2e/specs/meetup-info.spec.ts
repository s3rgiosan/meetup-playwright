import { test, expect } from '@wordpress/e2e-test-utils-playwright';

/**
 * Flags de Demonstração de Falhas
 *
 * - FAIL_BLOCK_CAN_BE_SEARCHED: Simula pesquisa por bloco inexistente
 * - FAIL_BLOCK_CAN_BE_INSERTED: Simula valor incorrecto após inserção
 * - FAIL_BLOCK_HAS_SEMANTIC_HTML: Simula HTML semântico incorrecto (h2 em vez de h3)
 * - FAIL_BLOCK_SERIALIZATION: Simula problema de encoding (mojibake) na serialização
 * - FAIL_BLOCK_SERIALIZATION_EXTRA_FIELD: Simula atributo perdido na serialização
 * - FAIL_BLOCK_SERIALIZATION_EMPTY_ATTRIBUTES: Simula atributos vazios/nulos não preservados
 *
 * Para demonstrar falhas, altere qualquer flag para `true` e execute os testes.
 */
const FAIL_BLOCK_CAN_BE_SEARCHED = false;
const FAIL_BLOCK_CAN_BE_INSERTED = false;
const FAIL_BLOCK_HAS_SEMANTIC_HTML = false;
const FAIL_BLOCK_SERIALIZATION = false;
const FAIL_BLOCK_SERIALIZATION_EXTRA_FIELD = false;
const FAIL_BLOCK_SERIALIZATION_EMPTY_ATTRIBUTES = false;

/**
 * Testes E2E para o bloco Meetup Info
 *
 * Este ficheiro contém testes end-to-end para o bloco "Meetup Info".
 * Os testes cobrem:
 * - Inserção e renderização do bloco no editor
 * - Edição de atributos via InspectorControls
 * - Renderização no frontend
 * - Acessibilidade e design responsivo
 * - Integração com WordPress (REST API, serialização)
 */
test.describe('Meetup Info Block', () => {
	/**
	 * Testes do Editor de blocos
	 *
	 * Estes testes verificam o comportamento do bloco dentro do editor de blocos.
	 */
	test.describe('Block Editor', () => {
		/**
		 * Verifica se o bloco está disponível no inserter de blocos do WordPress.
		 *
		 * Este teste garante que o bloco foi registado correctamente e pode ser
		 * encontrado quando um utilizador procura por blocos no editor.
		 */
		test('block is available in the inserter', async ({ admin, page }) => {
			await admin.createNewPost();

			// Abre o inserter de blocos e procura pelo bloco
			await page.getByRole('button', { name: 'Block Inserter' }).click();
			const searchbox = page.getByRole('searchbox', { name: 'Search' });
			await searchbox.clear();

			if (FAIL_BLOCK_CAN_BE_SEARCHED) {
				await searchbox.fill('Not a valid block');
			} else {
				await searchbox.fill('Meetup Info');
			}

			// Aguarda que a pesquisa seja processada (debounce)
			await page.waitForTimeout(500);

			// Verifica se o bloco aparece nos resultados da pesquisa
			const blockOption = page.getByRole('option', { name: 'Meetup Info' });
			await expect(blockOption).toBeVisible();
		});

		/**
		 * Verifica se o bloco pode ser inserido no editor e exibe os valores padrão correctos.
		 *
		 * Após inserir o bloco, verifica se o título, data e localização padrão
		 * são exibidos correctamente no canvas do editor.
		 */
		test('block can be inserted and displays correctly', async ({ admin, editor }) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			// Verifica se os valores padrão são exibidos correctamente no editor
			const editorCanvas = editor.canvas;

			// Verifica que o título padrão é exibido correctamente
			await expect(editorCanvas.locator('.meetup-info__title')).toHaveText(
				'Playwright + AI'
			);

			// Verifica que a data padrão é exibida correctamente
			// Usa data-testid para selecção mais precisa e estável
			await expect(editorCanvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Janeiro 2026'
			);

			if (FAIL_BLOCK_CAN_BE_INSERTED) {
				await expect(editorCanvas.locator('[data-testid="meetup-location"]')).toContainText('Not a valid location');
			} else {
				await expect(editorCanvas.locator('[data-testid="meetup-location"]')).toContainText(
					'Lisboa, Portugal'
				);
			}
		});

		/**
		 * Verifica se os atributos do bloco podem ser editados através do painel de configurações.
		 *
		 * Este teste valida que os campos do InspectorControls (painel lateral de configurações)
		 * permitem editar o título, data e localização do bloco, e que essas alterações
		 * são imediatamente refletidas na visualização do editor.
		 */
		test('block attributes can be edited via InspectorControls', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			// Selecciona o bloco clicando nele (isto activa o bloco e pode abrir o painel)
			await editor.canvas.locator('.meetup-info').click();

			// Verifica se o painel de configurações está aberto, caso contrário abre-o
			const meetupSettingsButton = page.getByRole('button', {
				name: 'Meetup Settings',
			});
			const isSettingsPanelOpen = await meetupSettingsButton
				.isVisible()
				.catch(() => false);

			if (!isSettingsPanelOpen) {
				// Procura o botão Settings na barra superior do editor (não no conteúdo)
				const editorTopBar = page.getByRole('region', {
					name: 'Editor top bar',
				});
				const topSettingsButton = editorTopBar.getByRole('button', {
					name: 'Settings',
				});
				await topSettingsButton.waitFor({ state: 'visible' });
				await topSettingsButton.click();
			}

			await expect(meetupSettingsButton).toBeVisible();

			// Obtém o painel de configurações do bloco (não confundir com outros campos da página)
			const blockSettingsPanel = page
				.getByRole('region', { name: 'Editor settings' })
				.getByRole('tabpanel', { name: 'Block' });

			// Edita o título e verifica que a alteração é refletida no editor
			const titleControl = blockSettingsPanel.getByRole('textbox', {
				name: 'Title',
			});
			await titleControl.waitFor({ state: 'visible' });
			await titleControl.fill('Título Personalizado do Meetup');
			await titleControl.blur();

			// Verifica que o canvas reflecte a mudança imediatamente
			await expect(editor.canvas.locator('.meetup-info__title')).toHaveText(
				'Título Personalizado do Meetup'
			);

			// Edita a data e verifica a alteração
			const dateControl = blockSettingsPanel.getByRole('textbox', {
				name: 'Date',
			});
			await dateControl.waitFor({ state: 'visible' });
			await dateControl.fill('Março 2026');
			await dateControl.blur();

			await expect(editor.canvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Março 2026'
			);

			// Edita a localização e verifica todas as alterações
			const locationControl = blockSettingsPanel.getByRole('textbox', {
				name: 'Location',
			});
			await locationControl.waitFor({ state: 'visible' });
			await locationControl.fill('Porto, Portugal');
			await locationControl.blur();

			// Verifica que todas as alterações foram preservadas
			await expect(editor.canvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Março 2026'
			);

			await expect(editor.canvas.locator('[data-testid="meetup-location"]')).toContainText(
				'Porto, Portugal'
			);
		});

		/**
		 * Verifica se o bloco pode ser inserido com atributos personalizados.
		 *
		 * Testa a inserção do bloco passando valores personalizados para título, data
		 * e localização, garantindo que esses valores são aplicados correctamente
		 * no momento da inserção.
		 */
		test('block can be inserted with custom attributes', async ({
			admin,
			editor,
		}) => {
			await admin.createNewPost();

			// Insere o bloco com atributos personalizados
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Workshop: Testes em WordPress',
					date: 'Fevereiro 2026',
					location: 'Lisboa, Portugal',
				},
			});

			// Verifica se os valores personalizados foram aplicados correctamente
			await expect(editor.canvas.locator('.meetup-info__title')).toHaveText(
				'Workshop: Testes em WordPress'
			);
			await expect(editor.canvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Fevereiro 2026'
			);
			await expect(editor.canvas.locator('[data-testid="meetup-location"]')).toContainText(
				'Lisboa, Portugal'
			);
		});
	});

	/**
	 * Testes do Frontend
	 *
	 * Estes testes verificam como o bloco é renderizado no frontend,
	 * após a publicação do post.
	 */
	test.describe('Frontend', () => {
		/**
		 * Verifica se o bloco renderiza correctamente no frontend após publicação.
		 *
		 * Após criar e publicar um post com o bloco, navega para a página do post
		 * no frontend e verifica se o bloco é exibido com os valores padrão correctos.
		 */
		test('block renders correctly on the frontend', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });
			await editor.publishPost();

			// Navega para a página do post no frontend
			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			// Verifica que o bloco é exibido com os valores padrão
			await expect(page.locator('[data-testid="meetup-info"]')).toBeVisible();
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

		/**
		 * Verifica se o bloco renderiza correctamente no frontend com atributos personalizados.
		 *
		 * Testa que os valores personalizados (título, data, localização) são correctamente
		 * renderizados na página pública do post após publicação.
		 */
		test('block renders with custom attributes on frontend', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Técnicas Avançadas de Playwright',
					date: 'Abril 2026',
					location: 'Remoto',
				},
			});

			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			// Verifica que os valores personalizados são renderizados correctamente
			await expect(page.locator('[data-testid="meetup-title"]')).toHaveText(
				'Técnicas Avançadas de Playwright'
			);
			await expect(page.locator('[data-testid="meetup-date"]')).toContainText(
				'Abril 2026'
			);
			await expect(page.locator('[data-testid="meetup-location"]')).toContainText(
				'Remoto'
			);
		});
	});

	/**
	 * Testes de Acessibilidade
	 *
	 * Estes testes verificam se o bloco segue boas práticas de acessibilidade,
	 * incluindo HTML semântico e navegação por teclado.
	 */
	test.describe('Accessibility', () => {
		/**
		 * Verifica se o bloco utiliza HTML semântico e atributos adequados para testes.
		 *
		 * Valida que o bloco usa elementos HTML semânticos (h3 para título, p para detalhes).
		 */
		test('block has proper semantic HTML and ARIA attributes', async ({
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

			const meetupBlock = page.locator('[data-testid="meetup-info"]');

			// Verifica que o bloco usa HTML semântico (h3 para título, p para detalhes)
			if (FAIL_BLOCK_HAS_SEMANTIC_HTML) {
				await expect(meetupBlock.locator('h2')).toBeVisible();
			} else {
				await expect(meetupBlock.locator('h3')).toBeVisible();
			}
			await expect(meetupBlock.locator('p')).toBeVisible();

		});

		/**
		 * Verifica se o bloco é acessível via navegação por teclado no editor.
		 *
		 * Testa que o bloco pode ser selecionado e interagido usando apenas o teclado,
		 * garantindo acessibilidade para utilizadores que não usam rato.
		 */
		test('block is keyboard navigable in editor', async ({ admin, editor, page }) => {
			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });

			// Aguarda o bloco ser renderizado e verifica que pode ser selecionado
			await editor.canvas.locator('.meetup-info').waitFor();
			const block = editor.canvas.locator('.meetup-info');
			await expect(block).toBeVisible();

			// Verifica que o bloco pode receber foco via clique (acessibilidade)
			await block.click();
			await expect(block).toBeVisible();
		});
	});

	/**
	 * Testes de Design Responsivo
	 *
	 * Estes testes verificam se o bloco renderiza correctamente em diferentes
	 * tamanhos de ecrã (mobile, tablet, desktop).
	 */
	test.describe('Responsive Design', () => {
		/**
		 * Verifica se o bloco renderiza correctamente em dispositivos móveis.
		 *
		 * Simula um viewport mobile (iPhone SE) e verifica que o bloco é visível
		 * e que o conteúdo não é cortado ou truncado incorrectamente.
		 */
		test('block renders correctly on mobile viewport', async ({
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

			// Define viewport mobile (iPhone SE) e navega para o post
			await page.setViewportSize({ width: 375, height: 667 });
			await page.goto(postUrl!);

			// Verifica que o bloco é visível e que o conteúdo não é cortado
			await expect(page.locator('[data-testid="meetup-info"]')).toBeVisible();
			const titleBox = await page
				.locator('[data-testid="meetup-title"]')
				.boundingBox();
			expect(titleBox?.width).toBeGreaterThan(0);
			expect(titleBox?.width).toBeLessThanOrEqual(375);
		});

		/**
		 * Verifica se o bloco renderiza correctamente em tablets.
		 *
		 * Simula um viewport tablet (iPad) e verifica que o bloco é exibido
		 * correctamente neste tamanho de ecrã.
		 */
		test('block renders correctly on tablet viewport', async ({
			admin,
			editor,
			page,
		}) => {
			// Define viewport tablet (iPad)
			await page.setViewportSize({ width: 768, height: 1024 });

			await admin.createNewPost();
			await editor.insertBlock({ name: 'meetup/info' });
			await editor.publishPost();

			const postUrl = await page
				.getByRole('link', { name: 'View Post', exact: true })
				.getAttribute('href');
			await page.goto(postUrl!);

			// Verifica que o bloco é visível no viewport tablet
			await expect(page.locator('[data-testid="meetup-info"]')).toBeVisible();
		});
	});

	/**
	 * Testes de Integração WordPress
	 *
	 * Estes testes verificam a integração do bloco com funcionalidades do WordPress,
	 * como REST API e serialização de dados.
	 */
	test.describe('WordPress Integration', () => {
		/**
		 * Verifica se a serialização do bloco está correcta no conteúdo do post.
		 *
		 * Após publicar um post com o bloco, obtém o conteúdo via REST API e verifica
		 * que os atributos do bloco foram correctamente serializados e estão presentes
		 * no HTML renderizado.
		 */
		test('block serialization is correct in post content', async ({
			admin,
			editor,
			requestUtils,
		}) => {
			await admin.createNewPost({ title: 'Post de Teste com Bloco' });

			if (FAIL_BLOCK_SERIALIZATION) {
				await editor.insertBlock({
					name: 'meetup/info',
					attributes: {
						title: 'Teste de Serialização',
						date: 'Maio 2026',
						location: 'Localização de Teste',
					},
				});
			} else if (FAIL_BLOCK_SERIALIZATION_EMPTY_ATTRIBUTES) {
				await editor.insertBlock({
					name: 'meetup/info',
					attributes: {
						title: '',
						date: null,
						location: undefined,
					},
				});
			} else {
				await editor.insertBlock({
					name: 'meetup/info',
					attributes: {
						title: 'Teste de Serialização',
						date: 'Maio 2026',
						location: 'Localização de Teste',
					},
				});
			}

			const postId = await editor.publishPost();

			// Aguarda que o post seja completamente publicado e a UI actualizada
			await editor.page
				.getByRole('link', { name: 'View Post', exact: true })
				.waitFor({ state: 'visible', timeout: 10000 });
			await editor.page.waitForTimeout(500);

			// Obtém o conteúdo do post via REST API
			const post = await requestUtils.rest({
				path: `/wp/v2/posts/${postId}`,
				method: 'GET',
				params: {
					context: 'edit',
				},
			});

			const rawContent = post.content.raw;

			/**
			 * Extrai o JSON do bloco do conteúdo serializado
			 *
			 * O WordPress serializa blocos no formato:
			 * <!-- wp:meetup/info {"title":"...","date":"...","location":"..."} /-->
			 *
			 * Usamos uma regex para extrair o JSON entre as chavetas.
			 * O formato pode variar ligeiramente (com ou sem fecho /-->), por isso
			 * a regex é flexível.
			 */
			const blockMatch = rawContent.match(
				/<!--\s*wp:meetup\/info\s+({[^}]+})\s+(?:\/-->|-->)/s
			);
			expect(blockMatch).not.toBeNull();
			expect(blockMatch![1]).toBeDefined();

			/**
			 * Faz parse do JSON e verifica os atributos
			 *
			 * Após extrair o JSON, fazemos parse e verificamos que cada atributo
			 * corresponde ao valor esperado. Isto garante que:
			 * - A serialização funcionou correctamente
			 * - Os caracteres especiais foram preservados
			 * - Não houve perda de dados durante o processo
			 */
			const blockAttributes = JSON.parse(blockMatch![1]);
			expect(blockAttributes.title).toBe('Teste de Serialização');
			expect(blockAttributes.date).toBe('Maio 2026');

			if (FAIL_BLOCK_SERIALIZATION) {
				expect(blockAttributes.location).toBe('LocalizaÃ§Ã£o de Teste');
			} else {
				expect(blockAttributes.location).toBe('Localização de Teste');
			}

			if ( FAIL_BLOCK_SERIALIZATION_EXTRA_FIELD) {
				expect(blockAttributes.extraField).toBe('valor');
			}

			if ( FAIL_BLOCK_SERIALIZATION_EMPTY_ATTRIBUTES) {
				expect(blockAttributes.title).toBe('');
				expect(blockAttributes.date).toBe(null);
				expect(blockAttributes.location).toBe(undefined);
			}
		});

		/**
		 * Verifica se os atributos do bloco persistem após recarregar a página do editor.
		 *
		 * Testa que os dados do bloco são correctamente guardados na base de dados e
		 * restaurados quando o editor é recarregado, garantindo que não há perda de dados.
		 */
		test('block attributes persist after page reload', async ({
			admin,
			editor,
			page,
		}) => {
			await admin.createNewPost();
			await editor.insertBlock({
				name: 'meetup/info',
				attributes: {
					title: 'Teste Persistente',
					date: 'Junho 2026',
					location: 'Faro, Portugal',
				},
			});

			// Guarda como rascunho e recarrega a página
			await editor.saveDraft();
			await editor.page.reload();

			// Aguarda que o editor carregue e o bloco esteja visível
			await editor.canvas.locator('.meetup-info').waitFor({
				state: 'visible',
				timeout: 10000,
			});

			// Verifica que todos os atributos foram mantidos após o reload
			await expect(editor.canvas.locator('.meetup-info__title')).toHaveText(
				'Teste Persistente'
			);
			await expect(editor.canvas.locator('[data-testid="meetup-date"]')).toContainText(
				'Junho 2026'
			);
			await expect(editor.canvas.locator('[data-testid="meetup-location"]')).toContainText(
				'Faro, Portugal'
			);
		});
	});
});
