---
name: marketplaces
description: Status e research de cada marketplace (Shopee, Mercado Livre, Amazon Brasil) — implementado, pendente, ou descartado.
version: 0.2.0
related:
  - PLAN.md
  - SHOPEE.md
  - TASK.md
---

# MARKETPLACES

Status agregado das 3 plataformas-alvo do catálogo. Detalhes técnicos da Shopee em [`SHOPEE.md`](./SHOPEE.md). Detalhes do Mercado Livre em [`PLAN.md`](./PLAN.md) seção 6.2.

## Visão geral

| Canal | Status | Modo | Doc detalhada |
| --- | --- | --- | --- |
| **Shopee** | ✅ implementado | OAuth + cron pull, sync ao vivo, snapshot estático como fallback | [SHOPEE.md](./SHOPEE.md) |
| **Mercado Livre** | ✅ implementado | OAuth + cron pull, sync ao vivo | [PLAN.md §6.2](./PLAN.md) |
| **Amazon Brasil** | ❌ não implementado (link manual pro storefront) | Decisão registrada em `TASK.md`. Research preliminar abaixo. | esta seção |

## 1. Shopee Open Platform v2

- **Docs:** [open.shopee.com](https://open.shopee.com/)
- **App registrada:** `230879` (partner_id `2033850`, shop_id `547188217`)
- **Endpoints usados:** `auth/token/get`, `auth/access_token/get`, `product/get_item_list`, `product/get_item_base_info`, `product/get_model_list`
- **Auth:** OAuth manual one-time + refresh automático em arquivo (`tokens.json`)
- **Limitações:** access_token ~4h, refresh_token ~30 dias rotativo, "Sensitive Data: No access" na app (pedidos vêm com CPF/telefone/endereço mascarados)
- **Veja [SHOPEE.md](./SHOPEE.md) pra fluxo completo, gotchas, e como atualizar o snapshot manualmente.**

## 2. Mercado Livre

- **Docs:** [developers.mercadolivre.com.br](https://developers.mercadolivre.com.br/)
- **App registrada:** `client_id 6250620341601377`, `user_id 737468139`
- **Host:** `https://api.mercadolibre.com`
- **Endpoints usados:** `oauth/token`, `users/{id}/items/search`, `items?ids=...`
- **Auth:** OAuth via `MELI_REFRESH_TOKEN` no `.env` (bootstrap inicial); refresh automático rotaciona o token e persiste em `tokens.json`
- **Limites:** access_token 6h, refresh_token 6 meses; bulk de detalhes em lotes de 20
- **Cobertura:** apenas produtos com `status: "active"`. Itens pausados ou em revisão não aparecem.

## 3. Amazon Brasil — Selling Partner API (research preliminar)

**Status:** **não integrado**. Decisão registrada em `TASK.md` "Decisões". Hoje os links Amazon levam ao storefront público (`https://www.amazon.com.br/stores/MimosKoreaMKD`) sem espelhamento de catálogo.

### Quando formos integrar

- **Portal:** [developer-docs.amazon.com/sp-api](https://developer-docs.amazon.com/sp-api)
- **Endpoints relevantes:** `catalog/v2022-04-01`, `listings/v2021-08-01`, `pricing/v0`
- **Requisitos:**
  - App registrado no Developer Central
  - Fluxo OAuth via Login with Amazon (LWA)
  - Conta **Professional** no Seller Central
  - Aprovação de roles dependendo dos dados acessados
- **Risco financeiro:** Amazon comunicou (2025-2026) evolução do modelo de custos pra desenvolvedores terceiros consumindo SP-API em produção (assinatura/uso). **Validar valores e datas vigentes** no portal antes de orçar.
- **Para nosso caso:** apenas leitura de listings próprios da loja MKD reduz risco legal vs scraping. Mas onboarding técnico não é trivial — IAM, roles, sandbox vs prod, refresh tokens.
- **Credenciais armazenadas (vazias hoje em `.env`):** `AMAZON_PARTNER_TAG`, `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_HOST` — placeholders prontos pra preenchimento futuro.

### Caminhos alternativos antes da integração full

1. **Manual list em snapshot** (mesmo padrão da Shopee `lib/snapshots/shopee.json`): exportar produtos Amazon manualmente, comitar JSON, atualizar quando trocar inventário. Pouca manutenção, ideal pra MVP.
2. **PA-API (Product Advertising API)** se o objetivo for apenas links rastreáveis de afiliado, não gestão de inventário. Outro produto, outras chaves.

## 4. Síntese de viabilidade

| Canal | Leitura própria loja | Complexidade | Ativo |
| --- | --- | --- | --- |
| Mercado Livre | Alta (REST madura, docs PT) | Média (OAuth, IDs) | ✅ |
| Shopee | Alta (Open Platform seller) | Alta (assinatura HMAC, refresh agressivo) | ✅ |
| Amazon BR | Alta para seller próprio via SP-API | Alta (IAM, roles, custos dev) | ⏳ futura |

**Padrão arquitetural deste projeto:** OAuth one-time → cron pull a cada ~30 min → tokens em arquivo no disco → snapshot estático commitado como fallback. Quando Amazon entrar, deve seguir o mesmo padrão pra manter consistência operacional (tokens.json compartilhado, sync no mesmo bootstrap).
