---
name: marketing-seo-plan
description: Plano de marketing, SEO e growth para Mimos Korea Design — vitrine que redireciona pra Shopee, Mercado Livre e Amazon Brasil. Reflete o catálogo real (K-food + bebidas coreanas).
version: 0.1.0
status: vigente
related:
  - INFO.md
  - PLAN.md
  - SHOPEE.md
  - MARKETPLACES.md
---

# MARKETING — Plano SEO + Growth + Mídia Social

> **Antes de tudo, leia a Seção 1 com calma.** Tem coisas que normalmente são prometidas em planos de marketing que não se aplicam aqui — preferi explicar do que enrolar.

## 1. Realidade do projeto e KPIs honestos

### O que é (e o que isso muda)

Este site é uma **vitrine read-only que redireciona** pra Shopee, Amazon Brasil e Mercado Livre. Tecnicamente isso significa:

- **Não há checkout, carrinho ou conversão on-site.** A "conversão" é o clique pro marketplace.
- **Link equity flui pra fora.** Cada CTA "Eu quero" é um outbound link. Pra Google isso reduz autoridade que o site acumula vs. um e-commerce próprio.
- **A venda real acontece nos marketplaces.** SEO da listagem do produto na Shopee/Amazon/ML é tão ou mais importante que SEO desse site. (Ver Seção 8.)
- **Brand search domina.** Sites de vitrine ganham mais com tráfego de marca ("mimos korea design") do que com termos genéricos competitivos.

### Sobre "100/100 em todas as métricas Semrush"

| Métrica | Alcançável como nota? | Comentário |
| --- | --- | --- |
| **Site Audit / Health Score** (Semrush) | ✅ 95-100 com higiene técnica | Resolver erros e warnings — abordado na Seção 5. |
| **Lighthouse Performance** | ✅ 90-100 | Otimizar imagens, lazy load, fonts. Seção 5. |
| **Lighthouse SEO** | ✅ 100 | Checklist técnico simples. Seção 5. |
| **Lighthouse Accessibility** | ✅ 95-100 | Contraste + ARIA. Seção 5. |
| **Authority Score** | ❌ Não é "nota a ativar" | Resultado de backlinks ao longo do tempo. 30+ é ótimo pra nicho. |
| **Organic Traffic** | ❌ Não é nota | É volume; meta = crescer X% em N meses. |
| **Keyword Rankings** | ❌ Não é nota | É posicionamento por keyword; meta = top-10 em N termos. |
| **Backlink count** | ❌ Não é nota | Volume + qualidade ao longo do tempo. |

**Posicionamento honesto:** o que a gente persegue como "100/100" são as auditorias técnicas. O resto é **maratona** — 6-12 meses pra resultados sólidos no orgânico, mais rápido com tráfego pago em paralelo.

### KPIs realistas — primeiros 90 dias

| KPI | Meta inicial | Como medir |
| --- | --- | --- |
| Site Health (Semrush) | ≥ 95/100 | Semrush Site Audit |
| Lighthouse (mobile) | ≥ 90 em todos os 4 eixos | PageSpeed Insights |
| Tráfego orgânico mensal | 500-1.500 sessões | Google Analytics |
| Cliques pro marketplace (CTR de saída) | ≥ 35% das sessões | Tag de outbound link no GA4 |
| Seguidores Instagram | +1.000 | Insights nativo |
| Seguidores TikTok | +5.000 (mais alcance que IG) | Insights nativo |
| Posições top-10 (orgânico) | ≥ 5 keywords long-tail | Search Console |
| Backlinks novos | ≥ 10 (mídia + parceiros) | Semrush / Ahrefs |

---

## 2. Diagnóstico do estado atual (resumido)

| Eixo | Status | Notas |
| --- | --- | --- |
| Title + meta description | ✅ Atualizado em maio/2026 | "Ofertas Mimos Korea Design — Shopee, Amazon e Mercado Livre" |
| H1 visível | ✅ Alinha com title | "Ofertas Mimos Korea Design na Shopee, Amazon, e Mercado Livre" |
| Robots.txt | ❌ Não existe | Crítico pra controlar indexação |
| Sitemap.xml | ❌ Não existe | Crítico pra Search Console |
| Open Graph + Twitter Card | ❌ Faltando | Sem isso, share em rede social fica feio |
| Favicon / app icons | ⚠️ Só `app/favicon.ico`; falta apple-touch | Visual nas abas e iOS home screen |
| JSON-LD (schema.org) | ❌ Não tem | `Organization`, `ItemList` ajudam SERP |
| Páginas legais (LGPD) | ❌ Privacidade + Termos faltando | Bloqueador pra pixel/ads no Brasil |
| Sentry / error tracking | ⚠️ Pacote instalado, não usado | Erros de runtime invisíveis |
| Performance (sem dev rodando ainda) | ⚠️ A medir | Esperado: bom (snapshot estático + ML cache) |

---

## 3. Pesquisa de palavras-chave

Catálogo real é dominado por **K-food + bebidas coreanas + adjacentes** (Soju Lotte, Lamen Sinomie, Café Lotte Cantata, Milkis, Yopokki, mochilas infantis temáticas, kits soju, snacks Orion).

### 3.1 Tabela priorizada

| Keyword | Tipo | Volume estimado* | Dificuldade | Intent | Score |
| --- | --- | --- | --- | --- | --- |
| produtos coreanos | Genérico | Alto | Hard | Informacional/Comercial | Médio (saturado) |
| onde comprar produtos coreanos brasil | Long-tail | Médio | Easy | Transacional | **Alto** |
| soju onde comprar | Long-tail | Médio | Easy | Transacional | **Alto** |
| lamen coreano comprar online | Long-tail | Médio | Easy | Transacional | **Alto** |
| buldak comprar brasil | Long-tail | Médio-alto | Easy | Transacional | **Alto** |
| café coreano cantata onde comprar | Long-tail | Baixo | Very easy | Transacional | **Alto** |
| soju lotte sabores | Long-tail | Médio | Easy | Comercial | **Alto** |
| yopokki onde comprar | Long-tail | Médio | Easy | Transacional | **Alto** |
| milkis bebida coreana | Long-tail | Baixo-médio | Easy | Comercial | Médio |
| salgadinho coreano orion | Long-tail | Baixo | Very easy | Comercial | Médio |
| mimos korea design | Brand | Baixo (cresce) | Trivial | Navegacional | **Alto** (defender) |
| mimos korea | Brand | Médio | Easy | Navegacional | **Alto** (defender) |
| dorameiras o que comprar | Question | Médio | Easy | Informacional | Médio |
| produtos kpop comprar brasil | Long-tail | Médio | Moderate | Comercial | Médio |
| comida coreana entrega | Long-tail | Médio | Easy | Transacional | Médio |
| ramyun vs lamen diferença | Question | Baixo | Very easy | Informacional | Médio |
| soju gosto como é | Question | Médio | Easy | Informacional | Médio |
| café coreano como tomar | Question | Baixo | Very easy | Informacional | Médio |
| kit soju presente | Long-tail | Baixo | Very easy | Transacional | Médio |
| qual lamen coreano mais picante | Question | Médio | Easy | Informacional | **Alto** (Buldak halo) |

\* Volume estimado sem dados precisos de Semrush conectado. Cifras reais virão após conectar a ferramenta — flagrado no fim deste doc.

### 3.2 Estratégia de keyword

- **Defender brand search** — "mimos korea", "mimos korea design" — site precisa estar em #1 (vai estar com técnica básica).
- **Atacar long-tail transacional** — "X onde comprar brasil" tem competição baixa e intent alto. Aproveitar mesmo com pouca autoridade.
- **Capturar long-tail informacional** — "qual lamen mais picante", "soju gosto como é" — gera tráfego topo de funil que depois desce para o catálogo.
- **Não brigar por "produtos coreanos"** no orgânico — competição alta e intent vago. Atacar via mídia paga se quiser presença ali.

### 3.3 Hashtags-chave (social)

`#mimoskoreadesign #produtoscoreanos #kfood #dorameiras #dorameira #lamen #buldak #soju #tteokbokki #yopokki #milkis #cafecoreano #snackcoreano #kpopbrasil #coreialovers #kdrama`

---

## 4. Análise competitiva (Brasil, K-food)

| Concorrente | Ângulo | Pontos fortes | Onde podemos ganhar |
| --- | --- | --- | --- |
| **Lojas Kaito** ([lojaskaito.com.br](https://www.lojaskaito.com.br/)) | E-commerce próprio multi-asiático | Catálogo amplo, blog, presença TikTok | Foco em coreano puro vs. mix asiático genérico; storytelling de marca |
| **Tsuki Produtos Orientais** ([tsukiprodutosorientais.com.br](https://www.tsukiprodutosorientais.com.br/)) | E-commerce próprio | SEO de produto bom (URLs descritivas) | Conteúdo informacional inexistente no concorrente |
| **Karamell Store** ([karamellstore.com.br](https://www.karamellstore.com.br/)) | Importados gerais | Mix global | Não é coreano-puro; ângulo de "vitrine MKD" é mais nichado |
| **Coreaninha** | Marca focal coreana | Posicionamento similar | Diferencial: vitrine multi-marketplace (cliente escolhe onde comprar) |

**Diferencial competitivo único:** "Você escolhe onde comprar — Shopee pelo frete grátis, Amazon pelo Prime, ML pelo Mercado Pago." A maioria dos concorrentes força um único ponto de venda. Use isso no copy.

---

## 5. SEO técnico do site (caminho pro 100/100)

Lista direta do que precisa virar PR. Sem todos os checks abaixo o "100/100" Semrush não acontece.

### 5.1 Bloqueadores (sem isso, indexação ruim)

- [ ] Criar `app/robots.ts` — permitir tudo, apontar pro sitemap
- [ ] Criar `app/sitemap.ts` — listar `/` (e qualquer rota futura)
- [ ] Adicionar `metadataBase` no `app/layout.tsx`
- [ ] Adicionar bloco `openGraph` (title, description, url, siteName, images, locale `pt_BR`)
- [ ] Adicionar bloco `twitter` (card, title, description, images)
- [ ] Criar `app/opengraph-image.tsx` (1200x630px) — foto representativa do catálogo
- [ ] Criar `app/icon.png` (32x32) e `app/apple-icon.png` (180x180)
- [ ] Adicionar `<link rel="canonical">` (Next App Router faz automático se `metadataBase` setado)

### 5.2 Schema.org (JSON-LD) — recomendado

- [ ] **Organization** schema com `name`, `url`, `logo`, `sameAs` (links sociais)
- [ ] **WebSite** schema com `potentialAction` SearchAction (futuro, quando tiver busca)
- [ ] **ItemList** schema na home listando os produtos visíveis (até 30 itens, com `name`, `image`, `url`, `offers.price`)
- [ ] **BreadcrumbList** se houver páginas adicionais no futuro

### 5.3 Performance (Lighthouse)

- [ ] `next/image` já usado — verificar se `priority` está nos primeiros 6 cards (já está)
- [ ] Confirmar `sizes` declarado por breakpoint (já está)
- [ ] Considerar `next/font` `display: 'swap'` (já está, Figtree)
- [ ] Pre-load do logo se for usado na primeira dobra
- [ ] Audit Core Web Vitals via PageSpeed Insights e ajustar se LCP > 2.5s ou CLS > 0.1
- [ ] HTTPS obrigatório em prod (Nginx + Let's Encrypt)

### 5.4 Acessibilidade (Lighthouse 100)

- [ ] Contraste preto sobre `#bac2f9` — auditar com axe (provavelmente passa AA, talvez não AAA)
- [ ] Todos os `<img>` com `alt` (já está, alt = título do produto)
- [ ] Foco visível em links e CTA (já está via `focus-visible:ring`)
- [ ] Labels semânticas — `<main>`, `<footer>` já presentes; site sem `<header>` (decisão do projeto), porém `<nav>` poderia voltar pra navegação futura
- [ ] `lang="pt-BR"` já no `<html>` (correto)

### 5.5 Conformidade (LGPD + CDC)

- [ ] Página `/privacidade` (Política de Privacidade)
- [ ] Página `/termos` (Termos de Uso)
- [ ] Banner de consentimento de cookies (Vercel Analytics + futuros pixels)
- [ ] Link pro SAC visível (mesmo que e-mail simples) — exigência indireta do CDC

### 5.6 Tracking e mensuração

- [ ] **Google Search Console** verificado (DNS ou HTML tag)
- [ ] **Google Analytics 4** instalado com evento `outbound_click` em cada CTA "Eu quero"
- [ ] **Meta Pixel** (Facebook + Instagram) instalado pra ads (depende de banner de cookies)
- [ ] **TikTok Pixel** instalado (mesmo)
- [ ] **Bing Webmaster Tools** verificado (Bing dá tráfego barato)

---

## 6. SEO de conteúdo — pillar pages e clusters

A vitrine pura tem teto baixo de SEO porque tem só 1 página real. **Solução: virar um híbrido vitrine + blog/guia.**

### 6.1 Estrutura proposta

```
/                       (vitrine atual, intacta)
/guias/                 (hub de conteúdo)
├── /guias/lamen-coreano        (pillar)
├── /guias/soju-coreano         (pillar)
├── /guias/cafe-coreano         (pillar)
├── /guias/snacks-coreanos      (pillar)
└── /guias/[topic]              (artigos cluster)
```

### 6.2 Pillar pages (substanciais, ~1500-2500 palavras cada)

| Pillar | Keyword principal | Conteúdo |
| --- | --- | --- |
| Lamen coreano | "lamen coreano" + "ramyun" | Diferença lamen vs ramyun, top 10 sabores no Brasil, como preparar, qual o mais picante, rota de compras (com links pros itens do catálogo) |
| Soju | "soju" + "soju onde comprar" | O que é, sabores Lotte Chum-Churum, harmonização, drinks com soju (lemon soju), onde comprar (catálogo) |
| Café coreano | "café coreano" + "café lotte cantata" | Cantata vs Let's Be, como tomar gelado, perfil de sabor, comparativo com café brasileiro |
| Snacks coreanos | "snack coreano" + "biscoito coreano" | Top 10 snacks, Orion vs Lotte vs outras, picância, doçura, links |

Cada pillar internal-linka pros produtos do catálogo. **Tráfego informacional desce pra clique de marketplace** = funil completo.

### 6.3 Cluster posts (artigos curtos ~600-1000 palavras)

Ideias derivadas que se conectam aos pillars:
- "Qual o lamen coreano mais picante? Ranking real testado"
- "Buldak Carbonara vs Frango Picante — qual escolher"
- "Como tomar soju do jeito certo (sem queimar a garganta)"
- "Os melhores snacks pra maratonar dorama"
- "Yopokki: o que é e qual sabor começar"
- "Café Lotte Let's Be Cappuccino — vale a pena?"
- "Kit presente coreano: o que incluir"

**Cadência:** 2 pillars + 4 clusters por mês = 6 páginas/mês.

### 6.4 Por que isso vai funcionar

- Concorrentes (Lojas Kaito, Tsuki, Karamell) **não têm conteúdo informacional substancial**.
- Espaço aberto pra capturar buscas de descoberta.
- Cada artigo é ponte pra clique outbound — KPI primário do site.

---

## 7. Playbook por plataforma social

### 7.1 TikTok (canal #1 — máxima prioridade)

**Por quê:** Brasil é top 3 mundial em consumo TikTok; comunidade dorameira/k-pop hiperativa; algoritmo entrega pra novos perfis.

**Cadência:** 1 vídeo/dia (mínimo 4/semana).

**Formatos que funcionam pra esse nicho:**
- **Desafios picância** (Buldak 2x Hot, Buldak Carbonara, Sinomie)
- **"Provando pela 1ª vez"** — soju, milkis, yopokki
- **"O que tem dentro de um kit coreano"** — unboxing
- **"Você só assistiu Squid Game / Crash Landing on You — agora prova o que eles tomam"** — tie-in com doramas
- **"Top 5 produtos coreanos por menos de R$ 20"** — link pro catálogo
- **Trends musicais K-pop** — usar áudios de músicas em alta
- **Transformação POV** — "POV: você descobriu que coreano vende café gelado pronto"

**Hooks que funcionam:**
- 1-3s: hook visual ou pergunta
- Caption com hashtags do nicho
- CTA fixo no final: "🔗 link na bio = catálogo Mimos Korea"

**Bio:** "K-food | Soju, Lamen, Café Coreano | mimoskorea.com.br/shop"

### 7.2 Instagram (canal #2)

**Por quê:** Comunidade dorameira ativa; Reels recicla TikTok; Stories pra promo curta.

**Mix:**
- **Reels (60% do conteúdo):** repostar TikToks com pequenas edições
- **Carrosséis educativos (20%):** "10 produtos coreanos pra começar" / "Diferença soju x sake x cachaça"
- **Stories diárias (20%):** novidades, behind, enquetes ("qual sabor de soju vc prefere?")
- **Lives mensais:** "Provando lançamentos" com convidado dorameiro

**Bio:**
```
🇰🇷 Catálogo oficial Mimos Korea Design
🌶 Soju · Lamen · Café · Snacks coreanos
🛒 Compre na Shopee, Amazon ou ML
👇
mimoskorea.com.br/shop
```

**CTAs:**
- Botão "Comprar" no perfil de Instagram Shop (vincula com catálogo).
- Sticker "link" nos stories direto pro produto na Shopee/ML/Amazon.

### 7.3 Meta (Facebook)

**Por quê:** Audiência mais velha (30-50 anos), mães comprando lanches "diferentes" pros filhos, kits presente. Não viraliza, mas tem CPM barato pra ads.

**Estratégia:**
- Manter página viva com 2-3 posts/semana (recicla IG)
- **Foco em ads paid** — Meta ads ainda tem o melhor ROI pra produtos físicos no Brasil
- Grupos de Facebook de doramas, k-pop, comida asiática — engajamento orgânico (sem spam) com posts informativos

### 7.4 X (antigo Twitter)

**Por quê:** Brasil tem comunidade k-pop forte no X; ótimo pra responsividade rápida; SEO indireto (links no X aparecem em SERP).

**Estratégia:**
- 3-5 posts/dia (volume necessário)
- **Reagir a tweets de fandom** (BTS, BLACKPINK, dorama trending) com posts contextuais (sutil, sem spam)
- **Threads informativas:** "Tudo que vc precisa saber sobre soju 🧵"
- **Live tweets de eventos coreanos** (Coreia Festival, comebacks de grupos)
- **CTA discreto** no final de threads

**Não usar X pra:**
- Promoção descarada
- Spam de produtos
- Tom corporativo

### 7.5 Onde NÃO investir (no começo)

- **YouTube:** alta produção, ROI demorado. Considerar quando tiver budget.
- **Pinterest:** funciona pra K-beauty, **não pra K-food**. Skip pra esse catálogo.
- **LinkedIn:** zero relevância pra produto de consumidor final.
- **Threads (Meta):** ainda incipiente, deixar pra fase 2.

---

## 8. Growth hacking específico do nicho

Tática × Esforço × Impacto. Foco no que **só esse nicho permite**.

### 8.1 Affiliate dorameiras (alto impacto, esforço médio)

Brasil tem **milhares de microinfluenciadoras dorameiras** (5k-50k followers). Modelo:
- Cada afiliada ganha % de cada venda atribuída via UTM
- Ela escolhe se quer link Shopee, Amazon ou ML
- Programa simples — Notion + Google Form + planilha
- Comissão sugerida: 3-7% da venda (alinha com programa de afiliado da Shopee/ML/Amazon que você JÁ recebe)

**Exec mínimo:** landing page `/parceria`, 5 afiliadas piloto, mensurar em 60 dias.

### 8.2 SEO de listagem nos marketplaces (impacto enorme — geralmente esquecido)

**O ranking do PRODUTO na Shopee/Amazon/ML afeta mais a venda final do que o ranking do site no Google.**

Ações:
- Otimizar títulos das listings (palavra-chave + variação + benefício)
- Otimizar bullet points e descrição (Amazon) / atributos (ML/Shopee)
- Subir 6+ imagens de qualidade por produto
- Stimular reviews via packaging insert ("avalie e ganhe X")
- Manter estoque alto (algoritmo desfavorece quem rompe)

Esse trabalho é fora do escopo deste site, mas **paga mais que SEO do site**. Vale priorizar.

### 8.3 Bundles de presente (moderado/alto)

Doramas e k-pop estão saturados de "kits do BTS", "kit coreano básico". Criar bundles temáticos:
- "Kit Sobreviva à Maratona Dorama" (lamen + café + snack)
- "Kit Soju + Drinks" (soju + sabores)
- "Kit Iniciante K-food"

Cada bundle = produto Shopee/Amazon/ML separado + página dedicada no site. Aumenta ticket médio.

### 8.4 SEO local (baixo esforço, médio impacto)

Mesmo sendo D2C, listar a marca em:
- Google Business Profile (mesmo sem loja física, perfil de marca ajuda)
- Bing Places
- Diretórios de produtos importados

### 8.5 Reviews + UGC (alto impacto)

- Pedir review por DM no Instagram pós-compra detectada (UTM)
- Reposter UGC com permissão (TikToks de gente provando produtos)
- "Wall of love" no site futuramente — seção de testimonials

### 8.6 Email/SMS list-building (orgânico)

- Pop-up "Receba o cupom do mês + receitas coreanas" → email
- Sequência de 5 emails (primeira semana) educando sobre o que tem no catálogo
- 1 email/semana com produto da semana, receita ou dorama recomendation

Considerar: SMS curtinho com cupom no fim do mês. CTR > email.

---

## 9. Táticas 2026

### 9.1 GEO (Generative Engine Optimization)

Buscadores com IA (Perplexity, ChatGPT Search, Gemini) **citam fontes**. Ser citado vale tanto quanto ranquear no Google.

Como aparecer:
- **Conteúdo factual e estruturado** (listas, tabelas, dados específicos)
- **Schema.org rico** (já listado na Seção 5.2)
- **Source quality**: ter URL próprio (mimoskorea.com.br) ajuda mais que medium/blog terceiro
- **Atualização frequente** (LLMs preferem fontes recentes)
- **FAQ schema** em todas as pillar pages
- **llms.txt** na raiz (`/llms.txt`) — convenção 2026 pra dizer aos LLMs o que está disponível

### 9.2 AI Overviews (Google) friendly

Google AI Overviews puxa de páginas com resposta direta. Estrutura:
- Pergunta como H2
- Resposta direta em 1-2 frases logo abaixo
- Detalhes em parágrafos seguintes

Aplicar nas pillar pages e clusters da Seção 6.

### 9.3 Short-form first

Mais de 70% do tempo gasto em redes sociais no Brasil em 2026 é em vídeo curto (TikTok + Reels). **Toda comunicação deve nascer em vídeo curto e ser reciclada.**

### 9.4 Comerce live (Shopee Live, TikTok Shop)

Shopee Live no Brasil já funciona. TikTok Shop ainda em rollout, mas vale preparar:
- Treinar 1 host
- Catálogo de produtos com cobertura de Lives
- Cadência: 1 Live/semana de 30min

### 9.5 Conteúdo gerado com IA (com marca humana)

Ferramentas (ChatGPT, Claude, Suno, Sora, etc.) aceleram produção:
- Roteiros de vídeo
- Carrosséis IG
- Resumos de doramas pra postar
- Tradução de conteúdo coreano oficial das marcas

**Regra crítica:** sempre revisão humana antes de publicar. IA detectada baixa rank no Google e quebra confiança.

---

## 10. Roadmap 90 dias

### Mês 1 — Fundação técnica e setup

| Semana | Foco | Entregáveis |
| --- | --- | --- |
| 1 | SEO técnico bloqueador | robots.ts, sitemap.ts, metadata OG/Twitter, JSON-LD Organization |
| 2 | Performance + a11y | Lighthouse 90+ em todos os eixos; OG image; favicons |
| 3 | Tracking | GA4 com `outbound_click`; Search Console; Bing Webmaster; Meta Pixel |
| 4 | Legal | /privacidade, /termos, banner cookies, link SAC |

### Mês 2 — Conteúdo + presença social

| Semana | Foco | Entregáveis |
| --- | --- | --- |
| 5 | Pillar #1 + setup TikTok | Pillar Lamen publicado; conta TikTok ativa, 4 vídeos |
| 6 | Pillar #2 + reciclagem IG | Pillar Soju; Reels de 5 vídeos no IG |
| 7 | Pillar #3 + ads piloto | Pillar Café; Meta Ads piloto com R$ 30/dia em 3 criativos |
| 8 | Pillar #4 + UGC | Pillar Snacks; primeiros UGCs publicados; lançamento programa de afiliadas |

### Mês 3 — Otimização e escala

| Semana | Foco | Entregáveis |
| --- | --- | --- |
| 9 | Cluster posts + community | 4 cluster posts; engajamento ativo em grupos FB |
| 10 | Bundles | 3 kits temáticos lançados (Shopee/ML/Amazon + página) |
| 11 | Marketplace SEO | Otimização de top-20 listings em cada plataforma |
| 12 | Análise + Q4 plan | Review de KPIs; plano refinado pros próximos 90 dias |

---

## 11. Como medir

### Pilha mínima (gratuita)

- **Google Analytics 4** — sessões, fontes, eventos `outbound_click` por marketplace
- **Google Search Console** — keywords ranqueadas, CTR, posições
- **Bing Webmaster Tools** — espelho do Search Console pra Bing/DuckDuckGo
- **Meta Business Suite** — alcance e ads ROI no IG/FB
- **TikTok Analytics** — alcance, engajamento, demografia
- **PageSpeed Insights** — Core Web Vitals; semanal
- **Vercel Analytics** — já instalado; pageviews real-time

### Pilha paga (depois que tiver receita validando)

- **Semrush** ou **Ahrefs** — keyword research preciso, monitoramento de concorrentes, backlinks
- **Hotjar** — heatmaps e gravação de sessão
- **Mailchimp** ou **MailerLite** — automação de email (free até 1000 contatos)

### Dashboard semanal sugerido

Planilha simples com 8 linhas:
1. Sessões orgânicas (delta semana)
2. Cliques pro marketplace (delta)
3. Impressões Search Console (delta)
4. Posição média top-10 keywords-alvo
5. Alcance total social (TikTok + IG + FB + X)
6. Novos seguidores
7. Lighthouse score
8. Erros novos no Search Console / Site Audit

---

## 12. O que NÃO recomendo (decisões duras)

- ❌ **Skincare/k-beauty no catálogo** sem ter o produto físico — é categoria diferente, exige autoridade médica/dermato e margem boa, e o catálogo atual não tem.
- ❌ **Black-hat SEO** (PBNs, link farms, keyword stuffing) — Google penaliza rápido em 2026; não vale o risco.
- ❌ **Pagar reviews em massa** — Shopee/Amazon detectam e suspendem.
- ❌ **Influencer macro (>500k followers) sem ROI claro** — caro, ROAS instável; comece com micro/nano.
- ❌ **Pinterest** — cap baixo pra K-food no Brasil (skincare funciona, comida não tanto).
- ❌ **YouTube Shorts** sem ter canal estabelecido — opportunity cost vs TikTok é alto.

---

## Apêndice — itens novos no `TASK.md`

Os itens técnicos abaixo são copiados em `docs/TASK.md` Grupo 11 (já existe) e Grupo 14 (novo, marketing).

### Grupo 14 — Marketing e SEO de conteúdo (novo)

- [ ] Criar estrutura `/guias/[slug]` com layout e Metadata por página
- [ ] Publicar pillar pages (lamen, soju, café, snacks)
- [ ] Adicionar JSON-LD `FAQPage` + `Article` em cada pillar
- [ ] Adicionar `llms.txt` na raiz
- [ ] Setup GA4 com evento `outbound_click` no CTA "Eu quero"
- [ ] Setup Search Console + Bing Webmaster
- [ ] Setup Meta Pixel + TikTok Pixel (depende de banner cookies)
- [ ] Landing page `/parceria` pro programa de afiliadas
- [ ] 3 bundles temáticos como produtos próprios em cada marketplace + páginas dedicadas no site

---

## Sources

- [K-Tudo: como a Coreia já molda o consumo no Brasil — Mercado&Consumo](https://mercadoeconsumo.com.br/17/04/2026/artigos/k-tudo-como-a-coreia-ja-molda-o-consumo-no-brasil/)
- [Produtos coreanos: tendências no Mercado Livre em 2025 — Nubimetrics](https://academia.nubimetrics.com/br/produtos-coreanos)
- [Produtos coreanos ganham destaque no e-commerce brasileiro — Jornal do Brás](https://jornaldobras.com.br/noticia/87645/produtos-coreanos-ganham-destaque-no-e-commerce-brasileiro-com-forca-da-hallyu)
- [Onde Encontrar Produtos Coreanos em 2026 — Feminina Moda](https://femininamoda.com.br/onde-encontrar-produtos-coreanos-2026-guia-completo-online-fisico/)
- [Concorrente — Lojas Kaito](https://www.lojaskaito.com.br/)
- [Concorrente — Tsuki Produtos Orientais](https://www.tsukiprodutosorientais.com.br/)
- [Concorrente — Karamell Store](https://www.karamellstore.com.br/)
