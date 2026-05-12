import "server-only";

import { getShopeeEnv } from "@/lib/env";
import {
  archiveMissingProducts,
  type UpsertProductInput,
  upsertProducts,
} from "@/lib/repo/products";
import { getToken, type IntegrationToken, saveToken } from "@/lib/repo/tokens";
import {
  buildProductUrl,
  extractCoverImage,
  extractCurrentPrice,
  getItemBaseInfo,
  getItemList,
  getModelList,
  refreshTokens,
} from "@/lib/shopee/client";
import type {
  ShopeeItemListItem,
  ShopeeTokenResponse,
} from "@/lib/shopee/types";

/**
 * Orquestra o sync completo da Shopee:
 * 1. Carrega o token salvo e renova se estiver próximo de expirar.
 * 2. Percorre `get_item_list` paginando até o fim.
 * 3. Lê `get_item_base_info` em lotes de 50.
 * 4. Monta os produtos e faz upsert em `public.products`.
 * 5. Arquiva os produtos que sumiram da lista.
 */

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 min antes de expirar
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // ~30 dias (Shopee não documenta)
const ITEM_LIST_PAGE_SIZE = 100;
const BASE_INFO_BATCH_SIZE = 50;

export interface SyncShopeeResult {
  ok: true;
  shopId: string;
  fetched: number;
  upserted: number;
  archived: number;
  durationMs: number;
}

export async function syncShopee(): Promise<SyncShopeeResult> {
  const started = Date.now();
  const env = getShopeeEnv();

  const token = await ensureFreshToken();
  const shopId = token.shopId;
  if (!shopId) {
    throw new Error(
      "Shopee token sem shop_id — execute o fluxo de autorização primeiro.",
    );
  }

  const items = await collectAllItems({
    accessToken: token.accessToken,
    shopId,
  });
  const upserts = await fetchItemsDetails({
    accessToken: token.accessToken,
    shopId,
    items,
    storefrontHost: env.storefrontHost,
  });

  const upserted = await upsertProducts(upserts);
  const archived = await archiveMissingProducts({
    marketplace: "shopee",
    keepItemIds: upserts.map((u) => u.marketplaceItemId),
  });

  return {
    ok: true,
    shopId,
    fetched: items.length,
    upserted,
    archived,
    durationMs: Date.now() - started,
  };
}

async function ensureFreshToken(): Promise<IntegrationToken> {
  const env = getShopeeEnv();
  let token = await getToken("shopee");

  // Bootstrap: se ainda não há token persistido mas temos SHOPEE_REFRESH_TOKEN
  // no ambiente, semeia o store. Aceita também SHOPEE_ACCESS_TOKEN +
  // SHOPEE_ACCESS_TOKEN_EXPIRES_AT para evitar uma chamada de refresh imediata.
  if (!token) {
    if (!env.refreshToken || !env.shopId) {
      throw new Error(
        "Nenhum token Shopee encontrado. Defina SHOPEE_REFRESH_TOKEN + SHOPEE_SHOP_ID ou complete /api/shopee/oauth/start.",
      );
    }
    const seedExpiresAt = env.accessTokenExpiresAt
      ? new Date(env.accessTokenExpiresAt).getTime()
      : NaN;
    if (
      env.accessToken &&
      Number.isFinite(seedExpiresAt) &&
      seedExpiresAt - Date.now() > REFRESH_BUFFER_MS
    ) {
      token = await saveToken({
        marketplace: "shopee",
        shopId: env.shopId,
        accessToken: env.accessToken,
        refreshToken: env.refreshToken,
        accessExpiresAt: new Date(seedExpiresAt),
        refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        metadata: {
          bootstrap_source: "env",
          bootstrap_at: new Date().toISOString(),
        },
      });
      return token;
    }
    const refreshed = await refreshTokens({
      refreshToken: env.refreshToken,
      shopId: env.shopId,
    });
    assertNoShopeeError(refreshed, "auth/access_token/get[bootstrap]");
    token = await saveToken({
      marketplace: "shopee",
      shopId: env.shopId,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      accessExpiresAt: new Date(Date.now() + refreshed.expire_in * 1000),
      refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      metadata: {
        bootstrap_source: "env+refresh",
        bootstrap_at: new Date().toISOString(),
      },
    });
    return token;
  }

  const expiresAt = new Date(token.accessExpiresAt).getTime();
  if (Number.isNaN(expiresAt)) {
    throw new Error("Token Shopee com access_expires_at inválido.");
  }
  if (expiresAt - Date.now() > REFRESH_BUFFER_MS) {
    return token;
  }
  if (!token.shopId) {
    throw new Error("Token Shopee sem shop_id — não é possível renovar.");
  }
  const refreshed = await refreshTokens({
    refreshToken: token.refreshToken,
    shopId: token.shopId,
  });
  assertNoShopeeError(refreshed, "auth/access_token/get");

  const saved = await saveToken({
    marketplace: "shopee",
    shopId: token.shopId,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    accessExpiresAt: new Date(Date.now() + refreshed.expire_in * 1000),
    refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    metadata: { ...token.metadata, last_refresh_at: new Date().toISOString() },
  });
  return saved;
}

async function collectAllItems(params: {
  accessToken: string;
  shopId: string;
}): Promise<ShopeeItemListItem[]> {
  const { accessToken, shopId } = params;
  const collected: ShopeeItemListItem[] = [];
  let offset = 0;
  // Guard contra loops infinitos em caso de resposta defeituosa.
  for (let page = 0; page < 100; page++) {
    const res = await getItemList({
      accessToken,
      shopId,
      offset,
      pageSize: ITEM_LIST_PAGE_SIZE,
      itemStatus: ["NORMAL"],
    });
    assertNoShopeeError(res, "product/get_item_list");
    const body = res.response;
    if (!body) break;
    collected.push(...body.item);
    if (!body.has_next_page) break;
    offset = body.next_offset;
  }
  return collected;
}

async function fetchItemsDetails(params: {
  accessToken: string;
  shopId: string;
  items: ShopeeItemListItem[];
  storefrontHost: string;
}): Promise<UpsertProductInput[]> {
  const { accessToken, shopId, items, storefrontHost } = params;
  const upserts: UpsertProductInput[] = [];

  for (let i = 0; i < items.length; i += BASE_INFO_BATCH_SIZE) {
    const slice = items.slice(i, i + BASE_INFO_BATCH_SIZE);
    const res = await getItemBaseInfo({
      accessToken,
      shopId,
      itemIds: slice.map((s) => s.item_id),
    });
    assertNoShopeeError(res, "product/get_item_base_info");
    const list = res.response?.item_list ?? [];

    // Para itens com variação, o preço vive em get_model_list (chamada separada).
    // Buscamos em paralelo respeitando o lote atual.
    const modelLists = new Map<
      number,
      Awaited<ReturnType<typeof getModelList>>
    >();
    const needsModels = list.filter(
      (it) => it.has_model && it.item_status === "NORMAL",
    );
    await Promise.all(
      needsModels.map(async (it) => {
        try {
          const models = await getModelList({
            accessToken,
            shopId,
            itemId: it.item_id,
          });
          modelLists.set(it.item_id, models);
        } catch (err) {
          console.error(
            `[shopee.sync] get_model_list falhou para item ${it.item_id}:`,
            err,
          );
        }
      }),
    );

    for (const item of list) {
      if (item.item_status !== "NORMAL") continue;
      const price = extractCurrentPrice(item, modelLists.get(item.item_id));
      const image = extractCoverImage(item);
      if (price === null || !image) continue; // ignora itens sem preço/imagem
      upserts.push({
        marketplace: "shopee",
        marketplaceItemId: String(item.item_id),
        title: item.item_name,
        price,
        currency: "BRL",
        image,
        url: buildProductUrl({ storefrontHost, shopId, itemId: item.item_id }),
        status: "active",
      });
    }
  }

  return upserts;
}

function assertNoShopeeError(
  res: ShopeeTokenResponse | { error: string; message: string },
  label: string,
): void {
  if (res.error && res.error.length > 0) {
    throw new Error(
      `Shopee ${label} respondeu com erro: ${res.error} — ${res.message ?? ""}`.trim(),
    );
  }
}
