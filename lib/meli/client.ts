import "server-only";

import { getMeliEnv } from "@/lib/env";
import type {
  MeliItem,
  MeliItemsSearchResponse,
  MeliMultiGetEnvelope,
  MeliTokenResponse,
} from "@/lib/meli/types";

/**
 * Cliente HTTP tipado para a API do Mercado Livre.
 *
 * - Produção: https://api.mercadolibre.com
 * - Auth UI: https://auth.mercadolivre.com.br (pt-BR)
 * - Docs: https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao
 */

const AUTH_HOST = "https://auth.mercadolivre.com.br";

async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
): Promise<T & { error?: string; message?: string; status?: number }> {
  const response = await fetch(url, {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let json: unknown = null;
  try {
    json = text.length > 0 ? JSON.parse(text) : {};
  } catch {
    json = { error: "invalid_json", message: text };
  }
  if (!response.ok) {
    const payload = (json ?? {}) as Record<string, unknown>;
    return {
      ...(payload as object),
      error: (payload.error as string | undefined) ?? `http_${response.status}`,
      message: (payload.message as string | undefined) ?? response.statusText,
      status: response.status,
    } as T & { error?: string; message?: string; status?: number };
  }
  return json as T & { error?: string; message?: string; status?: number };
}

// ─── OAuth ──────────────────────────────────────────────────────────────────

/**
 * Monta a URL de autorização (Authorization Code + PKCE opcional).
 * Abra no navegador; ML redireciona para `MELI_REDIRECT_URL` com `?code=...`.
 */
export function buildAuthorizationUrl(state?: string): string {
  const env = getMeliEnv();
  const url = new URL("/authorization", AUTH_HOST);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.clientId);
  url.searchParams.set("redirect_uri", env.redirectUrl);
  if (state) url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeCodeForTokens(params: {
  code: string;
}): Promise<MeliTokenResponse> {
  const env = getMeliEnv();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: env.clientId,
    client_secret: env.clientSecret,
    code: params.code,
    redirect_uri: env.redirectUrl,
  });
  return fetchJson<MeliTokenResponse>(`${env.host}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });
}

export async function refreshAccessToken(params: {
  refreshToken: string;
}): Promise<MeliTokenResponse> {
  const env = getMeliEnv();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: env.clientId,
    client_secret: env.clientSecret,
    refresh_token: params.refreshToken,
  });
  return fetchJson<MeliTokenResponse>(`${env.host}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });
}

// ─── Catálogo ───────────────────────────────────────────────────────────────

/**
 * Lista IDs dos itens do usuário (usa scan para passar de offset 1000).
 * Docs: https://developers.mercadolibre.com/pt_br/itens-e-buscas
 */
export async function listUserItems(params: {
  userId: string;
  accessToken: string;
  offset?: number;
  limit?: number;
  status?: "active" | "paused" | "closed";
}): Promise<MeliItemsSearchResponse & { error?: string; message?: string }> {
  const env = getMeliEnv();
  const url = new URL(`/users/${params.userId}/items/search`, env.host);
  url.searchParams.set("offset", String(params.offset ?? 0));
  url.searchParams.set("limit", String(params.limit ?? 50));
  if (params.status) url.searchParams.set("status", params.status);
  return fetchJson<MeliItemsSearchResponse>(url.toString(), {
    headers: { Authorization: `Bearer ${params.accessToken}` },
  });
}

/**
 * Detalhes de múltiplos itens numa única chamada (até 20 IDs por request).
 * Endpoint público, mas passar o token ajuda com rate limit.
 */
export async function getItemsBulk(params: {
  ids: string[];
  accessToken?: string;
  attributes?: string[];
}): Promise<MeliMultiGetEnvelope[]> {
  if (params.ids.length === 0) return [];
  if (params.ids.length > 20) {
    throw new Error(
      `Mercado Livre /items?ids aceita no máximo 20 IDs por chamada (recebeu ${params.ids.length}).`,
    );
  }
  const env = getMeliEnv();
  const url = new URL("/items", env.host);
  url.searchParams.set("ids", params.ids.join(","));
  if (params.attributes && params.attributes.length > 0) {
    url.searchParams.set("attributes", params.attributes.join(","));
  }
  const headers: Record<string, string> = {};
  if (params.accessToken) {
    headers.Authorization = `Bearer ${params.accessToken}`;
  }
  const data = await fetchJson<
    MeliMultiGetEnvelope[] | Record<string, unknown>
  >(url.toString(), { headers });
  if (Array.isArray(data)) return data;
  // Caso a API devolva um objeto de erro, propagamos vazio.
  console.error("[meli.getItemsBulk] resposta inesperada", data);
  return [];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function extractPrice(item: MeliItem): number | null {
  return typeof item.price === "number" && Number.isFinite(item.price)
    ? item.price
    : null;
}

export function extractCoverImage(item: MeliItem): string | null {
  if (item.pictures && item.pictures.length > 0) {
    const first = item.pictures[0];
    return first.secure_url ?? first.url ?? null;
  }
  return item.secure_thumbnail ?? item.thumbnail ?? null;
}

export function extractPermalink(item: MeliItem): string {
  return item.permalink;
}
