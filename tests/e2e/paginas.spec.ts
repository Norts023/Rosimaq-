import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { path: '/', name: 'início' },
  { path: '/contato', name: 'contato' },
  { path: '/privacidade', name: 'privacidade' },
];

for (const { path, name } of pages) {
  test(`${name}: carrega sem erros e sem violações sérias de acessibilidade`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    );
    expect(serious).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('contato: link de mapa é externo e seguro', async ({ page }) => {
  await page.goto('/contato');
  const map = page.getByRole('link', { name: /Abrir no mapa/ });
  await expect(map).toHaveAttribute('href', /^https:\/\/www\.google\.com\/maps\//);
  await expect(map).toHaveAttribute('rel', 'noopener noreferrer');
});

test('404: mostra a mensagem da marca e volta ao início', async ({ page }) => {
  const response = await page.goto('/pagina-que-nao-existe');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Esse equipamento saiu para obra',
  );
  await page.getByRole('link', { name: 'Ir para o início' }).click();
  await expect(page).toHaveURL(/\/$/);
});
