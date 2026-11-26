// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cspHashes from './scripts/csp-integration.mjs';

// PUBLIC_SITE_URL pode incluir um caminho (ex.: https://norts023.github.io/Rosimaq-).
// A origem vai para `site` e o caminho para `base`, então o site funciona na raiz ou em subpasta.
const siteUrl = new URL(process.env.PUBLIC_SITE_URL ?? 'https://www.rosimaq.com');
const basePath = siteUrl.pathname.replace(/\/+$/, '') || '/';

export default defineConfig({
  site: siteUrl.origin,
  base: basePath,
  output: 'static',
  trailingSlash: 'never',
  integrations: [sitemap(), cspHashes()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
