/**
 * WordPress dependencies
 */
import { test, Metrics } from '@wordpress/e2e-test-utils-playwright';

/**
 * Armazenamento de Resultados de Performance
 *
 * Estes objectos armazenam as métricas recolhidas durante os testes de performance.
 * Cada métrica é um array de números que será processado no final dos testes
 * para calcular estatísticas (mediana, quartis, min/max) e gerar relatórios.
 *
 * Os resultados são anexados aos artefactos do teste usando `testInfo.attach()`
 * e podem ser processados por reporters personalizados (ver performance-reporter.ts).
 */
const frontendResults: Record< string, number[] > = {
	timeToFirstByte: [], // TTFB: Tempo até ao primeiro byte da resposta do servidor
	largestContentfulPaint: [], // LCP: Maior elemento de conteúdo renderizado
	lcpMinusTtfb: [], // LCP - TTFB: Tempo de renderização após resposta do servidor
	cumulativeLayoutShift: [], // CLS: Deslocamento cumulativo do layout (estabilidade visual)
	firstContentfulPaint: [], // FCP: Primeiro elemento de conteúdo renderizado
	serverResponse: [], // Tempo de resposta do servidor
	domContentLoaded: [], // Tempo até DOMContentLoaded
	loaded: [], // Tempo até load completo
};

const editorResults: Record< string, number[] > = {
	serverResponse: [],
	firstContentfulPaint: [],
	domContentLoaded: [],
	loaded: [],
	blockInsertionTime: [], // Tempo para inserir o bloco no editor
	blockRenderTime: [], // Tempo para o bloco ser renderizado no canvas
	settingsPanelOpenTime: [], // Tempo para abrir o painel de configurações
};

const blockPerformanceResults: Record< string, number[] > = {
	blockInsertionTime: [],
	blockRenderTime: [],
	attributeEditTime: [], // Tempo para editar um atributo e ver a actualização no canvas
};

/**
 * URL do post de teste partilhada entre testes
 *
 * O primeiro teste cria um post e guarda a URL. Os testes subsequentes
 * reutilizam esta URL para medir performance do frontend, evitando
 * criar múltiplos posts desnecessariamente.
 */
let testPostUrl: string | null = null;

/**
 * Testes de Performance do Frontend
 *
 * Mede Core Web Vitals e métricas de carregamento para páginas
 * que contêm o bloco Meetup Info.
 *
 * Estratégia de teste:
 * 1. Cria um post uma vez (teste de setup)
 * 2. Executa múltiplas iterações (10x) medindo as mesmas métricas
 * 3. Recolhe estatísticas de todas as iterações para análise
 */
test.describe( 'Frontend Performance', () => {
	/**
	 * Anexa os resultados recolhidos como artefacto JSON que pode ser
	 * processado por reporters personalizados ou analisado manualmente.
	 */
	test.afterAll( async ( { requestUtils }, testInfo ) => {
		await testInfo.attach( 'frontend-results', {
			body: JSON.stringify( frontendResults, null, 2 ),
			contentType: 'application/json',
		} );
		await requestUtils.deleteAllPosts();
	} );

	/**
	 * Teste de Setup: Cria o post de teste
	 *
	 * Este teste é executado primeiro e cria um post publicado com o bloco.
	 * A URL do post é guardada numa variável partilhada para ser reutilizada
	 * nos testes subsequentes, evitando criar múltiplos posts.
	 */
	test( 'Setup: Create test post with block', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost( { title: 'Performance Test Post' } );
		await editor.insertBlock( { name: 'meetup/info' } );
		await editor.publishPost();

		// Guarda a URL do post para reutilização nos testes seguintes
		testPostUrl = await page
			.getByRole( 'link', { name: 'View Post', exact: true } )
			.getAttribute( 'href' );

		// Verifica que o bloco renderiza correctamente no frontend
		await page.goto( testPostUrl! );
		await page.locator( '[data-testid="meetup-info"]' ).waitFor();
	} );

	/**
	 * Número de iterações para medir performance
	 *
	 * Múltiplas iterações permitem:
	 * - Reduzir impacto de variações aleatórias (rede, cache, etc.)
	 * - Calcular estatísticas confiáveis (mediana, quartis)
	 * - Identificar outliers e problemas intermitentes
	 */
	const iterations = 10;

	/**
	 * Cada iteração mede as mesmas métricas na mesma página, permitindo
	 * calcular estatísticas confiáveis sobre a performance.
	 */
	for ( let i = 1; i <= iterations; i++ ) {
		test( `Measure Web Vitals (${ i } of ${ iterations })`, async ( {
			page,
		} ) => {
			// Se o post não foi criado no teste de setup, salta este teste
			test.skip( ! testPostUrl, 'Test post not created' );

			// Create metrics instance BEFORE navigation to capture performance events
			const metrics = new Metrics( { page } );

			/**
			 * Navega para a página e aguarda que esteja pronta
			 *
			 * `waitUntil: 'networkidle'` garante que a página terminou de carregar
			 * recursos (imagens, scripts, etc.), o que é necessário para medir
			 * métricas como LCP e CLS correctamente.
			 */
			await page.goto( testPostUrl!, { waitUntil: 'networkidle' } );
			await page.locator( '[data-testid="meetup-info"]' ).waitFor();

			/**
			 * Algumas métricas (especialmente LCP) podem precisar de tempo adicional
			 * para serem calculadas pelo browser. Este timeout garante que o browser
			 * teve tempo suficiente para calcular todas as métricas.
			 */
			await page.waitForTimeout( 500 );

			/**
			 * Recolhe métricas com timeout para evitar que o teste fique bloqueado
			 *
			 * Usamos Promise.race() para garantir que se uma métrica demorar muito
			 * (por exemplo, se a página fechar ou houver um erro), o teste não fica
			 * bloqueado indefinidamente. Se o timeout ocorrer, usamos 0 como valor
			 * padrão (que será identificado como outlier nos relatórios).
			 */
			const metricsTimeout = 10000; // 10 segundos de timeout por métrica
			const timeoutPromise = ( timeout: number ) =>
				new Promise( ( _, reject ) =>
					setTimeout( () => reject( new Error( 'Metrics timeout' ) ), timeout )
				);

			/**
			 * TTFB (Time to First Byte)
			 *
			 * Mede o tempo desde o pedido HTTP até receber o primeiro byte
			 * da resposta do servidor. Valores altos indicam problemas no servidor
			 * ou na rede.
			 */
			const ttfb = await Promise.race( [
				metrics.getTimeToFirstByte(),
				timeoutPromise( metricsTimeout ),
			] ).catch( () => 0 ) as number;

			/**
			 * LCP (Largest Contentful Paint)
			 *
			 * Mede o tempo até o maior elemento de conteúdo ser renderizado.
			 * É uma das métricas Core Web Vitals do Google. Valores ideais: < 2.5s
			 */
			const lcp = await Promise.race( [
				metrics.getLargestContentfulPaint(),
				timeoutPromise( metricsTimeout ),
			] ).catch( () => 0 ) as number;

			/**
			 * CLS (Cumulative Layout Shift)
			 *
			 * Mede a estabilidade visual da página (quanto o layout "salta" durante
			 * o carregamento). Valores ideais: < 0.1. Valores altos indicam problemas
			 * de layout que afectam a experiência do utilizador.
			 */
			const cls = await Promise.race( [
				metrics.getCumulativeLayoutShift(),
				timeoutPromise( metricsTimeout ),
			] ).catch( () => 0 ) as number;

			/**
			 * Métricas de carregamento gerais
			 *
			 * Inclui FCP, tempo de resposta do servidor, DOMContentLoaded e load completo.
			 * Estas métricas ajudam a identificar onde está o gargalo no carregamento.
			 */
			const loadingDurations = await Promise.race( [
				metrics.getLoadingDurations(),
				timeoutPromise( metricsTimeout ),
			] ).catch( () => ( {
				firstContentfulPaint: 0,
				serverResponse: 0,
				domContentLoaded: 0,
				loaded: 0,
			} ) ) as {
				firstContentfulPaint: number;
				serverResponse: number;
				domContentLoaded: number;
				loaded: number;
			};

			/**
			 * Armazena todas as métricas recolhidas
			 *
			 * Estas métricas serão processadas no final dos testes para calcular
			 * estatísticas (mediana, quartis, min/max) e gerar relatórios de performance.
			 */
			frontendResults.timeToFirstByte.push( ttfb );
			frontendResults.largestContentfulPaint.push( lcp );
			frontendResults.lcpMinusTtfb.push( lcp - ttfb ); // Tempo de renderização após resposta do servidor
			frontendResults.cumulativeLayoutShift.push( cls );
			frontendResults.firstContentfulPaint.push(
				loadingDurations.firstContentfulPaint
			);
			frontendResults.serverResponse.push(
				loadingDurations.serverResponse
			);
			frontendResults.domContentLoaded.push(
				loadingDurations.domContentLoaded
			);
			frontendResults.loaded.push( loadingDurations.loaded );

			/**
			 * Tenta recolher métricas Server-Timing do WordPress
			 *
			 * O WordPress pode expor métricas de performance através do header
			 * Server-Timing, incluindo:
			 * - Tempo total de processamento (wp-total)
			 * - Tempo de queries à base de dados (wp-db)
			 * - Tempo de cache (wp-cache)
			 *
			 * Estas métricas são opcionais e podem não estar disponíveis em todos
			 * os ambientes, por isso envolvemos num try-catch.
			 */
			try {
				const serverTiming = await metrics.getServerTiming();
				for ( const [ key, value ] of Object.entries( serverTiming ) ) {
					frontendResults[ key ] ??= [];
					frontendResults[ key ].push( value as number );
				}

				// Métricas específicas do WordPress (se disponíveis)
				if ( serverTiming.total ) {
					frontendResults.wordpressTotal ??= [];
					frontendResults.wordpressTotal.push( serverTiming.total );
				}
				if ( serverTiming.wpDb ) {
					frontendResults.wordpressDb ??= [];
					frontendResults.wordpressDb.push( serverTiming.wpDb );
				}
				if ( serverTiming.wpCache ) {
					frontendResults.wordpressCache ??= [];
					frontendResults.wordpressCache.push( serverTiming.wpCache );
				}
			} catch {
				// Server-Timing pode não estar disponível (depende da configuração do WordPress)
			}
		} );
	}
} );

/**
 * Testes de Performance do Editor
 *
 * Mede a performance do editor de blocos quando se trabalha com o bloco Meetup Info.
 *
 * Estas métricas ajudam a identificar:
 * - Quanto tempo demora a carregar o editor
 * - Quanto tempo demora a inserir um bloco
 * - Quanto tempo demora a renderizar o bloco no canvas
 * - Quanto tempo demora a abrir o painel de configurações
 *
 * Diferente dos testes do frontend, aqui medimos operações específicas do editor
 * usando `performance.now()` do browser para maior precisão.
 */
test.describe( 'Editor Performance', () => {
	test.afterAll( async ( { requestUtils }, testInfo ) => {
		await testInfo.attach( 'editor-results', {
			body: JSON.stringify( editorResults, null, 2 ),
			contentType: 'application/json',
		} );
		await requestUtils.deleteAllPosts();
	} );

	/**
	 * O editor é mais pesado e demora mais tempo a carregar, por isso
	 * usamos menos iterações para manter os testes num tempo razoável.
	 */
	const iterations = 5;

	for ( let i = 1; i <= iterations; i++ ) {
		test( `Measure Editor Load (${ i } of ${ iterations })`, async ( {
			admin,
			editor,
			page,
		} ) => {
			// Cria instância de métricas para medir carregamento do editor
			const metrics = new Metrics( { page } );

			await admin.createNewPost();

			/**
			 * Mede tempo de inserção do bloco
			 *
			 * IMPORTANTE: Usamos `page.evaluate(() => performance.now())` em vez de
			 * `performance.now()` do Node.js porque:
			 * - `performance.now()` do browser é mais preciso (microsegundos)
			 * - Está sincronizado com o contexto da página
			 * - Captura o tempo real de operações no browser
			 */
			const blockInsertStart = await page.evaluate( () => performance.now() );
			await editor.insertBlock( { name: 'meetup/info' } );
			const blockInsertEnd = await page.evaluate( () => performance.now() );
			const blockInsertDuration = blockInsertEnd - blockInsertStart;

			/**
			 * Mede tempo de renderização do bloco
			 *
			 * O tempo de renderização inclui:
			 * - Processamento do JavaScript do bloco
			 * - Renderização do React no canvas
			 * - Aplicação de estilos CSS
			 */
			const blockRenderStart = await page.evaluate( () => performance.now() );
			await editor.canvas.locator( '.meetup-info' ).waitFor();
			const blockRenderEnd = await page.evaluate( () => performance.now() );
			const blockRenderTime = blockRenderEnd - blockRenderStart;

			/**
			 * Recolhe métricas de carregamento do editor
			 *
			 * Estas métricas medem o carregamento geral da página do editor,
			 * não apenas operações específicas do bloco.
			 */
			const loadingDurations = await metrics.getLoadingDurations();

			editorResults.serverResponse.push(
				loadingDurations.serverResponse
			);
			editorResults.firstContentfulPaint.push(
				loadingDurations.firstContentfulPaint
			);
			editorResults.domContentLoaded.push(
				loadingDurations.domContentLoaded
			);
			editorResults.loaded.push( loadingDurations.loaded );
			editorResults.blockInsertionTime.push( blockInsertDuration );
			editorResults.blockRenderTime.push( blockRenderTime );

			/**
			 * Mede tempo de abertura do painel de configurações
			 *
			 * Esta métrica ajuda a identificar se há problemas de performance
			 * ao abrir o painel lateral de configurações do bloco.
			 *
			 * IMPORTANTE: Usamos `.first()` e `exact: true` para evitar ambiguidade
			 * com múltiplos botões "Settings" na interface (barra superior vs sidebar).
			 */
			try {
				await editor.canvas.locator( '.meetup-info' ).click();
				const settingsStart = await page.evaluate( () => performance.now() );

				// Selecciona o botão Settings de forma específica para evitar ambiguidade
				const settingsButton = page
					.getByRole( 'button', { name: 'Settings', pressed: false, exact: true } )
					.first();

				if ( await settingsButton.isVisible().catch( () => false ) ) {
					await settingsButton.click();
					// Aguarda que o painel específico do bloco esteja visível
					await page
						.getByRole( 'button', { name: 'Meetup Settings' } )
						.waitFor();
				}
				const settingsEnd = await page.evaluate( () => performance.now() );
				editorResults.settingsPanelOpenTime.push(
					settingsEnd - settingsStart
				);
			} catch {
				// A medição do painel de configurações é opcional
				// Se falhar (por exemplo, se o painel já estiver aberto), não é crítico
			}
		} );
	}
} );

/**
 * Testes de Performance Específicos do Bloco
 *
 * Mede a performance de operações específicas do bloco:
 * - Inserção do bloco no editor
 * - Renderização do bloco no canvas
 * - Edição de atributos e actualização no canvas
 *
 * Estas métricas são importantes para garantir que o bloco tem boa
 * performance e não causa lentidão no editor, especialmente quando
 * há muitos blocos na página.
 */
test.describe( 'Block Performance', () => {
	test.afterAll( async ( { requestUtils }, testInfo ) => {
		await testInfo.attach( 'block-performance-results', {
			body: JSON.stringify( blockPerformanceResults, null, 2 ),
			contentType: 'application/json',
		} );
		await requestUtils.deleteAllPosts();
	} );

	const iterations = 5;

	for ( let i = 1; i <= iterations; i++ ) {
		test( `Measure Block Operations (${ i } of ${ iterations })`, async ( {
			admin,
			editor,
			page,
		} ) => {
			await admin.createNewPost();

			/**
			 * Mede tempo de inserção do bloco
			 *
			 * Inclui o tempo desde o comando de inserção até o bloco estar
			 * disponível no editor (mas pode não estar totalmente renderizado).
			 */
			const insertStart = await page.evaluate( () => performance.now() );
			await editor.insertBlock( { name: 'meetup/info' } );
			const insertEnd = await page.evaluate( () => performance.now() );
			const insertDuration = insertEnd - insertStart;
			blockPerformanceResults.blockInsertionTime.push( insertDuration );

			/**
			 * Mede tempo de renderização do bloco
			 *
			 * Tempo desde a inserção até o bloco estar completamente renderizado
			 * e visível no canvas do editor.
			 */
			const renderStart = await page.evaluate( () => performance.now() );
			await editor.canvas.locator( '.meetup-info' ).waitFor();
			const renderEnd = await page.evaluate( () => performance.now() );
			const renderDuration = renderEnd - renderStart;
			blockPerformanceResults.blockRenderTime.push( renderDuration );

			/**
			 * Mede tempo de edição de atributos
			 *
			 * Esta métrica mede o tempo desde a edição de um atributo até
			 * a actualização ser reflectida no canvas do editor. Inclui:
			 * - Tempo para abrir o painel de configurações (se necessário)
			 * - Tempo para preencher o campo
			 * - Tempo para o React actualizar o componente
			 * - Tempo para o canvas reflectir a mudança
			 */
			await editor.canvas.locator( '.meetup-info' ).click();

			// Abre o painel de configurações se necessário
			// Usa `.first()` para evitar ambiguidade com múltiplos botões "Settings"
			const settingsButton = page
				.getByRole( 'button', { name: 'Settings', pressed: false, exact: true } )
				.first();
			if ( await settingsButton.isVisible().catch( () => false ) ) {
				await settingsButton.click();
			}

			// Mede o tempo de edição desde o preenchimento até a actualização no canvas
			const editStart = await page.evaluate( () => performance.now() );
			const titleInput = page
				.getByRole( 'textbox', { name: 'Title' } )
				.first();
			await titleInput.fill( 'Performance Test Title' );
			await titleInput.blur();
			await editor.canvas
				.locator( '.meetup-info__title' )
				.filter( { hasText: 'Performance Test Title' } )
				.waitFor();
			const editEnd = await page.evaluate( () => performance.now() );
			const editDuration = editEnd - editStart;
			blockPerformanceResults.attributeEditTime.push( editDuration );
		} );
	}
} );
