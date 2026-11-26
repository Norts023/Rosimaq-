import { describe, expect, it } from 'vitest';
import { absoluteUrlFrom } from '../../src/lib/urlCore';

const { joinBase } = absoluteUrlFrom;

describe('joinBase', () => {
  it('sem caminho base (domínio próprio), mantém a rota', () => {
    expect(joinBase('/', '/')).toBe('/');
    expect(joinBase('/', '/equipamentos')).toBe('/equipamentos');
  });
  it('com caminho base (GitHub Pages), prefixa a rota', () => {
    expect(joinBase('/Rosimaq-/', '/')).toBe('/Rosimaq-/');
    expect(joinBase('/Rosimaq-/', '/equipamentos')).toBe('/Rosimaq-/equipamentos');
    expect(joinBase('/Rosimaq-/', '/equipamentos?categoria=concreto')).toBe(
      '/Rosimaq-/equipamentos?categoria=concreto',
    );
  });
});
