// Integração do Astro: gera, no fim do build, o arquivo dist/_headers com a
// Content-Security-Policy de cada página. Os scripts inline do Astro são
// liberados pelo hash SHA-256 (sem 'unsafe-inline' em script-src).
import { createHash } from 'node:crypto';
import { readFile, readdir, appendFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const INLINE_SCRIPT =
  /<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? walk(path) : path.endsWith('.html') ? [path] : [];
    }),
  );
  return files.flat();
}

function pathFor(distDir, file) {
  const rel = relative(distDir, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.replace(/\.html$/, '');
}

function policy(scriptHashes) {
  const scripts = ["'self'", ...scriptHashes].join(' ');
  return [
    "default-src 'self'",
    `script-src ${scripts}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; ');
}

export default function cspHashes() {
  return {
    name: 'rosimaq-csp-hashes',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const distDir = fileURLToPath(dir);
        const headersPath = join(distDir, '_headers');
        const pages = await walk(distDir);
        const blocks = [];

        for (const file of pages.sort()) {
          const html = await readFile(file, 'utf8');
          const hashes = [];
          for (const match of html.matchAll(INLINE_SCRIPT)) {
            const digest = createHash('sha256').update(match[1], 'utf8').digest('base64');
            hashes.push(`'sha256-${digest}'`);
          }
          const route = pathFor(distDir, file);
          const hashList = [...new Set(hashes)];
          blocks.push(`${route}\n  Content-Security-Policy: ${policy(hashList)}\n`);
        }

        // public/_headers (cabeçalhos gerais) já foi copiado para dist; acrescenta as regras por página.
        await appendFile(
          headersPath,
          `\n# Content-Security-Policy por página (gerado no build)\n${blocks.join('\n')}`,
        );
      },
    },
  };
}
