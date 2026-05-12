import "server-only";

import { getShopeeEnv } from "@/lib/env";
import {
  currentTimestampSeconds,
  type ShopeeSignScope,
  signShopee,
} from "@/lib/shopee/sign";
import type {
  ShopeeItemBaseInfo,
  ShopeeItemBaseInfoResponse,
  ShopeeItemListResponse,
  ShopeeModelListResponse,
  ShopeeTokenResponse,
} from "@/lib/shopee/types";

/**
 * Cliente HTTP tipado para a Shopee Open Platform (Seller API v2).
 *
 * Todos os endpoints assinam com HMAC-SHA256 e anexam os parâmetros comuns
 * (`partner_id`, `timestamp`, `sign`) como query string. Endpoints de loja
 * ainda recebem `access_token` + `shop_id`.
 */

type ShopeeEnv = ReturnType<typeof getShopeeEnv>;

function buildUrl(params: {
  env: ShopeeEnv;
  apiPath: string;
  scope: ShopeeSignScope;
  extraQuery?: Record<string, string | number | undefined>;
}): string {
  const { env, apiPath, scope, extraQuery } = params;
  const timestamp = currentTimestampSeconds();
  const sign = signShopee({
    partnerId: env.partnerId,
    partnerKey: env.partnerKey,
    apiPath,
    timestamp,
    scope,
  });

  const url = new URL(apiPath, env.host);
  url.searchParams.set("partner_id", env.partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", sign);
  if (scope.kind === "shop") {
    url.searchParams.set("access_token", scope.accessToken);
    url.searchParams.set("shop_id", scope.shopId);
  }
  if (extraQuery) {
    for (const [key, value] of Object.entries(extraQuery)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await response.json()) as T;
  return json;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "GET", cache: "no-store" });
  const json = (await response.json()) as T;
  return json;
}

// ─── OAuth ──────────────────────────────────────────────────────────────────

/**
 * URL para o dono da loja autorizar o app. Abra no navegador.
 * Docs: https://open.shopee.com/developer-guide/20
 */
export function buildAuthorizationUrl(state?: string): string {
  const env = getShopeeEnv();
  const apiPath = "/api/v2/shop/auth_partner";
  const timestamp = currentTimestampSeconds();
  const sign = signShopee({
    partnerId: env.partnerId,
    partnerKey: env.partnerKey,
    apiPath,
    timestamp,
    scope: { kind: "public" },
  });
  const url = new URL(apiPath, env.host);
  url.searchParams.set("partner_id", env.partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", sign);
  url.searchParams.set("redirect", env.redirectUrl);
  if (state) url.searchParams.set("state", state);
  return url.toString();
}

/**
 * Troca o `code` do callback por tokens. Chamado 1x após o dono autorizar.
 */
export async function fetchTokensFromCode(params: {
  code: string;
  shopId: string;
}): Promise<ShopeeTokenResponse> {
  const env = getShopeeEnv();
  const apiPath = "/api/v2/auth/token/get";
  const url = buildUrl({ env, apiPath, scope: { kind: "public" } });
  return postJson<ShopeeTokenResponse>(url, {
    code: params.code,
    shop_id: Number(params.shopId),
    partner_id: Number(env.partnerId),
  });
}

/**
 * Renova tokens antes do `access_token` expirar (TTL ~4h).
 */
export async function refreshTokens(params: {
  refreshToken: string;
  shopId: string;
}): Promise<ShopeeTokenResponse> {
  const env = getShopeeEnv();
  const apiPath = "/api/v2/auth/access_token/get";
  const url = buildUrl({ env, apiPath, scope: { kind: "public" } });
  return postJson<ShopeeTokenResponse>(url, {
    refresh_token: params.refreshToken,
    shop_id: Number(params.shopId),
    partner_id: Number(env.partnerId),
  });
}

// ─── Catálogo ───────────────────────────────────────────────────────────────

export type ShopeeItemListArgs = {
  accessToken: string;
  shopId: string;
  offset?: number;
  pageSize?: number; // máx 100 segundo docs
  itemStatus?: Array<"NORMAL" | "BANNED" | "DELETED" | "UNLIST">;
};

/**
 * Lista os IDs de itens da loja. Use paginação via `offset` + `has_next_page`.
 */
export async function getItemList(
  args: ShopeeItemListArgs,
): Promise<ShopeeItemListResponse> {
  const env = getShopeeEnv();
  const apiPath = "/api/v2/product/get_item_list";
  const statuses = args.itemStatus ?? ["NORMAL"];

  const extraQuery: Record<string, string> = {
    offset: String(args.offset ?? 0),
    page_size: String(args.pageSize ?? 100),
  };
  // `item_status` é um parâmetro repetido (array) na query
  const baseUrl = buildUrl({
    env,
    apiPath,
    scope: { kind: "shop", accessToken: args.accessToken, shopId: args.shopId },
    extraQuery,
  });
  const url = new URL(baseUrl);
  for (const status of statuses) {
    url.searchParams.append("item_status", status);
  }
  return getJson<ShopeeItemListResponse>(url.toString());
}

export type ShopeeItemBaseInfoArgs = {
  accessToken: string;
  shopId: string;
  itemIds: number[];
};

/**
 * Detalhes dos itens em lote (máx 50 ids por chamada).
 * Retornará título, status, imagens e preço (price_info).
 */
export async function getItemBaseInfo(
  args: ShopeeItemBaseInfoArgs,
): Promise<ShopeeItemBaseInfoResponse> {
  if (args.itemIds.length === 0) {
    return {
      error: "",
      message: "",
      request_id: "",
      response: { item_list: [] },
    };
  }
  if (args.itemIds.length > 50) {
    throw new Error(
      "Shopee get_item_base_info aceita no máximo 50 itens por chamada.",
    );
  }
  const env = getShopeeEnv();
  const apiPath = "/api/v2/product/get_item_base_info";
  const extraQuery = {
    item_id_list: args.itemIds.join(","),
    need_tax_info: "false",
    need_complaint_policy: "false",
  };
  const url = buildUrl({
    env,
    apiPath,
    scope: { kind: "shop", accessToken: args.accessToken, shopId: args.shopId },
    extraQuery,
  });
  return getJson<ShopeeItemBaseInfoResponse>(url);
}

/**
 * Lista as variações (modelos) de um item. Necessário para itens com
 * `has_model=true` — a Shopee não inclui preço/estoque no get_item_base_info
 * desses itens; eles vivem em `model[].price_info` / `stock_info_v2`.
 */
export async function getModelList(args: {
  accessToken: string;
  shopId: string;
  itemId: number;
}): Promise<ShopeeModelListResponse> {
  const env = getShopeeEnv();
  const apiPath = "/api/v2/product/get_model_list";
  const url = buildUrl({
    env,
    apiPath,
    scope: { kind: "shop", accessToken: args.accessToken, shopId: args.shopId },
    extraQuery: { item_id: String(args.itemId) },
  });
  return getJson<ShopeeModelListResponse>(url);
}

// ─── Helpers de apresentação ────────────────────────────────────────────────

/**
 * Extrai o preço atual mais baixo entre os modelos/ variações. Se o item não
 * tem variações, usa `price_info[0]`. Se não houver preço, retorna `null`.
 *
 * Itens com `has_model=true` exigem `getModelList()` (passe via `models`),
 * porque get_item_base_info não inclui price_info para esses casos.
 */
export function extractCurrentPrice(
  item: ShopeeItemBaseInfo,
  models?: ShopeeModelListResponse,
): number | null {
  if (item.has_model) {
    const fromModelList = (models?.response?.model ?? [])
      .flatMap((m) => m.price_info ?? [])
      .map((p) => p.current_price)
      .filter((p): p is number => typeof p === "number" && Number.isFinite(p));
    if (fromModelList.length > 0) return Math.min(...fromModelList);
    // Fallback raro: alguns itens antigos ainda trazem `models` no base_info.
    const inline = (item.models ?? [])
      .flatMap((m) => m.price_info ?? [])
      .map((p) => p.current_price)
      .filter((p): p is number => typeof p === "number" && Number.isFinite(p));
    if (inline.length > 0) return Math.min(...inline);
    return null;
  }
  const price = item.price_info?.[0]?.current_price;
  return typeof price === "number" && Number.isFinite(price) ? price : null;
}

export function extractCoverImage(item: ShopeeItemBaseInfo): string | null {
  return item.image?.image_url_list?.[0] ?? null;
}

/**
 * Reconstrói o deep-link da loja para o produto.
 * Shopee não retorna a URL final do item; o padrão é `/product/{shop_id}/{item_id}`.
 */
export function buildProductUrl(params: {
  storefrontHost: string;
  shopId: string;
  itemId: number;
}): string {
  const base = params.storefrontHost.replace(/\/+$/, "");
  return `${base}/product/${params.shopId}/${params.itemId}`;
}
