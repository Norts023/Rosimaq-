# Site Rosimaq: status do projeto

Documento de acompanhamento. Diz o que está pronto, o que foi verificado e **as ressalvas** que ainda dependem de decisão ou material da Rosimaq.

**Site publicado:** https://norts023.github.io/Rosimaq-/
**Repositório:** https://github.com/Norts023/Rosimaq-

---

## 1. O que está pronto

### Base técnica
- Astro com saída estática, TypeScript em modo strict, Tailwind v4, pnpm.
- ESLint, Prettier, Vitest (52 testes unitários) e Playwright (79 testes de navegador, em desktop e celular, com axe).
- CI com lint, testes, build e e2e em cada PR (workflow `ci.yml`).
- Deploy automático no GitHub Pages a cada merge na `main` (workflow `pages.yml`).

### Dados e utilitários
- `src/data/company.ts`: fonte única dos dados da empresa.
- `src/data/equipment.ts`: os 13 equipamentos, categorias e destaques.
- `src/lib/`: link do WhatsApp, horário no fuso de São Paulo, filtro do catálogo, caminho base e URLs absolutas.

### Marca e SEO
- Logo, favicons, ícones, manifest e imagem Open Graph gerados por `pnpm brand`.
- Meta tags, canonical, JSON-LD, sitemap e `robots.txt`.

### Páginas
- **Início:** hero com títulos em rodízio, faixa de diferenciais, categorias, destaques, "como funciona", regiões atendidas e banner final. Fundo claro, num degradê único.
- **Equipamentos:** filtro por categoria e busca por nome, sincronizados com a URL. Diálogo de detalhes com foco e Esc. Âncoras como `/equipamentos#betoneira-400l`.
- **Contato:** canais, endereço, horário, áreas atendidas, ícones sociais e seção "Como chegar".
- **Privacidade:** texto curto, com seção sobre a Rosi.
- **404:** mensagem da marca e atalhos.

### Experiência
- Menu lateral do celular com links numerados, página atual destacada e contatos.
- Barra fixa no celular com WhatsApp e Ligar.
- Transições entre páginas com View Transitions; o cabeçalho permanece estável.
- Movimento com preferência reduzida respeitada em todo o site.

### Assistente Rosi (sem IA)
- Roteiro por botões: nome, cidade, tarefa ou categoria, equipamento, quantidade, início, período, entrega e observação.
- Resumo com edição, mais, menos e remoção de itens.
- Perguntas frequentes e busca por palavras-chave, sem inventar resposta.
- Envio por link real do WhatsApp, com a mensagem pronta.
- Conversa guardada na sessão do navegador, apagada por "Recomeçar".
- Carregamento sob demanda, cerca de 10 KB gzip.
- Texto editável em `src/data/rosi.ts`, com instruções na seção "Como editar a Rosi" do README.

### Publicação
- PRs #1 a #13 mesclados na `main`.
- Último deploy do Pages concluído com sucesso.

---

## 2. Verificação feita

| Item | Resultado | Observação |
|---|---|---|
| Lighthouse mobile (home, com a Rosi) | Performance 100, Acessibilidade 100 | Medido antes da troca para fundo claro |
| Lighthouse mobile (equipamentos e contato) | Performance 100, Acessibilidade 98–100 | Medido antes da troca para fundo claro |
| Sem rolagem horizontal | 375, 768 e 1280 px, em todas as páginas | Testado no navegador |
| CSP | Sem violações na página de teste | Só vale fora do GitHub Pages |
| Testes | 52 unitários e 79 de navegador passam | — |

---

## 3. Ressalvas (dependem de decisão ou de material da Rosimaq)

### Visual e identidade
- **Cabeçalho e rodapé continuam escuros.** O logo disponível foi feito para fundo escuro. Para o fundo claro, é preciso uma versão do logo para fundo claro.
- **Páginas além da home** receberam o fundo claro, mas só foram conferidas em capturas do topo. Vale revisar o celular nelas.
- **Lighthouse não foi medido de novo** depois da troca para fundo claro.
- **Seção de regiões** deixou de ser escura, como pedia o prompt original. Foi decisão tomada com o cliente.

### Conteúdo
- **Títulos do hero** (três frases em rodízio) estão marcados `APROVAR TEXTO`. Precisam de aprovação.
- **Textos principais** de todas as seções estão marcados `APROVAR TEXTO`.
- **Política de privacidade** tem dois trechos marcados `REVISAR COM A ROSIMARQ`, incluindo o da Rosi.
- **Textos da Rosi** precisam de revisão da Rosimaq.

### Fotos e mapa
- **Foto do item 07** (andaime 1,00 x 1,50) não existe no material recebido. O card mostra "Foto em breve". A foto 06 e a 07 do zip eram o mesmo arquivo.
- **Mapa da página de contato** mostra "Mapa em breve". Falta a imagem em `src/assets/map/`. Escolha feita: imagem no próprio site, sem serviço de terceiros.

### Acessibilidade
- **Rodízio dos títulos do hero:** o WCAG 2.2.2 exige um jeito de pausar conteúdo que se move por mais de 5 segundos. O botão de pausa foi removido a pedido. Hoje não há pausa, o que deixa essa regra sem atender. Pode voltar com um botão discreto.
- **Teste com leitor de tela:** não foi feito. A verificação foi com axe, teclado e navegador.

### Assistente Rosi
- **Cards com foto na escolha de equipamento** não foram feitos. A tela mostra botões com o nome.
- **Equipamentos sem voltagem na especificação** (extensão elétrica e máquina de pintura): a Rosi encaminha a dúvida para a equipe, sem inventar valor.
- **Balão de ajuda:** aparece uma vez por sessão, após 15 segundos no catálogo. A Rosimaq deve aprovar o comportamento.

### Componentes do Uiverse
- Cinco componentes foram adaptados (botão, cartão de clima, loader, campo de busca e ícones sociais).
- Só os **ícones sociais** foram colocados (página de contato). Os demais aguardam decisão de onde usar.
- O **cartão de clima** não foi colocado: não há dados reais para ele.
- As cores originais (roxo, azul e rosa) não fazem parte da paleta da marca. Podem ser adaptadas para amarelo e preto.

### Hospedagem
- **Só o GitHub Pages está ativo.** A Rosimaq ainda não escolheu o provedor definitivo.
- **Cabeçalhos de segurança e CSP** não são aplicados no GitHub Pages. Para Netlify ou Cloudflare Pages, o arquivo `_headers` já está pronto. Na Vercel, falta criar um `vercel.json`.
- **Domínio próprio:** não configurado. Quando existir, basta trocar `PUBLIC_SITE_URL`.
- **Aviso do Actions:** o workflow usa versões de ações que rodam em Node 20, que será descontinuado.

### Pendências técnicas menores
- O componente `Blend` ficou sem uso depois das mudanças de fundo. Pode ser removido.
- A CI (`ci.yml`) foi configurada, mas não foi verificada no GitHub nesta sessão.

---

## 4. Próximos passos sugeridos

1. Rosimaq aprova os textos e os títulos do hero.
2. Enviar o logo para fundo claro, para cabeçalho e rodapé.
3. Enviar a foto do andaime 1,00 x 1,50 e a imagem do mapa.
4. Decidir o provedor de hospedagem e o domínio.
5. Decidir sobre a pausa dos títulos do hero (WCAG) e sobre os componentes do Uiverse.
6. Revisar a Rosi com a equipe antes de divulgar o site.
