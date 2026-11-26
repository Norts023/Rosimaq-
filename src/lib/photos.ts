import type { ImageMetadata } from 'astro';

// Todas as fotos do catálogo, resolvidas no build pelo nome do arquivo.
const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/equipment/*.jpg', {
  eager: true,
});

/** Devolve a imagem (astro:assets) pelo nome do arquivo definido em equipment.ts. */
export function photoFor(photoFile: string): ImageMetadata {
  const entry = Object.entries(modules).find(([path]) => path.endsWith(`/${photoFile}`));
  if (!entry) {
    throw new Error(`Foto não encontrada em src/assets/equipment/: ${photoFile}`);
  }
  return entry[1].default;
}
