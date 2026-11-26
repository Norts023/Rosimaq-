import { expect, test } from '@playwright/test';

test('navegação com View Transitions mantém o cabeçalho e reativa os scripts', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await page.evaluate(() => {
    (window as unknown as { __marker: string }).__marker = 'mesmo-documento';
  });
  await page.getByRole('link', { name: 'Ver equipamentos' }).click();
  await expect(page).toHaveURL(/\/equipamentos$/);
  // Mesmo documento: a navegação foi feita pelo router, sem recarregar a página.
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __marker?: string }).__marker))
    .toBe('mesmo-documento');

  await page.getByRole('button', { name: 'Altura e acesso' }).click();
  await expect(page).toHaveURL(/categoria=altura-acesso/);
  await page.locator('[data-details="andaime-1x1"]').click();
  await expect(page.locator('dialog#andaime-1x1')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});

test('cabeçalho continua funcional depois da navegação', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver equipamentos' }).click();
  await expect(page).toHaveURL(/\/equipamentos$/);
  await expect(page.locator('header')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Rosimaq, página inicial' }).first()).toBeVisible();
  // O cabeçalho é recriado a cada página; o script do menu precisa estar ativo.
  await expect(page.locator('header [data-menu-open]')).toBeAttached();
  await expect(page.locator('header [data-menu]')).toHaveAttribute('data-ready', 'on');
});
