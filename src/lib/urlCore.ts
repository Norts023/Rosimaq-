/** Funções puras de URL, testáveis sem o Astro. */
export const absoluteUrlFrom = {
  joinBase(base: string, route: string): string {
    const root = base.replace(/\/+$/, '');
    return route === '/' ? `${root}/` : `${root}${route}`;
  },
};
