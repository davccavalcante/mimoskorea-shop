---
name: shopee-integration
description: Integração com Shopee Open Platform v2. Reflete o código real em 2026-05.
version: 0.1.0
related:
  - PLAN.md
  - INFO.md
  - TASK.md
---

# SHOPEE — Integração

> Sem Supabase. Sem banco. Tokens em arquivo no disco. Read-only (não cria, edita ou exclui produto na Shopee — apenas espelha o que existe no Seller Center).

## 1. Escopo

O catálogo é uma **vitrine read-only**. Toda operação de produto (cadastro, edição, preço, estoque, promoção) acontece no **Shopee Seller Center**. Este projeto só **lê** o catálogo via API e mostra no site.

| Operação | Onde acontece |
| --- | --- |
| Criar/editar/excluir produto | Seller Center (manual ou pelo painel da Shopee) |
| Atualizar preço/estoque | Seller Center |
| Receber e processar pedido | Seller Center |
| **Espelhar produtos no site** | **Este projeto, via cron** |

## 2. Variáveis de ambiente (`.env`)

Apenas estas existem; nomes diferentes do que aparece em guias genéricos.

| Var | Descrição |
| --- | --- |
| `SHOPEE_PARTNER_ID` | ID numérico do app na Open Platform (ex.: `2033850`) |
| `SHOPEE_PARTNER_KEY` | Chave secreta do app, usada no HMAC-SHA256 |
| `SHOPEE_SHOP_ID` | ID da loja autorizada (ex.: `547188217`) |
| `SHOPEE_HOST` | `https://partner.shopeemobile.com` (produção) ou `https://partner.test-stable.shopeemobile.com` (sandbox) |
| `SHOPEE_REDIRECT_URL` | URL pública do callback OAuth (`https://<dominio>/api/shopee/oauth/callback`) |
| `SHOPEE_STOREFRONT_HOST` | Domínio público pra reconstruir o link do produto (`https://shopee.com.br`) |
| `SHOPEE_REFRESH_TOKEN`, `SHOPEE_ACCESS_TOKEN`, `SHOPEE_ACCESS_TOKEN_EXPIRES_AT` | **Apenas pra primeira execução em servidor novo.** Após o primeiro sync, `tokens.json` toma conta e estes valores ficam inertes. |
| `TOKENS_FILE` | Caminho do `tokens.json` (default `<cwd>/tokens.json`; em produção: `/var/lib/mimoskorea-shop/tokens.json`) |
| `CRON_SECRET` | Protege os endpoints `/api/cron/sync-*`. Header `x-cron-secret` ou `Authorization: Bearer`. |

## 3. Autenticação

### 3.1 Assinatura de requisição (HMAC-SHA256)

Toda chamada à Shopee Open Platform v2 carrega `partner_id`, `timestamp`, `sign` na query string. Endpoints de loja levam também `access_token` e `shop_id`.

- **Endpoint público** (auth, refresh): assinatura sobre `partnerId + apiPath + timestamp`
- **Endpoint de loja** (produtos, pedidos): assinatura sobre `partnerId + apiPath + timestamp + accessToken + shopId`

Implementação em [`lib/shopee/sign.ts`](../lib/shopee/sign.ts).

### 3.2 OAuth 2.0

Uma única vez, o dono da loja autoriza o app:

1. App redireciona para `GET /api/v2/shop/auth_partner` na Shopee
2. Dono autoriza no painel
3. Shopee redireciona pra `SHOPEE_REDIRECT_URL` com `?code=...&shop_id=...`
4. App troca o code por tokens via `POST /api/v2/auth/token/get`
5. Tokens persistem em `tokens.json`

A pasta `shopee-explore/` (sibling do projeto) tem scripts pra fazer isso manualmente quando precisar.

### 3.3 Ciclo de vida dos tokens

| Token | TTL | Comportamento |
| --- | --- | --- |
| `access_token` | ~4h | Usado em cada chamada de loja. Renovado quando faltam <5 min pra expirar. |
| `refresh_token` | **~30 dias na prática** (Shopee não documenta) | Rotaciona a cada uso de refresh. **O valor antigo é invalidado imediatamente** após refresh — por isso precisa persistir em disco entre processos. |

Renovação automática ([`lib/shopee/sync.ts:ensureFreshToken`](../lib/shopee/sync.ts)):

1. Lê `tokens.json` via `getToken("shopee")`
2. Se `access_token` vence em mais de 5 min → usa direto
3. Senão → `POST /api/v2/auth/access_token/get` com refresh_token atual → recebe novo par → grava de volta em `tokens.json`

### 3.4 Bootstrap em servidor novo

Quando `tokens.json` ainda não tem entrada Shopee (primeira execução em servidor novo):

1. Lê `SHOPEE_REFRESH_TOKEN` + `SHOPEE_ACCESS_TOKEN` + `SHOPEE_ACCESS_TOKEN_EXPIRES_AT` do `.env`
2. Se access ainda válido → semeia direto em `tokens.json`
3. Senão → faz refresh com env.refreshToken → grava o novo par

Procedimento manual pra preencher essas envs num servidor novo está em [`shopee-explore/README.md`](../../shopee-explore/README.md).

## 4. Endpoints chamados

Todos em `https://partner.shopeemobile.com/api/v2/...`.

### 4.1 OAuth e tokens (público)

| Endpoint | Método | Onde | Quando |
| --- | --- | --- | --- |
| `/shop/auth_partner` | GET (redirect) | [`lib/shopee/client.ts:buildAuthorizationUrl`](../lib/shopee/client.ts) | Início do OAuth manual |
| `/auth/token/get` | POST | [`lib/shopee/client.ts:fetchTokensFromCode`](../lib/shopee/client.ts) | Troca de code por tokens |
| `/auth/access_token/get` | POST | [`lib/shopee/client.ts:refreshTokens`](../lib/shopee/client.ts) | Renovação automática |

### 4.2 Catálogo (loja)

| Endpoint | Método | Quando | Limite |
| --- | --- | --- | --- |
| `/product/get_item_list` | GET | Lista IDs dos itens da loja | 100 itens/página |
| `/product/get_item_base_info` | GET | Detalhes (título, descrição, imagens) | 50 IDs/lote |
| `/product/get_model_list` | GET | Variações + preço + estoque (para itens com `has_model=true`) | 1 item por chamada |

> **Importante:** preço e estoque de itens **com variação** vivem em `get_model_list`, **não em** `get_item_base_info`. Foi um bug que pegamos: produtos com variação ficavam com `price=null` e eram descartados pelo filtro. O sync atual chama os dois.

## 5. Fluxo de sync ([`lib/shopee/sync.ts`](../lib/shopee/sync.ts))

```
syncShopee()
├── ensureFreshToken()
│   ├── lê tokens.json (memória + disco)
│   ├── se vence em <5min: refresh + grava novo par
│   └── se faltar: bootstrap a partir do .env
├── collectAllItems()
│   └── pagina /product/get_item_list (status NORMAL, page_size=100)
├── fetchItemsDetails()
│   ├── em lotes de 50: /product/get_item_base_info
│   ├── em paralelo: /product/get_model_list para cada item com has_model
│   └── extrai preço (mín entre variações) + cover image + URL pública
├── upsertProducts()
│   └── escreve em memoryStore.products
└── archiveMissingProducts()
    └── remove da memória produtos que sumiram da Shopee
```

Disparadores:
- **Bootstrap automático**: primeira request HTTP em cold start, se passou >10 min do último sync.
- **Cron manual**: `GET /api/cron/sync-shopee` com header `x-cron-secret`. Em prod via cron systemd a cada 30 min (pendente — ver `TASK.md`).
- **Re-OAuth manual**: navegar `/api/shopee/oauth/start` (raro, só se token revogado).

## 6. Snapshot estático ([`lib/snapshots/shopee.json`](../lib/snapshots/shopee.json))

Rede de segurança commitada no Git com 110 produtos reais. Seedada em memória **antes** do sync ao vivo rodar (em `bootstrapIfEmpty`). Se o sync falhar (rede, token revogado, rate limit), o catálogo continua mostrando o snapshot.

Como atualizar:

```bash
cd shopee-explore
npm run auth:url            # imprime URL de autorização
# autoriza no navegador → copia URL com ?code=...&shop_id=...
npm run auth:exchange -- '<URL>'
npm run snapshot:export     # fetch + reprocess + grava lib/snapshots/shopee.json
```

Depois `git add lib/snapshots/shopee.json && git commit && deploy`.

## 7. Por que produtos podem "sumir" do catálogo (e como o projeto evita)

Causas reais identificadas no histórico do projeto e suas mitigações:

1. **Filtro descartando itens com `has_model=true`** (bug histórico)
   - Causa: `get_item_base_info` retorna `price_info: null` para itens com variação. O extractor caía em `price === null` e descartava.
   - **Mitigação atual**: o sync chama `get_model_list` em paralelo e extrai preço de lá. Cobertura subiu de 74/110 para 110/110.

2. **`refresh_token` invalidado entre cold starts** (problema do começo)
   - Causa: cada uso de refresh rotaciona o token. Sem persistência em disco, o `.env` ficava com refresh stale após o primeiro restart.
   - **Mitigação atual**: tokens vivem em `tokens.json` (escrita atômica via tmp+rename). `.env` é só bootstrap inicial.

3. **`tokens.json` apagado em deploy/CI** (risco operacional pendente)
   - Causa: `git pull` ou rsync no diretório do projeto pode sobrescrever o arquivo.
   - **Mitigação**: configurar `TOKENS_FILE=/var/lib/mimoskorea-shop/tokens.json` (fora do diretório do deploy). **Pendente até subirmos no Debian.**

4. **Item sem cover image ou sem preço extraível**
   - Causa: produto cadastrado incompleto na Shopee.
   - **Mitigação atual**: descartado pelo filtro `if (price === null || !image) continue` (~5% dos itens). Não é "bug do site"; é dado faltando na origem. Ver no Seller Center se quiser que apareça.

5. **Sync falha silenciosamente** (gap atual)
   - Causa: hoje o erro vai pro `console.error`, ninguém é alertado.
   - **Mitigação parcial**: snapshot estático cobre o catálogo se o sync quebra.
   - **Próximo passo**: alerta operacional — registrado em `TASK.md` Grupo 12.

## 8. Limitações reconhecidas

- **Latência**: até 30 min entre você editar produto/preço no Seller Center e refletir no site (intervalo do cron).
- **Sem webhooks**: a Shopee oferece "Live Push" mas não está implementado neste projeto. Decisão registrada em `TASK.md`.
- **Sem retentativa em falhas transitórias**: rate limit ou erro 5xx aborta o sync; próxima janela tenta de novo. Item `TASK.md` Grupo 12.
- **"Sensitive Data: No access"** no painel da app: dados sensíveis em pedido (CPF, telefone, endereço completo) vêm mascarados como `****`. Não afeta catálogo, afeta exploração de pedidos via `shopee-explore/scripts/05-fetch-orders.mjs`.
- **Token revogado pelo dono ou pela Shopee**: requer re-OAuth manual via `shopee-explore`. Sem solução automática.

## 9. Onde está cada coisa

```
lib/shopee/
├── sign.ts            # HMAC-SHA256
├── types.ts           # Tipos da Open Platform v2
├── client.ts          # buildAuthorizationUrl, fetchTokensFromCode, refreshTokens, getItemList, getItemBaseInfo, getModelList
└── sync.ts            # syncShopee() + ensureFreshToken()

app/api/shopee/oauth/
├── start/route.ts     # GET — inicia OAuth (raramente usado)
└── callback/route.ts  # GET — recebe ?code=...&shop_id=... e grava tokens

app/api/cron/sync-shopee/route.ts   # entry point pra cron systemd em prod

lib/repo/
├── tokens.ts          # getToken/saveToken (memória + disco)
├── tokens-fs.ts       # leitura/escrita de tokens.json
├── products.ts        # upsertProducts, archiveMissingProducts (in-memory)
└── bootstrap.ts       # snapshot + sync na primeira request

lib/snapshots/
└── shopee.json        # fallback commitado (110 produtos reais)

shopee-explore/        # pasta sibling — scripts manuais de OAuth e refresh do snapshot
```
