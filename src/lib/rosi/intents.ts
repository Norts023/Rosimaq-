import { synonyms, equipmentSynonyms } from '../../data/rosi';

/** Minúsculas, sem acentos, sem pontuação e com espaços colapsados. Função pura. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Quantos termos da lista aparecem no texto, como palavras ou expressões inteiras. */
function countTerms(padded: string, terms: string[]): number {
  return terms.reduce((total, term) => {
    const normalized = normalizeText(term);
    return normalized && padded.includes(` ${normalized} `) ? total + 1 : total;
  }, 0);
}

/** Intenção com mais termos encontrados, ou null se nada combinar. */
export function matchIntent(text: string): string | null {
  const padded = ` ${normalizeText(text)} `;
  let best: { key: string; score: number } | null = null;
  for (const [key, terms] of Object.entries(synonyms)) {
    const score = countTerms(padded, terms);
    if (score > 0 && (!best || score > best.score)) best = { key, score };
  }
  return best?.key ?? null;
}

/** Equipamento com mais termos encontrados, ou null. Empates ficam com o primeiro do catálogo. */
export function matchEquipment(text: string, ids: readonly string[]): string | null {
  const padded = ` ${normalizeText(text)} `;
  let best: { id: string; score: number } | null = null;
  for (const id of ids) {
    const score = countTerms(padded, equipmentSynonyms[id] ?? []);
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }
  return best?.id ?? null;
}

/**
 * Lê uma data no formato DD/MM. Aceita só datas de hoje em diante.
 * Devolve "DD/MM" ou null se for inválida. Função pura: recebe "hoje".
 */
export function parseDayMonth(text: string, today: Date): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})$/.exec(text.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = today.getFullYear();
  const date = new Date(year, month - 1, day);
  // Rejeita datas que o JavaScript "corrige" (ex.: 31/02).
  if (date.getDate() !== day || date.getMonth() !== month - 1) return null;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date < startOfToday) return null;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
}

/** Corta o texto digitado no limite, sem espaços sobrando. Não interpreta HTML. */
export function cleanInput(text: string, max: number): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, max);
}
