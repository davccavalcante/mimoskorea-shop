import "server-only";

import { memoryStore } from "@/lib/cache/memory";
import { getMeliEnv } from "@/lib/env";
import {
  extractCoverImage,
  extractPermalink,
  extractPrice,
  getItemsBulk,
  listUserItems,
  refreshAccessToken,
} from "@/lib/meli/client";
import type { MeliItem, MeliTokenResponse } from "@/lib/meli/types";
import {
  archiveMissingProducts,
  type UpsertProductInput,
  upsertProducts,
} from "@/lib/repo/products";
import { getToken, type IntegrationToken, saveToken } from "@/lib/repo/tokens";

/**
 * Orquestra o sync completo do Mercado Livre:
 * 1. Garante um access_token válido (bootstrap a partir de `MELI_REFRESH_TOKEN`
 *    se ainda não houver token salvo; renova se expirado).
 * 2. Pagina `/users/{user_id}/items/search` até cobrir todos os itens ativos.
 * 3. Busca detalhes em lotes de 20 via `/items?ids=...`.
 * 4. Upsert em `products` (Supabase ou memória) e arquiva os ausentes.
 */

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 min
const REFRESH_TOKEN_TTL_MS = 180 * 24 * 60 * 60 * 1000; // ML refresh_token dura ~6 meses
const ITEM_SEARCH_LIMIT = 50;
const ITEMS_BULK_SIZE = 20;

export interface SyncMeliResult {
  ok: true;
  userId: string;
  fetched: number;
  upserted: number;
  archived: number;
  durationMs: number;
}

export async function syncMeli(): Promise<SyncMeliResult> {
  const started = Date.now();
  const env = getMeliEnv();

  // Evita sync concorrente (ex.: dois requests simultâneos disparando bootstrap).
  const existingLock = memoryStore.syncLocks.get("mercadolivre");
  if (existingLock) {
    await existingLock;
  }

  const run = (async () => {
    const token = await ensureFreshToken();
    const ids = await collectAllItemIds(token.accessToken, env.userId);
    const upserts = await fetchItemsDetails(ids, token.accessToken);

    const upserted = await upsertProducts(upserts);
    const archived = await archiveMissingProducts({
      marketplace: "mercadolivre",
      keepItemIds: upserts.map((u) => u.marketplaceItemId),
    });

    memoryStore.lastSyncAt.set("mercadolivre", Date.now());
    return { ids, upserted, archived };
  })();

  memoryStore.syncLocks.set("mercadolivre", run);
  try {
    const { ids, upserted, archived } = await run;
    return {
      ok: true,
      userId: env.userId,
      fetched: ids.length,
      upserted,
      archived,
      durationMs: Date.now() - started,
    };
  } finally {
    memoryStore.syncLocks.delete("mercadolivre");
  }
}

async function ensureFreshToken(): Promise<IntegrationToken> {
  const env = getMeliEnv();
  let token = await getToken("mercadolivre");

  // Bootstrap inicial: se ainda não há token armazenado mas temos um
  // refresh_token no ambiente, usamos ele para obter o primeiro access_token.
  if (!token) {
    if (!env.refreshToken) {
      throw new Error(
        "Nenhum token Mercado Livre encontrado. Defina MELI_REFRESH_TOKEN ou complete /api/mercadolivre/oauth/start.",
      );
    }
    const refreshed = await refreshAccessToken({
      refreshToken: env.refreshToken,
    });
    assertNoMeliError(refreshed, "oauth/token[bootstrap]");
    token = await persistToken(refreshed);
    return token;
  }

  const expiresAt = new Date(token.accessExpiresAt).getTime();
  if (Number.isNaN(expiresAt)) {
    throw new Error("Token Mercado Livre com access_expires_at inválido.");
  }
  if (expiresAt - Date.now() > REFRESH_BUFFER_MS) {
    return token;
  }

  const refreshed = await refreshAccessToken({
    refreshToken: token.refreshToken,
  });
  assertNoMeliError(refreshed, "oauth/token[refresh]");
  return persistToken(refreshed, token);
}

async function persistToken(
  refreshed: MeliTokenResponse,
  previous?: IntegrationToken,
): Promise<IntegrationToken> {
  const now = Date.now();
  return saveToken({
    marketplace: "mercadolivre",
    shopId: String(refreshed.user_id ?? previous?.shopId ?? ""),
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    accessExpiresAt: new Date(now + refreshed.expires_in * 1000),
    refreshExpiresAt: new Date(now + REFRESH_TOKEN_TTL_MS),
    metadata: {
      ...(previous?.metadata ?? {}),
      last_refresh_at: new Date(now).toISOString(),
      scope:
        refreshed.scope ?? (previous?.metadata?.scope as string | undefined),
    },
  });
}

async function collectAllItemIds(
  accessToken: string,
  userId: string,
): Promise<string[]> {
  const collected: string[] = [];
  let offset = 0;
  for (let guard = 0; guard < 200; guard++) {
    const res = await listUserItems({
      userId,
      accessToken,
      offset,
      limit: ITEM_SEARCH_LIMIT,
      status: "active",
    });
    if (res.error) {
      throw new Error(
        `Mercado Livre users/items/search falhou: ${res.error} — ${res.message ?? ""}`.trim(),
      );
    }
    collected.push(...res.results);
    offset += res.paging.limit;
    if (collected.length >= res.paging.total) break;
    if (res.results.length === 0) break;
  }
  return Array.from(new Set(collected));
}

async function fetchItemsDetails(
  ids: string[],
  accessToken: string,
): Promise<UpsertProductInput[]> {
  const upserts: UpsertProductInput[] = [];

  for (let i = 0; i < ids.length; i += ITEMS_BULK_SIZE) {
    const slice = ids.slice(i, i + ITEMS_BULK_SIZE);
    const envelopes = await getItemsBulk({
      ids: slice,
      accessToken,
      attributes: [
        "id",
        "title",
        "price",
        "currency_id",
        "permalink",
        "thumbnail",
        "secure_thumbnail",
        "pictures",
        "status",
      ],
    });

    for (const env of envelopes) {
      if (env.code !== 200) continue;
      const item = env.body as MeliItem;
      if (!item || typeof item !== "object" || !("id" in item)) continue;
      if (item.status !== "active") continue;

      const price = extractPrice(item);
      const image = extractCoverImage(item);
      const url = extractPermalink(item);
      if (price === null || !image || !url) continue;

      upserts.push({
        marketplace: "mercadolivre",
        marketplaceItemId: item.id,
        title: item.title,
        price,
        currency: "BRL",
        image,
        url,
        status: "active",
      });
    }
  }

  return upserts;
}

function assertNoMeliError(
  res: MeliTokenResponse,
  label: string,
): asserts res is MeliTokenResponse & { access_token: string } {
  if (res.error || !res.access_token) {
    throw new Error(
      `Mercado Livre ${label} respondeu com erro: ${res.error ?? "sem access_token"} — ${res.message ?? ""}`.trim(),
    );
  }
}
