import { expect, test } from '@playwright/test';

const pages = ['/', '/equipamentos', '/contato', '/privacidade', '/404'];
const widths = [375, 768, 1280];

for (const width of widths) {
  test.describe(`largura ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of pages) {
      test(`${path} não tem rolagem horizontal`, async ({ page }) => {
        await page.goto(path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  });
}

test.describe('metadados', () => {
  test('página inicial tem título, canonical e Open Graph com URL absoluta', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Rosimaq | Locação de equipamentos para construção civil');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'pt_BR');
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(image).toMatch(/^https:\/\/.+\/og-image\.jpg$/);
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute(
      'content',
      '1200',
    );
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute(
      'content',
      '630',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/site.webmanifest');
  });

  test('cada página tem um único h1', async ({ page }) => {
    for (const path of ['/', '/equipamentos', '/contato', '/privacidade']) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
    }
  });

  test('JSON-LD da home é válido e traz o endereço e a área atendida', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? '{}');
    expect(data['@type']).toBe('LocalBusiness');
    expect(data.address.postalCode).toBe('06530-300');
    expect(data.areaServed).toHaveLength(5);
  });

  test('robots.txt aponta para o sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(await response.text()).toContain('Sitemap: https://');
  });
});
