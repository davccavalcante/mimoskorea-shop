---
name: mimos-korea-mkd-tasks
description: Quadro de tarefas. [X] = feito, [ ] = pendente.
version: 0.2.0
related:
  - PLAN.md
  - INFO.md
---

# TASK — Catálogo Mimos Korea MKD

## Grupo 1 — Fundação

- [X] Next.js 16 + App Router + TypeScript estrito
- [X] Tailwind CSS v4 + tokens em globals.css
- [X] Phosphor Icons + Framer Motion + SWR
- [X] Figtree via `next/font/google`
- [X] Biome configurado (scripts `biome`, `biome:fix`, `format`)
- [ ] Hook de pre-commit rodando `biome check`

## Grupo 2 — Design System

- [X] Tokens de cor (`--background`, `--foreground`, `--muted`, `--border`, `--primary`)
- [X] Tokens tipográficos (24px títulos / 16px corpo)
- [X] `--radius: 0` (wireframe)
- [X] Reset global de `box-shadow`, `text-shadow` e filtros
- [X] Tema único Light configurado em `:root`
- [X] Tokens expostos ao Tailwind via `@theme inline`

## Grupo 3 — Layout, Tema e Estrutura

- [X] `app/layout.tsx` com Figtree e metadata básica
- [X] `SiteHeader` + `SiteFooter`
- [X] Vercel Analytics em produção
- [ ] `robots.ts` e `sitemap.ts`
- [ ] JSON-LD `Product`/`Offer`/`Organization`
- [ ] `app/icon.*` + `app/opengraph-image.*`
- [ ] `app/not-found.tsx` + `app/error.tsx` + `app/global-error.tsx`

## Grupo 4 — Catálogo (UI)

- [X] `ProductCard` (imagem, título, preço, badge, CTA "Eu quero")
- [X] `PlatformBadge` (Amazon / Shopee / Mercado Livre)
- [X] `ProductCardSkeleton`
- [X] `ProductGrid` responsivo (1 / 2 / 3 / 4 / 6 colunas)
- [X] Animação de entrada Framer Motion (fade + stagger)
- [X] Round-robin entre marketplaces na primeira página
- [ ] Empty state (catálogo zerado)
- [ ] Tooltip de plataforma no hover do badge

## Grupo 5 — Scroll Infinito + Lazy Loading

- [X] Endpoint `/api/products?page&pageSize` paginado
- [X] `useSWRInfinite`
- [X] `IntersectionObserver` com `rootMargin: 400px`
- [X] Skeletons em `isLoadingMore`
- [X] Botão "Tentar novamente"
- [X] Rótulo de fim de catálogo
- [X] `next/image` lazy + `priority` nos 6 primeiros + `sizes`
- [X] SSR do primeiro lote como `fallbackData`

## Grupo 6 — Persistência sem banco

- [X] `lib/repo/tokens-fs.ts` — tokens em arquivo JSON com escrita atômica
- [X] `lib/repo/tokens.ts` — memória como cache + arquivo como verdade
- [X] Path configurável via `TOKENS_FILE`
- [X] Bootstrap por env var (`SHOPEE_REFRESH_TOKEN`, `MELI_REFRESH_TOKEN`)
- [X] `lib/snapshots/shopee.json` — fallback estático
- [X] Seed do snapshot em `bootstrap.ts`

## Grupo 7 — Integração Shopee

- [X] `lib/shopee/sign.ts` — HMAC-SHA256 público + por loja
- [X] `lib/shopee/client.ts` — auth, token, get_item_list, get_item_base_info, get_model_list
- [X] `lib/shopee/sync.ts` — orquestração completa
- [X] OAuth callbacks (`/api/shopee/oauth/{start,callback}`)
- [X] Cron handler (`/api/cron/sync-shopee`)
- [X] Suporte a itens com variação (`has_model=true`) via `get_model_list`
- [X] Refresh automático com buffer de 5 min
- [X] Bootstrap a partir do `.env` na primeira execução em servidor novo

## Grupo 8 — Integração Mercado Livre

- [X] `lib/meli/client.ts` — auth, refresh, listUserItems, getItemsBulk
- [X] `lib/meli/sync.ts` — orquestração completa
- [X] OAuth callbacks (`/api/mercadolivre/oauth/{start,callback}`)
- [X] Cron handler (`/api/cron/sync-meli`)
- [X] Bootstrap via `MELI_REFRESH_TOKEN`
- [X] Lock anti-concorrente (`memoryStore.syncLocks`)

## Grupo 9 — Catálogo unificado

- [X] `lib/repo/products.ts` — memória (snapshot + sync) → vazio
- [X] `lib/repo/bootstrap.ts` — snapshot Shopee + sync ML + sync Shopee
- [X] Upsert + archiveMissingProducts em ambos marketplaces
- [X] Round-robin na paginação em memória

## Grupo 10 — Deploy (Debian + Nginx)

- [ ] Unit systemd com `Restart=always`
- [ ] Cron systemd batendo nos endpoints `/api/cron/sync-*` a cada 30 min
- [ ] Path `/var/lib/mimoskorea-shop/tokens.json` configurado em `TOKENS_FILE`
- [ ] Nginx como proxy reverso (HTTPS, gzip, cache de estáticos)
- [ ] CI/CD GitHub Actions: `git pull` + `npm ci` + `npm run build` + restart
- [ ] `.gitignore` valida que `tokens.json`, `.env*` não vazam

## Grupo 11 — SEO + Conformidade BR

- [ ] `app/robots.ts`
- [ ] `app/sitemap.ts`
- [ ] OG/Twitter Card meta tags por página
- [ ] JSON-LD Product/Organization
- [ ] Política de Privacidade (LGPD)
- [ ] Termos de Uso
- [ ] Banner de cookies

## Grupo 12 — Operações

- [ ] Página `/contato` ou link de SAC visível
- [ ] Auditoria de contraste WCAG AA (axe ou Lighthouse)
- [ ] Configurar Sentry (`@sentry/nextjs` já instalado, mas não importado)
- [ ] Smoke test de `GET /api/products`
- [ ] Snapshot test de `ProductCard`

## Grupo 13 — Observabilidade e resiliência do sync

Para detectar problemas de "produtos sumindo" antes do usuário final notar.
Veja `docs/SHOPEE.md` seção 7 para causas reais já mapeadas.

- [ ] Logs estruturados (JSON) por chamada de marketplace: timestamp, endpoint, duração, status, request_id, erro
- [ ] Retentativa com backoff exponencial em erros transitórios (5xx, rate limit, timeout) — máx 3 tentativas
- [ ] Métrica de saúde por marketplace: último sync OK, contagem de produtos, taxa de erro nas últimas 24h
- [ ] Endpoint `GET /api/health` retornando status agregado (consumido por monitor externo ou dashboard interno)
- [ ] Alerta quando sync de um marketplace falhar 2 vezes seguidas (webhook Discord/Slack ou email)
- [ ] Persistir o histórico do `archive` (quais item_ids foram removidos em cada sync) para diagnosticar sumiços inesperados

## Grupo 14 — Marketing e SEO de conteúdo

Plano completo em `docs/MARKETING.md`. Itens executáveis:

- [ ] Estrutura `/guias/[slug]` com layout e Metadata por página
- [ ] Pillar pages: lamen, soju, café, snacks coreanos
- [ ] JSON-LD `FAQPage` + `Article` em cada pillar
- [ ] `llms.txt` na raiz
- [ ] GA4 com evento `outbound_click` no CTA "Eu quero"
- [ ] Setup Search Console + Bing Webmaster
- [ ] Meta Pixel + TikTok Pixel (depende de banner cookies)
- [ ] Landing `/parceria` pro programa de afiliadas (microdorameiras)
- [ ] 3 bundles temáticos como produtos próprios em cada marketplace
- [ ] Cadência de conteúdo: 2 pillars + 4 clusters por mês

## Decisões registradas

- **Sem Supabase** — escolha do owner. Persistência via arquivo no disco do servidor.
- **Sem cron Vercel** — deploy alvo é Debian. `vercel.json` removido.
- **Sem Amazon SP-API** — apenas link manual pro storefront.
- **Sem webhooks de marketplace** — sync via pull a cada 30 min.
- **Snapshot Shopee como fallback** — defesa em profundidade caso a API falhe.
