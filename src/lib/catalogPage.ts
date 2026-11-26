import { buildSearch, matchesFilter, parseState, type FilterState } from './catalog';

/**
 * Filtro da página de equipamentos. Sem JavaScript, todos os itens aparecem.
 * O estado (categoria e busca) fica sincronizado com a query string.
 */
export function initCatalog(): void {
  const root = document.querySelector<HTMLElement>('[data-catalog]');
  if (!root) return;

  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-equipment-card]'));
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-category-chip]'));
  const input = root.querySelector<HTMLInputElement>('[data-search]');
  const count = root.querySelector<HTMLElement>('[data-count]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const validCategories = chips.map((chip) => chip.dataset.categoryChip ?? '').filter(Boolean);

  let state: FilterState = parseState(location.search, validCategories);
  if (input) input.value = state.query;

  const apply = () => {
    let visible = 0;
    for (const card of cards) {
      const show = matchesFilter(
        { category: card.dataset.category ?? '', text: card.dataset.text ?? '' },
        state,
      );
      card.closest('li')?.toggleAttribute('hidden', !show);
      if (show) visible += 1;
    }

    for (const chip of chips) {
      const active = (chip.dataset.categoryChip ?? '') === (state.category ?? '');
      chip.setAttribute('aria-pressed', String(active));
    }

    if (count) {
      count.textContent = visible === 1 ? '1 equipamento' : `${visible} equipamentos`;
    }
    empty?.classList.toggle('hidden', visible > 0);

    const url = `${location.pathname}${buildSearch(state)}${location.hash}`;
    history.replaceState(null, '', url);
  };

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const slug = chip.dataset.categoryChip ?? '';
      state = { ...state, category: slug || null };
      apply();
    });
  }

  input?.addEventListener('input', () => {
    state = { ...state, query: input.value };
    apply();
  });

  apply();
}
