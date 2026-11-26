import { describe, expect, it } from 'vitest';
import { buildSearch, matchesFilter, normalize, parseState } from '../../src/lib/catalog';

const cats = ['concreto', 'altura-acesso'];
const betoneira = { category: 'concreto', text: normalize('Betoneira 400 L 220 V monofásica') };
const andaime = { category: 'altura-acesso', text: normalize('Andaime de aço NR18') };

describe('normalize', () => {
  it('remove acentos e põe em minúsculas', () => {
    expect(normalize('  Monofásica AÇO ')).toBe('monofasica aco');
  });
});

describe('matchesFilter', () => {
  it('aceita tudo sem categoria e sem busca', () => {
    expect(matchesFilter(betoneira, { category: null, query: '' })).toBe(true);
  });
  it('filtra por categoria', () => {
    expect(matchesFilter(andaime, { category: 'concreto', query: '' })).toBe(false);
    expect(matchesFilter(betoneira, { category: 'concreto', query: '' })).toBe(true);
  });
  it('busca ignorando acentos e caixa', () => {
    expect(matchesFilter(betoneira, { category: null, query: 'MONOFASICA' })).toBe(true);
    expect(matchesFilter(andaime, { category: null, query: 'aço' })).toBe(true);
  });
  it('exige todas as palavras da busca', () => {
    expect(matchesFilter(andaime, { category: null, query: 'andaime nr18' })).toBe(true);
    expect(matchesFilter(andaime, { category: null, query: 'andaime betoneira' })).toBe(false);
  });
});

describe('parseState e buildSearch', () => {
  it('lê categoria válida e ignora desconhecida', () => {
    expect(parseState('?categoria=concreto&q=x', cats)).toEqual({
      category: 'concreto',
      query: 'x',
    });
    expect(parseState('?categoria=inventada', cats)).toEqual({ category: null, query: '' });
  });
  it('monta a query sem parâmetros vazios', () => {
    expect(buildSearch({ category: null, query: '' })).toBe('');
    expect(buildSearch({ category: 'concreto', query: '  betoneira ' })).toBe(
      '?categoria=concreto&q=betoneira',
    );
  });
  it('ida e volta preserva o estado', () => {
    const state = { category: 'altura-acesso', query: 'escada' };
    expect(parseState(buildSearch(state), cats)).toEqual(state);
  });
});
