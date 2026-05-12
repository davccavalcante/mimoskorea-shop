---
name: history
description: Linha do tempo das decisões de arquitetura — o que era, o que mudou, por quê.
version: 0.2.0
related:
  - PLAN.md
  - DESIGN.md
  - MARKETPLACES.md
  - SHOPEE.md
---

# HISTORY — Decisões e evolução

Resumo cronológico das decisões importantes. Estado atual sempre em `PLAN.md`.

## Abril 2026 — Sprint 0 (planejamento)

Documento original em `.docs/plano-projeto-sprints.md` (apagado após consolidação).

### Decisões iniciais (mantidas)
- Página única (`/`) como vitrine read-only
- Estilo wireframe estilo Amazon
- Tema claro padrão + escuro ativável
- Tipografia 24/16
- Figtree via `next/font/google`
- Phosphor como única lib de ícones
- Framer Motion contido, sem glow
- Tailwind v4 + tokens semânticos
- Biome (lint + format)

### Decisões iniciais (revistas/revogadas)
| O que era | O que virou | Por quê |
| --- | --- | --- |
| `data/catalog.json` como fonte | Sync ao vivo via API + snapshot estático | API real disponível para Shopee e ML; snapshot serve só como fallback |
| Schema com `id: UUID v4` | Schema com `id: "marketplace:itemId"` | ID composto evita colisão e dispensa geração de UUID; serve de chave natural |
| `links[]` array por canal | `url` único por produto + `marketplace` enum | Cada produto tem 1 origem por marketplace; vitrine direciona pro canal de origem, não consolida múltiplos |
| Shadcn UI como base | Componentes custom sobre Tailwind v4 | Shadcn nunca foi instalado de fato; primitivas Radix removidas em maio (49 deps cortadas) |
| Endpoint `/api/products/[ref]` (detalhe) | Apenas `/api/products` (lista) | Card linka direto pro marketplace; sem página de detalhe interna |
| Endpoint `/api/health` | Pendente, não criado | Item movido pra `TASK.md` Grupo 13 |
| `data/catalog.json` editado manualmente | `lib/snapshots/shopee.json` gerado por script | Snapshot Shopee é commitado; ML não precisa de snapshot porque sync ao vivo é estável |
| Webhooks de marketplace | Cron pull a cada 30 min | Latência aceitável; webhooks adiados |
| Painel admin pra carga em lote | Não implementado, fora do escopo | Catálogo gerenciado direto nos painéis dos marketplaces |
| Importação CSV | Não implementado | Mesma justificativa |

## Maio 2026 — Implementação real

### Sprint Shopee (sync ao vivo)
- Cliente Open Platform v2 (`lib/shopee/`) com HMAC-SHA256
- OAuth callbacks (`/api/shopee/oauth/{start,callback}`)
- Sync via `get_item_list` + `get_item_base_info` + `get_model_list`
- Bug `has_model=true`: preço/estoque vivem em `get_model_list`, não em `get_item_base_info` — sync corrigido
- Snapshot estático em `lib/snapshots/shopee.json` como fallback

### Sprint Mercado Livre
- Cliente (`lib/meli/`) com OAuth
- Sync via `users/{id}/items/search` + `items?ids=...` em batches de 20
- Bootstrap via `MELI_REFRESH_TOKEN` no `.env`

### Sprint persistência (sem banco)
- Decidido: **sem Supabase**, sem banco de dados
- Tokens persistem em `tokens.json` no disco (escrita atômica via tmp + rename)
- Path configurável via `TOKENS_FILE` (default `<cwd>/tokens.json`)
- Memória do processo atua como cache de leitura por cima do arquivo
- Em produção (Debian + systemd) o arquivo deve ficar fora do diretório do deploy

### Sprint cleanup (final maio)
- Removidos `@supabase/*` (decisão sem-banco) e código associado em `lib/repo/products.ts`, `lib/repo/tokens.ts`, `lib/repo/bootstrap.ts`
- Removidas 49 deps não usadas (29 Radix UI + 20 outras como `axios`, `recharts`, `react-hook-form`, `zod`, etc.)
- Apagados `info.txt`, `Minhas aplica__es.jpeg`, `vercel.json`, `AUDIT.md`, `skills-lock.json`
- Apagados 60 produtos placeholder fake em `lib/products.ts`
- Apagado `lib/utils.ts` (helper `cn` não usado)
- Scripts npm `lint`/`lint:fix` renomeados pra `biome`/`biome:fix`
- `.docs/` consolidado em `docs/DESIGN.md`, `docs/MARKETPLACES.md` e este `docs/HISTORY.md`

## Pendências relevantes (de planos antigos que ainda valem)

Itens do Sprint 7-8 originais que **continuam abertos** (rastreados em `TASK.md`):

- Deploy real (Debian 12 + Nginx + systemd + cron systemd)
- Página `/contato` ou link de SAC visível
- SEO básico (`robots.ts`, `sitemap.ts`, OG, JSON-LD)
- Páginas legais (LGPD)
- Auditoria de contraste WCAG AA
- Configurar Sentry (`@sentry/nextjs` instalado mas não importado)
- Smoke test e snapshot test
- Hook de pre-commit com `biome check`

## Riscos herdados

Documentados originalmente, ainda vigentes:

- **Mudança de termos das APIs:** mitigação atual — snapshot Shopee como rede de segurança; sync ML é tolerante a falhas (não derruba o site)
- **Custos SP-API Amazon:** mitigação — Amazon não integrado, decisão consciente até validar custos vigentes (ver `MARKETPLACES.md` §3)
- **Consistência de preço:** se sync atrasa, site mostra preço da última sincronização; aceito como trade-off (latência <30 min)
