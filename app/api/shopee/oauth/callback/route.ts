import { NextResponse } from "next/server";

import { hasShopeeEnv } from "@/lib/env";
import { saveToken } from "@/lib/repo/tokens";
import { fetchTokensFromCode } from "@/lib/shopee/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // presunção: 30 dias

/**
 * Callback do OAuth Shopee. Recebe `code` e `shop_id` na query, troca por
 * access/refresh tokens e persiste em `integration_tokens`.
 */
export async function GET(request: Request) {
  if (!hasShopeeEnv()) {
    return NextResponse.json(
      { error: "Variáveis Shopee ausentes." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const shopId = searchParams.get("shop_id");

  if (!code || !shopId) {
    return NextResponse.json(
      { error: "Callback Shopee sem `code` ou `shop_id`." },
      { status: 400 },
    );
  }

  const tokens = await fetchTokensFromCode({ code, shopId });
  if (tokens.error && tokens.error.length > 0) {
    return NextResponse.json(
      {
        error: "Shopee recusou o code.",
        detail: { error: tokens.error, message: tokens.message },
      },
      { status: 502 },
    );
  }

  if (!tokens.access_token || !tokens.refresh_token) {
    return NextResponse.json(
      { error: "Resposta Shopee sem access_token/refresh_token." },
      { status: 502 },
    );
  }

  const now = Date.now();
  await saveToken({
    marketplace: "shopee",
    shopId,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessExpiresAt: new Date(now + tokens.expire_in * 1000),
    refreshExpiresAt: new Date(now + REFRESH_TOKEN_TTL_MS),
    metadata: { authorized_at: new Date(now).toISOString() },
  });

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/?shopee=connected`, { status: 302 });
}
