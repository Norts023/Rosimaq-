import type { ImageMetadata } from 'astro';

// Mapa da região, guardado no próprio site (sem serviços de terceiros).
// Para trocar o mapa, substitua o arquivo em src/assets/map/.
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/map/*.{jpg,jpeg,png,webp}',
  {
    eager: true,
  },
);

/** Imagem do mapa, ou undefined se nenhum arquivo estiver em src/assets/map/. */
export function findMapImage(): ImageMetadata | undefined {
  const first = Object.values(modules)[0];
  return first?.default;
}
