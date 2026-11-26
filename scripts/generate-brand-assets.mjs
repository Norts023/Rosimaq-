// Gera favicons, ícones, manifest e imagem Open Graph a partir do logo oficial.
// Uso: pnpm brand
import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = join(root, 'src/assets/brand/logo-rosimaq.jpg');
const PUBLIC = join(root, 'public');
const BG = { r: 0x11, g: 0x11, b: 0x11 };
const BG_HEX = '#111111';

// Recorte do "R" com a escavadeira (logo de 1600 x 800). Ajuste se o recorte não ficar centrado.
const ICON_REGION = { left: 520, top: 10, width: 560, height: 420 };

/**
 * O logo tem fundo preto puro (#000). Converte a luminosidade em transparência
 * para que ele se funda ao fundo #111111 sem uma caixa visível.
 */
async function logoWithTransparentBlack(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const lum = Math.max(data[i], data[i + 1], data[i + 2]);
    // 0..14 totalmente transparente; 14..40 rampa suave; acima de 40 opaco.
    const alpha = Math.min(1, Math.max(0, (lum - 14) / 26));
    data[i + 3] = Math.round(alpha * 255);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

async function squareIcon(size, logoPng) {
  const iconSize = Math.round(size * 0.78);
  const sized = await sharp(logoPng)
    .extract(ICON_REGION)
    .resize({ width: iconSize, height: iconSize, fit: 'inside' })
    .png()
    .toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { ...BG, alpha: 1 } },
  })
    .composite([{ input: sized, gravity: 'centre' }])
    .png()
    .toBuffer();
}

/** ICO com PNG embutido (suportado desde o Windows Vista). */
function buildIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry[0] = size >= 256 ? 0 : size;
  entry[1] = size >= 256 ? 0 : size;
  entry[2] = 0;
  entry[3] = 0;
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(6 + 16, 12);
  return Buffer.concat([header, entry, pngBuffer]);
}

async function ogImage() {
  const width = 1200;
  const height = 630;
  const logoPng = await logoWithTransparentBlack(LOGO);
  const logo = await sharp(logoPng).resize({ width: 720 }).png().toBuffer();
  // Holofote no canto direito, sobre #111111.
  const spotlight = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <radialGradient id="g" cx="1000" cy="150" r="700" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#F5B800" stop-opacity="0.32"/>
          <stop offset="0.55" stop-color="#F5B800" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="${BG_HEX}"/>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
    </svg>`);
  const buffer = await sharp(spotlight)
    .composite([{ input: logo, gravity: 'centre' }])
    .flatten({ background: BG_HEX })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
  // Orçamento: abaixo de 300 KB para o WhatsApp.
  let quality = 86;
  let out = buffer;
  while (out.length > 300 * 1024 && quality > 60) {
    quality -= 4;
    out = await sharp(spotlight)
      .composite([{ input: logo, gravity: 'centre' }])
      .flatten({ background: BG_HEX })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }
  return { buffer: out, quality };
}

async function main() {
  await mkdir(PUBLIC, { recursive: true });

  const sizes = {
    'favicon-16.png': 16,
    'favicon-32.png': 32,
    'apple-touch-icon.png': 180,
    'icon-192.png': 192,
    'icon-512.png': 512,
  };
  const logoPng = await logoWithTransparentBlack(LOGO);
  // Versão sobre preto para o cabeçalho e o rodapé (fundo transparente).
  await writeFile(join(root, 'src/assets/brand/logo-rosimaq-sobre-preto.png'), logoPng);
  const rendered = {};
  for (const [name, size] of Object.entries(sizes)) {
    rendered[size] = await squareIcon(size, logoPng);
    await writeFile(join(PUBLIC, name), rendered[size]);
  }
  await writeFile(join(PUBLIC, 'favicon.ico'), buildIco(rendered[32], 32));

  const manifest = {
    name: 'Rosimaq Locação de Equipamentos',
    short_name: 'Rosimaq',
    start_url: './',
    display: 'standalone',
    theme_color: BG_HEX,
    background_color: BG_HEX,
    icons: [
      { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  await writeFile(join(PUBLIC, 'site.webmanifest'), JSON.stringify(manifest, null, 2) + '\n');

  const og = await ogImage();
  await writeFile(join(PUBLIC, 'og-image.jpg'), og.buffer);

  console.log(`favicons e ícones gerados em public/`);
  console.log(`og-image.jpg: ${(og.buffer.length / 1024).toFixed(0)} KB (qualidade ${og.quality})`);
}

await main();
