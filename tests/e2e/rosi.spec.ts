import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const panel = (page: import('@playwright/test').Page) => page.locator('#rosi-panel');
const chip = (page: import('@playwright/test').Page, name: string) =>
  panel(page).locator('.rosi-options').getByRole('button', { name, exact: true });

async function openRosi(page: import('@playwright/test').Page) {
  await page.locator('[data-rosi-open]').click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page).locator('[data-rosi-messages] li').first()).toBeVisible();
}

async function answer(page: import('@playwright/test').Page, name: string) {
  await chip(page, name).click();
  // A Rosi mostra "digitando" por um instante antes de responder.
  await expect(panel(page).locator('[data-rosi-typing]')).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
});

test('fluxo completo: pedido de betoneira com resumo e link do WhatsApp', async ({ page }) => {
  await openRosi(page);
  await answer(page, 'Quero alugar um equipamento');
  await answer(page, 'Pular');
  await answer(page, 'Santana de Parnaíba');
  await answer(page, 'Concreto e argamassa');
  await answer(page, 'Betoneira 400 L');
  await answer(page, '2');
  await answer(page, 'Só isso');
  await answer(page, 'Hoje');
  await answer(page, '1 semana');
  await answer(page, 'Entrega na obra');
  await answer(page, 'Não, tudo certo');
  const send = panel(page).locator('a.rosi-send-big');
  await expect(send).toBeVisible();
  const href = new URL((await send.getAttribute('href')) ?? '');
  expect(href.origin + href.pathname).toBe('https://wa.me/5511925125435');
  const text = href.searchParams.get('text') ?? '';
  expect(text).toContain('2x Betoneira 400 L');
  expect(text).toContain('Cidade da obra: Santana de Parnaíba');
});

test('pergunta digitada sobre horário responde com os dados do site', async ({ page }) => {
  await openRosi(page);
  await panel(page).getByLabel('Digite sua dúvida').fill('qual o horário de domingo?');
  await panel(page).getByRole('button', { name: 'Enviar' }).click();
  await expect(panel(page).locator('[data-rosi-messages]')).toContainText('7h às 22h');
});

test('pergunta sem resposta encaminha ao WhatsApp com a dúvida', async ({ page }) => {
  await openRosi(page);
  await panel(page).getByLabel('Digite sua dúvida').fill('tem estacionamento para caminhão?');
  await panel(page).getByRole('button', { name: 'Enviar' }).click();
  await answer(page, 'Perguntar no WhatsApp');
  const link = panel(page).locator('a.rosi-send-big');
  await expect(link).toHaveAttribute('href', /tem%20estacionamento/);
});

test('teclado: Esc fecha e devolve o foco ao botão da Rosi', async ({ page }) => {
  await openRosi(page);
  await page.keyboard.press('Escape');
  await expect(panel(page)).toBeHidden();
  await expect(page.locator('[data-rosi-open]')).toBeFocused();
});

test('conversa é mantida entre páginas e apagada ao recomeçar', async ({ page }) => {
  await openRosi(page);
  await answer(page, 'Quero alugar um equipamento');
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: 'Contato', exact: true }).first().click();
  await expect(page).toHaveURL(/\/contato$/);
  await openRosi(page);
  await expect(panel(page).locator('[data-rosi-messages]')).toContainText('Como posso te chamar');
  await panel(page).getByRole('button', { name: 'Recomeçar' }).click();
  await expect(panel(page).locator('[data-rosi-messages]')).not.toContainText(
    'Como posso te chamar',
  );
});

test('painel aberto não tem violações sérias de acessibilidade', async ({ page }) => {
  await openRosi(page);
  const results = await new AxeBuilder({ page }).include('#rosi-panel').analyze();
  const serious = results.violations.filter((v) =>
    ['serious', 'critical'].includes(v.impact ?? ''),
  );
  expect(serious).toEqual([]);
});

test('a barra fixa do celular e o botão da Rosi não se sobrepõem', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Só no celular.');
  const launcher = await page.locator('[data-rosi-open]').boundingBox();
  const bar = await page.locator('nav[aria-label="Ações rápidas"]').boundingBox();
  expect(launcher && bar && launcher.y + launcher.height <= bar.y + 1).toBe(true);
});
