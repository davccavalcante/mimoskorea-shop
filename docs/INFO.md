---
name: mimos-korea-mkd-catalog
description: Catálogo single-page que reúne os produtos vendidos pela Mimos Korea Design no Mercado Livre, Shopee e Amazon Brasil. Cada card linka direto para o marketplace de origem.
version: 0.2.0
status: em desenvolvimento
owner: Mimos Korea Design
related:
  - PLAN.md
  - TASK.md
---

# INFO — Catálogo Mimos Korea MKD

Documento de apresentação. Para arquitetura, ler `PLAN.md`. Para o que falta, `TASK.md`.

## O que é

Página única (`/`) que mostra em grid responsivo todos os produtos da marca **Mimos Korea Design** vendidos em três marketplaces brasileiros:

- **Mercado Livre** — sync ao vivo via OAuth + cron
- **Shopee** — sync ao vivo via OAuth + cron, com snapshot estático como fallback
- **Amazon Brasil** — apenas link manual pro storefront (sem integração de API por decisão)

Cada card é um link externo: o site não processa pagamento, não tem carrinho, não tem checkout. Toda conversão acontece no marketplace.

## Para quem é

- Cliente final que descobre a marca via redes sociais ou busca e quer ver o portfólio antes de comprar.
- Parceiros que querem consultar o mix ativo.
- A própria operação interna, como vitrine pública unificada.

## Stack real

- **Next.js 16** (App Router, RSC, Turbopack)
- **TypeScript** estrito
- **Tailwind CSS v4** com tokens em `app/globals.css` via `@theme inline`
- **Phosphor Icons** (`@phosphor-icons/react`)
- **Framer Motion** — fade-in sutil nos cards
- **SWR** (`useSWRInfinite`) — scroll infinito client-side
- **Figtree** via `next/font/google`
- **Biome** — análise estática + formatação (substitui ESLint + Prettier)
- **@vercel/analytics** — coleta de page views

> Nota: o `package.json` lista vários pacotes Radix UI e shadcn/ui-adjacentes que **não são usados pelo código atual**. Os componentes são custom sobre Tailwind. Limpeza de deps fica como tarefa futura.

## Persistência e auth

- Sem banco. Tokens OAuth (Shopee + ML) ficam em `tokens.json` no disco do servidor.
- Path do arquivo configurável via env `TOKENS_FILE`. Default: `<cwd>/tokens.json` (gitignored).
- Em produção: usar caminho fora do diretório do deploy (ex.: `/var/lib/mimoskorea-shop/tokens.json`) pra sobreviver a `git pull`/rsync do CI/CD.
- Snapshot estático em `lib/snapshots/shopee.json` é seedado primeiro como rede de segurança caso o sync ao vivo falhe.

## Como rodar localmente

```bash
npm install
# Edite .env conforme docs (precisa de SHOPEE_REFRESH_TOKEN/ACCESS_TOKEN/EXPIRES_AT
# e MELI_REFRESH_TOKEN na primeira vez — veja shopee-explore/README.md)
npm run dev
```

Abre em `http://localhost:3001`.

Para validar sync manualmente:
```bash
curl -H 'x-cron-secret: <CRON_SECRET>' http://localhost:3001/api/cron/sync-meli
curl -H 'x-cron-secret: <CRON_SECRET>' http://localhost:3001/api/cron/sync-shopee
```

## Deploy planejado

Debian 12 + Nginx + systemd unit (`Restart=always`) + cron systemd disparando os endpoints `/api/cron/sync-*` periodicamente. CI/CD via GitHub futuramente.

## Estado atual (2026-05)

- ✅ UI do catálogo (grid, scroll infinito, light/dark)
- ✅ Integração Shopee Open Platform v2 (OAuth, sync, refresh automático em disco)
- ✅ Integração Mercado Livre (OAuth, sync, refresh automático em disco)
- ✅ Snapshot Shopee como fallback (110 produtos reais)
- ✅ Round-robin entre marketplaces na primeira página
- ⏳ Cron systemd em produção (pendente até subir no Debian)
- ⏳ SEO básico (robots, sitemap, OG, JSON-LD)
- ⏳ Páginas legais (LGPD)
- ❌ Amazon via SP-API (decidido não fazer no MVP)
