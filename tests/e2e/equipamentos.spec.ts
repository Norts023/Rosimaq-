import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Página de equipamentos', () => {
  test('carrega sem erros de console', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/equipamentos');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('filtro por categoria atualiza a lista e a URL', async ({ page }) => {
    await page.goto('/equipamentos');
    await page.getByRole('button', { name: 'Altura e acesso' }).click();
    await expect(page).toHaveURL(/categoria=altura-acesso/);
    await expect(page.getByRole('button', { name: 'Altura e acesso' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(
      page.locator('[data-equipment-card][data-category="concreto"]').first(),
    ).toBeHidden();
    await expect(
      page.locator('[data-equipment-card][data-category="altura-acesso"]').first(),
    ).toBeVisible();

    await page.reload();
    await expect(page.getByRole('button', { name: 'Altura e acesso' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(
      page.locator('[data-equipment-card][data-category="concreto"]').first(),
    ).toBeHidden();
  });

  test('busca atualiza a URL e mostra estado vazio', async ({ page }) => {
    await page.goto('/equipamentos');
    const search = page.getByLabel('Buscar por nome');
    await search.fill('betoneira');
    await expect(page).toHaveURL(/q=betoneira/);
    await expect(page.locator('[data-equipment-card]:visible')).toHaveCount(1);

    await search.fill('xyzinexistente');
    await expect(page.getByText('Nenhum equipamento encontrado.')).toBeVisible();
  });

  test('diálogo abre, foca o título, fecha com Esc e devolve o foco', async ({ page }) => {
    await page.goto('/equipamentos');
    const trigger = page.locator('[data-details="betoneira-400l"]');
    await trigger.click();
    const dialog = page.locator('dialog#betoneira-400l');
    await expect(dialog).toBeVisible();
    await expect(page.locator('#betoneira-400l-titulo')).toBeFocused();
    await expect(page).toHaveURL(/#betoneira-400l$/);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('âncora abre o diálogo correspondente', async ({ page }) => {
    await page.goto('/equipamentos#vibrador-concreto-35mm');
    await expect(page.locator('dialog#vibrador-concreto-35mm')).toBeVisible();
  });

  test('botões de WhatsApp apontam para o número e a mensagem do equipamento', async ({ page }) => {
    await page.goto('/equipamentos#betoneira-400l');
    const link = page.locator('dialog#betoneira-400l a[href^="https://wa.me/"]');
    const href = new URL((await link.getAttribute('href')) ?? '');
    expect(href.pathname).toBe('/5511925125435');
    expect(href.searchParams.get('text')).toContain('tenho interesse em locar: Betoneira 400 L.');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('sem violações sérias de acessibilidade', async ({ page }) => {
    await page.goto('/equipamentos');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    );
    expect(serious).toEqual([]);
  });
});
