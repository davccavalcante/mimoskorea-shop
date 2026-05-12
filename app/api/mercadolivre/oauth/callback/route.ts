import { NextResponse } from "next/server";

import { hasMeliEnv } from "@/lib/env";
import { exchangeCodeForTokens } from "@/lib/meli/client";
import { saveToken } from "@/lib/repo/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REFRESH_TOKEN_TTL_MS = 180 * 24 * 60 * 60 * 1000; // ~6 meses

export async function GET(request: Request) {
  if (!hasMeliEnv()) {
    return NextResponse.json(
      { error: "Variáveis Mercado Livre ausentes." },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  if (errorParam) {
    return NextResponse.json(
      { error: "mercado_livre_oauth_error", detail: errorParam },
      { status: 400 },
    );
  }
  if (!code) {
    return NextResponse.json(
      { error: "Callback Mercado Livre sem `code`." },
      { status: 400 },
    );
  }

  const tokens = await exchangeCodeForTokens({ code });
  if (tokens.error || !tokens.access_token) {
    return NextResponse.json(
      {
        error: "Mercado Livre recusou o code.",
        detail: { error: tokens.error, message: tokens.message },
      },
      { status: 502 },
    );
  }

  const now = Date.now();
  await saveToken({
    marketplace: "mercadolivre",
    shopId: String(tokens.user_id),
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessExpiresAt: new Date(now + tokens.expires_in * 1000),
    refreshExpiresAt: new Date(now + REFRESH_TOKEN_TTL_MS),
    metadata: {
      authorized_at: new Date(now).toISOString(),
      scope: tokens.scope,
    },
  });

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/?meli=connected`, { status: 302 });
}
