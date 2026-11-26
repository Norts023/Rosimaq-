/**
 * Holofote do hero: o gradiente segue o cursor com suavização (rAF)
 * e o conjunto de cards se move levemente (máx. 8 px).
 * Em toque e com prefers-reduced-motion, os valores ficam fixos.
 */
export function initSpotlight(section: HTMLElement): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce || !finePointer) return;

  const target = { x: 70, y: 40, px: 0, py: 0 };
  const current = { x: 70, y: 40, px: 0, py: 0 };
  let frame = 0;

  const tick = () => {
    current.x += (target.x - current.x) * 0.12;
    current.y += (target.y - current.y) * 0.12;
    current.px += (target.px - current.px) * 0.12;
    current.py += (target.py - current.py) * 0.12;
    section.style.setProperty('--x', `${current.x.toFixed(2)}%`);
    section.style.setProperty('--y', `${current.y.toFixed(2)}%`);
    section.style.setProperty('--px', `${current.px.toFixed(2)}px`);
    section.style.setProperty('--py', `${current.py.toFixed(2)}px`);
    const settled =
      Math.abs(target.x - current.x) < 0.05 &&
      Math.abs(target.y - current.y) < 0.05 &&
      Math.abs(target.px - current.px) < 0.05 &&
      Math.abs(target.py - current.py) < 0.05;
    frame = settled ? 0 : requestAnimationFrame(tick);
  };

  const start = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  section.addEventListener('pointermove', (event) => {
    const rect = section.getBoundingClientRect();
    const rx = (event.clientX - rect.left) / rect.width;
    const ry = (event.clientY - rect.top) / rect.height;
    target.x = 20 + rx * 60;
    target.y = 15 + ry * 50;
    target.px = (rx - 0.5) * 16; // ±8 px
    target.py = (ry - 0.5) * 16;
    start();
  });

  section.addEventListener('pointerleave', () => {
    target.x = 70;
    target.y = 40;
    target.px = 0;
    target.py = 0;
    start();
  });
}
