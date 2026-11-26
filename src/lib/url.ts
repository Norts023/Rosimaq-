import { absoluteUrlFrom } from './urlCore';

/** Junta o caminho base do site a uma rota interna que começa com "/". */
export function withBase(route: string): string {
  return absoluteUrlFrom.joinBase(import.meta.env.BASE_URL, route);
}

/** URL absoluta de uma rota, a partir da origem do site (site.origin). */
export function absoluteUrl(route: string, site: URL | undefined): string {
  if (!site) throw new Error('site não configurado em astro.config (PUBLIC_SITE_URL)');
  return new URL(withBase(route), site).href;
}
