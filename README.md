# Rosimaq · site institucional

Site estático da Rosimaq, locação de equipamentos para construção civil em Santana de Parnaíba/SP.
O objetivo do site é levar o visitante a pedir orçamento pelo WhatsApp.

## Stack

- **Astro** com saída estática (`output: 'static'`), sem JavaScript por padrão.
- **TypeScript** em modo `strict`.
- **Tailwind CSS v4** pelo plugin oficial do Vite.
- **Fonte:** Archivo, self-hosted via Fontsource (licença OFL).
- **Imagens:** `astro:assets`, com AVIF e WebP.
- **Testes:** Vitest (funções puras) e Playwright com `@axe-core/playwright`.
- **Lint e formatação:** ESLint e Prettier.
- **Gerenciador de pacotes:** pnpm.

## Como rodar

Requisitos: Node 22 ou superior e pnpm.

```bash
pnpm install
pnpm dev          # desenvolvimento em http://localhost:4321
pnpm build        # gera o site estático em dist/
pnpm preview      # serve o dist/ localmente
```

## Scripts

| Script          | O que faz                                                                                                  |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| `pnpm dev`      | Servidor de desenvolvimento                                                                                |
| `pnpm build`    | Checagem de tipos (`astro check`) e build estático                                                         |
| `pnpm preview`  | Serve o `dist/` gerado                                                                                     |
| `pnpm brand`    | Gera favicons, ícones, `site.webmanifest` e `og-image.jpg` a partir de `src/assets/brand/logo-rosimaq.jpg` |
| `pnpm lint`     | ESLint e Prettier em modo verificação                                                                      |
| `pnpm format`   | Formata o projeto com Prettier                                                                             |
| `pnpm test`     | Testes unitários (Vitest)                                                                                  |
| `pnpm test:e2e` | Testes end-to-end e de acessibilidade (Playwright)                                                         |

Para rodar os testes e2e localmente pela primeira vez, instale o navegador do Playwright
(`pnpm exec playwright install chromium`). No ambiente remoto, o Chromium já vem instalado.

## Variável de ambiente

| Variável          | Padrão                    | Uso                                                                                                                                                |
| ----------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PUBLIC_SITE_URL` | `https://www.rosimaq.com` | URL pública do site. A origem vai para `site` e o caminho (se houver) para `base`. Usada em canonical, Open Graph, sitemap, `robots.txt` e JSON-LD |

Os componentes nunca escrevem o domínio nem o caminho fixo: rotas internas passam por `withBase`
(`src/lib/url.ts`) e URLs absolutas por `absoluteUrl`. Para mudar de domínio, defina `PUBLIC_SITE_URL` no build
e gere o site de novo. Não há segredos no projeto.

## Conteúdo

- `src/data/company.ts`: dados da empresa. Fonte única de nome, CNPJ, endereço, telefone, horário e áreas atendidas.
- `src/data/equipment.ts`: catálogo com os 13 equipamentos, categorias e destaques.
- `src/assets/brand/`: logo oficial (1600 x 800, fundo preto) e a versão com fundo transparente.
- `src/assets/equipment/`: fotos do catálogo, com os nomes definidos em `equipment.ts`.

Depois de trocar o logo, rode `pnpm brand` para regenerar os ícones e a imagem Open Graph.

### Pendências de conteúdo

- **Foto do item 07 (andaime 1,00 x 1,50):** falta o arquivo `07_Andaime_Profissional_Aco_1,00x1,50_NR18.jpg`.
  Enquanto não existir, o card mostra "Foto em breve".
- **Títulos principais:** marcados com `<!-- APROVAR TEXTO -->`, aguardando aprovação.
- **Política de privacidade:** marcada com `<!-- REVISAR COM A ROSIMARQ -->`.

## Publicação atual: GitHub Pages

O site está publicado em **https://norts023.github.io/Rosimaq-/** pelo workflow
`.github/workflows/pages.yml`, que roda a cada push na `main`. Ele define
`PUBLIC_SITE_URL=https://norts023.github.io/Rosimaq-`, então o site usa o caminho `/Rosimaq-/`.

- Para ativar: em Settings → Pages, a fonte deve ser **GitHub Actions** (o workflow tenta ativar sozinho).
- O GitHub Pages não lê o arquivo `_headers`, então a Content-Security-Policy e os cabeçalhos de segurança
  não são aplicados nessa publicação. Eles valem quando o site for para Netlify ou Cloudflare Pages.
- Quando a Rosimaq tiver domínio próprio, troque `PUBLIC_SITE_URL` no workflow (ou defina a variável no repositório)
  e publique de novo.

## Deploy em outros provedores

O site é 100% estático e funciona em qualquer hospedagem de arquivos estáticos. O provedor será escolhido
e contratado pela Rosimaq. Em todos os casos, a publicação é:

1. Defina `PUBLIC_SITE_URL` com o domínio final, por exemplo `https://www.rosimaq.com`.
2. Rode `pnpm build`.
3. Publique a pasta `dist/`.

### Netlify

- **Build command:** `pnpm build`
- **Publish directory:** `dist`
- **Variável:** `PUBLIC_SITE_URL` em Site settings → Environment variables.
- Os cabeçalhos de segurança vêm de `dist/_headers`, que é gerado no build.
- Para pnpm, mantenha `packageManager` no `package.json` e a versão do Node em 22 (`NODE_VERSION`).

### Cloudflare Pages

- **Framework preset:** Astro (ou None)
- **Build command:** `pnpm build`
- **Build output directory:** `dist`
- **Variáveis:** `PUBLIC_SITE_URL` e `NODE_VERSION=22`.
- O arquivo `_headers` também é reconhecido pelo Cloudflare Pages.

### Vercel

- **Framework preset:** Astro
- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **Variável:** `PUBLIC_SITE_URL`.
- O projeto não inclui `vercel.json`. Os cabeçalhos de segurança de `_headers` não são aplicados pela
  Vercel, então, se for usar a Vercel, crie um `vercel.json` com os mesmos cabeçalhos.
- **Atenção:** o plano gratuito (Hobby) da Vercel não permite uso comercial. Confira as condições atuais
  antes de escolher o plano, porque elas mudam.

### Apontando o domínio

No provedor escolhido, adicione o domínio customizado e siga as instruções dele para o registro DNS:

- Para `www`, use um registro CNAME apontando para o endereço que o provedor informar.
- Para o domínio raiz, use o registro indicado pelo provedor (ALIAS/ANAME, A ou o recurso de apex
  que ele oferecer).
- Ative HTTPS no painel do provedor e depois confirme que `PUBLIC_SITE_URL` usa o mesmo domínio.

## Integrações e cabeçalhos

- **Sitemap:** `@astrojs/sitemap` gera `sitemap-index.xml` no build.
- **robots.txt:** gerado a partir da configuração do site, apontando para o sitemap.
- **Content-Security-Policy:** cada página recebe uma política que permite apenas `'self'` e os hashes SHA-256 dos
  scripts inline do Astro, gerados no build por `scripts/csp-integration.mjs`. O `style-src` permite
  `'unsafe-inline'` por causa dos atributos `style` do projeto.
- **LGPD:** o site não usa cookies, analytics, formulários nem scripts, fontes, mapas ou widgets de terceiros.

## Estrutura

```
public/            favicons, og-image.jpg, robots (gerado), site.webmanifest, _headers
scripts/           generate-brand-assets.mjs e csp-integration.mjs
src/
  assets/          brand/ e equipment/
  components/      cabeçalho, rodapé, cards, diálogo, filtro, SEO e demais
  data/            company.ts e equipment.ts
  layouts/         BaseLayout.astro
  lib/             whatsapp, openStatus, catalog, photos, dialogs e demais
  pages/           /, /equipamentos, /contato, /privacidade, 404 e robots.txt
  styles/          global.css com os tokens de design
tests/
  unit/            Vitest
  e2e/             Playwright
```

## Como editar a Rosi

A Rosi é a assistente de pré-atendimento do site. Ela funciona com botões e uma busca simples por palavras-chave, tudo no navegador: não usa IA e não envia nada até a pessoa tocar em enviar no WhatsApp.

**Onde ficam os textos:** tudo o que a Rosi fala, os nomes dos botões e as palavras que ela entende ficam em um único arquivo, `src/data/rosi.ts`. As regras de conversa e a lógica não precisam ser mexidas para trocar textos.

**Como trocar uma fala ou um botão:** edite o texto entre aspas no arquivo. Os nomes entre chaves, como `{nome}`, são preenchidos pelo site; não os apague.

**Como incluir uma pergunta frequente:**

1. Adicione um item em `faqTopics`, com um `id` novo e o rótulo do botão.
2. Adicione a resposta em `faqAnswers` ou inclua o tratamento em `faqAnswer` (`src/lib/rosi/engine.ts`), sempre com dados de `company.ts` ou `equipment.ts`.
3. Adicione os termos que o visitante pode digitar em `synonyms`, sem acento e em minúsculas.

**Como adicionar sinônimos:** cada intenção em `synonyms` é uma lista de palavras ou expressões. Quem digita "britadeira" encontra o martelete rompedor porque `britadeira` está em `equipmentSynonyms`.

**Como testar depois de editar:**

```bash
pnpm test        # testes unitários: fluxo, busca, mensagem do WhatsApp
pnpm test:e2e    # testes de navegador: pedido completo, perguntas, teclado e acessibilidade
```

**Regras que não devem ser quebradas:** nunca colocar preço, prazo ou disponibilidade nos textos; a Rosi só responde o que está nos dados do site e encaminha o resto para a equipe.

## Integração contínua

O workflow `.github/workflows/ci.yml` roda em cada pull request e em pushes para `main`:
instala com pnpm, executa `lint`, `test`, `build` e `test:e2e`.

## Qualidade

Metas do prompt e resultados medidos no Lighthouse mobile (build de produção):
Performance, Acessibilidade, Boas práticas e SEO de 100 nas páginas de início, equipamentos e contato.
Os testes e2e verificam ausência de rolagem horizontal em 375, 768 e 1280 px, uma única `h1` por página,
meta tags Open Graph com URL absoluta, console sem erros e axe sem violações sérias ou críticas.
