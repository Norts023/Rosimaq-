/** Funções puras do catálogo: normalização, filtro e estado da URL. */

export interface FilterState {
  /** Slug da categoria ou null para "todas". */
  category: string | null;
  /** Texto da busca, sem normalizar. */
  query: string;
}

export interface FilterableEntry {
  category: string;
  /** Texto pesquisável já normalizado (nome, descrição e especificações). */
  text: string;
}

/** Minúsculas, sem acentos e com espaços aparados. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Todas as palavras da busca precisam aparecer no texto (ordem livre). */
export function matchesFilter(entry: FilterableEntry, state: FilterState): boolean {
  if (state.category && entry.category !== state.category) return false;
  const words = normalize(state.query).split(/\s+/).filter(Boolean);
  return words.every((word) => entry.text.includes(word));
}

/** Lê ?categoria= e ?q= da URL. Categorias desconhecidas são ignoradas. */
export function parseState(search: string, validCategories: readonly string[]): FilterState {
  const params = new URLSearchParams(search);
  const categoria = params.get('categoria');
  return {
    category: categoria && validCategories.includes(categoria) ? categoria : null,
    query: params.get('q') ?? '',
  };
}

/** Monta a query string, sem parâmetros vazios. */
export function buildSearch(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.category) params.set('categoria', state.category);
  if (state.query.trim()) params.set('q', state.query.trim());
  const value = params.toString();
  return value ? `?${value}` : '';
}
