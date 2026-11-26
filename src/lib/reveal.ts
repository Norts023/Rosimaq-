/**
 * Revela elementos com [data-reveal] ao entrar na tela.
 * Sem JavaScript, nada fica escondido: a classe reveal-ready só é aplicada aqui.
 */
export function initReveal(): void {
  const root = document.documentElement;
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  root.classList.add('reveal-ready');
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
  );

  items.forEach((el, index) => {
    // Escalonamento curto entre irmãos (máx. 3 passos).
    el.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 80}ms`);
    observer.observe(el);
  });
}
