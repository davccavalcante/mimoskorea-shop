---
name: mimos-korea-mkd-catalog
description: Plano de arquitetura do catálogo Mimos Korea Design. Reflete o estado real do código em 2026-05.
version: 0.2.0
status: em-andamento
owners:
  - Mimos Korea Design
---

# PLAN — Catálogo Mimos Korea MKD

## 1. Visão Geral

Catálogo single-page consolidando produtos da marca em **Mercado Livre**, **Shopee** e **Amazon Brasil**. Cada card linka direto para o marketplace de origem — o site não processa pagamento.

Estilo wireframe minimalista (preto/branco, sem sombras/glows/gradientes), inspirado em OpenAI/Vercel.

## 2. Escopo

### Dentro
- Página única (`/`) com header + grid de produtos + footer.
- Tema light (padrão) / dark (preto puro).
- Scroll infinito + lazy loading de imagens.
- Endpoint `/api/products` paginado.
- Sync ao vivo Shopee + Mercado Livre via cron.
- Snapshot Shopee em arquivo como fallback de defesa em profundidade.
- OAuth callbacks para reautorização manual quando necessário.

### Fora (nesta versão)
- Carrinho, checkout, pagamento.
- Login de usuário/cliente final.
- Busca textual, filtros, ordenação.
- Painel administrativo.
- Amazon via SP-API (apenas link manual).
- Webhooks de marketplace pra real-time (latência atual: até 30 min).

## 3. Arquitetura

### 3.1 Diretórios reais

```
app/
├── layout.tsx                   # Figtree, Vercel Analytics, metadata
├── page.tsx                     # SSR do primeiro lote → ProductGrid
├── globals.css                  # Tokens (light/dark), reset de sombras
└── api/
    ├── products/route.ts        # GET paginado
    ├── cron/
    │   ├── sync-shopee/route.ts # protegido por CRON_SECRET
    │   └── sync-meli/route.ts   # protegido por CRON_SECRET
    ├── shopee/oauth/{start,callback}/route.ts
    └── mercadolivre/oauth/{start,callback}/route.ts

components/
├── site-header.tsx              # wordmark
├── site-footer.tsx
├── product-card.tsx             # imagem, título, preço, badge, CTA
├── product-card-skeleton.tsx
├── product-grid.tsx             # useSWRInfinite + IntersectionObserver
└── platform-badge.tsx           # Amazon / Shopee / Mercado Livre

lib/
├── products.ts                  # Tipos Product, Marketplace + helpers
├── utils.ts                     # cn()
├── env.ts                       # Loaders tipados de env vars
├── cache/
│   └── memory.ts                # Map<marketplace+id, Product> + tokens cache
├── snapshots/
│   └── shopee.json              # Snapshot estático (fallback)
├── repo/
│   ├── products.ts              # getProductsPage / upserts / archive
│   ├── tokens.ts                # getToken/saveToken (memória + arquivo)
│   ├── tokens-fs.ts             # Persistência JSON em disco (escrita atômica)
│   └── bootstrap.ts             # Seed snapshot + sync ML/Shopee em primeira request
├── shopee/
│   ├── sign.ts                  # HMAC-SHA256
│   ├── types.ts                 # Tipos da Open Platform v2
│   ├── client.ts                # OAuth, get_item_list, get_item_base_info, get_model_list
│   └── sync.ts                  # Orquestração completa
└── meli/
    ├── types.ts
    ├── client.ts                # OAuth, listUserItems, getItemsBulk
    └── sync.ts                  # Orquestração completa
```

### 3.2 Fluxo de dados de leitura

1. `app/page.tsx` (RSC) chama `getProductsPage(1, 18)` no servidor.
2. `getProductsPage` chama `bootstrapIfEmpty()`.
3. `bootstrapIfEmpty`:
   - Seeda snapshot Shopee em memória (síncrono, instantâneo).
   - Se passou >10 min do último sync ML, dispara `syncMeli()`.
   - Se passou >10 min do último sync Shopee, dispara `syncShopee()`.
   - Aguarda apenas se ML ainda não tem produtos em memória.
4. Retorna página paginada via `paginateMemory` (round-robin entre marketplaces).
5. Cliente hidrata com `useSWRInfinite` chamando `/api/products`.

### 3.3 Persistência de tokens

- Sem banco. Cada `saveToken` escreve em `tokens.json` (escrita atômica via tmp + rename).
- Path do arquivo: `process.env.TOKENS_FILE` ou `<cwd>/tokens.json`.
- Memória (`memoryStore.tokens`) atua como cache de leitura por cima do arquivo.
- Em cold start, o sync lê `tokens.json` → encontra access_token válido OU refresha → grava de volta. Ciclo se mantém indefinidamente enquanto o servidor estiver vivo e o cron rodando.

### 3.4 Bootstrap de servidor novo

`SHOPEE_REFRESH_TOKEN` + `SHOPEE_ACCESS_TOKEN` + `SHOPEE_ACCESS_TOKEN_EXPIRES_AT` no `.env` são lidos **apenas se** `tokens.json` não tem entry pra Shopee. Servem pra primeira execução em servidor novo. Após o primeiro sync, a entrada vai pro arquivo e os valores do `.env` ficam inertes.

`MELI_REFRESH_TOKEN` cumpre o mesmo papel pro Mercado Livre.

### 3.5 Schema do produto

```ts
type Marketplace = "amazon" | "shopee" | "mercadolivre"

interface Product {
  id: string              // "shopee:52359482640" ou "mercadolivre:MLB-..."
  title: string
  price: number           // BRL
  currency: "BRL"
  image: string           // URL CDN do marketplace
  url: string             // deep-link para o produto
  marketplace: Marketplace
}
```

## 4. Design System

Tokens CSS em `app/globals.css` expostos ao Tailwind via `@theme inline`. Paleta reduzida (3-5 cores por tema). Sem sombras, glows, gradientes ou emojis. `--radius: 0`. Tipografia Figtree, títulos 24px / corpo 16px.

## 5. Layout responsivo

| Breakpoint | Colunas |
| --- | --- |
| < 640px | 1 |
| ≥ 640px | 2 |
| ≥ 768px | 3 |
| ≥ 1024px | 4 |
| ≥ 1280px | 6 |

`gap-4` entre cards. `next/image` com `loading="lazy"`, `priority` apenas nos 6 primeiros, `sizes` declarado por breakpoint.

## 6. Integração com marketplaces

### 6.1 Shopee Open Platform v2

- Host produção: `https://partner.shopeemobile.com`
- App registrada em `open.shopee.com/console/app/230879`
- Endpoints usados: `auth/token/get`, `auth/access_token/get`, `product/get_item_list`, `product/get_item_base_info`, `product/get_model_list`
- Limites: `get_item_list` 100/page; `get_item_base_info` 50/lote; `get_model_list` 1/item
- access_token TTL: ~4h. refresh_token: ~30 dias na prática (rotaciona a cada uso).
- Pra itens com variação, preço/estoque vivem em `get_model_list`, não em `get_item_base_info` — o sync chama os dois.

### 6.2 Mercado Livre

- Host: `https://api.mercadolibre.com`
- App registrada com `client_id` 6250620341601377
- Endpoints: `oauth/token`, `users/{id}/items/search`, `items?ids=...`
- access_token TTL: 6h. refresh_token: 6 meses.
- Bulk de detalhes em lotes de 20.

### 6.3 Amazon Brasil

Sem integração de API. CTA "Eu quero" leva pro storefront `https://www.amazon.com.br/stores/MimosKoreaMKD`.

## 7. Performance

- SSR do primeiro lote (LCP melhor, SEO-friendly).
- `next/image` com remote patterns liberados pra CDNs ML, Shopee e Amazon (`next.config.ts`).
- Skeletons sem shimmer durante `isLoadingMore`.
- Animações Framer Motion limitadas a fade-in com stagger curto.

## 8. Acessibilidade

- `alt` das imagens preenchido pelo título.
- Contraste AA assumido pelos tokens oklch (não auditado formalmente — pendente).

## 9. Deploy

Alvo: Debian 12 + Nginx (proxy reverso) + systemd unit pro processo Node + cron systemd batendo em `/api/cron/sync-*` a cada 30 min. CI/CD via GitHub Actions com `git pull` + `npm ci` + `npm run build` + `systemctl restart`.

`tokens.json` deve ficar fora do diretório do deploy (`/var/lib/mimoskorea-shop/`) pra sobreviver a deploys. O snapshot Shopee fica dentro (`lib/snapshots/shopee.json`) e é commitado no Git.
