import { test, expect } from '@wordpress/e2e-test-utils-playwright';

test('seed', async ({ admin, page }) => {
  // Login e navegação inicial
  await admin.visitAdminPage('/');

  // O agente usa este teste como ponto de partida
});
