import type { ImageMetadata } from 'astro';

// Todas as fotos do catálogo, resolvidas no build pelo nome do arquivo.
const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/equipment/*.jpg', {
  eager: true,
});

/** Foto pelo nome do arquivo, ou undefined se ainda não existir em src/assets/equipment/. */
export function findPhoto(photoFile: string): ImageMetadata | undefined {
  const entry = Object.entries(modules).find(([path]) => path.endsWith(`/${photoFile}`));
  return entry?.[1].default;
}

/** Foto obrigatória: falha no build se o arquivo não existir. */
export function photoFor(photoFile: string): ImageMetadata {
  const photo = findPhoto(photoFile);
  if (!photo) throw new Error(`Foto não encontrada em src/assets/equipment/: ${photoFile}`);
  return photo;
}
