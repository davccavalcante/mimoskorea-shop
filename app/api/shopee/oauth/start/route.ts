import { NextResponse } from "next/server";

import { hasShopeeEnv } from "@/lib/env";
import { buildAuthorizationUrl } from "@/lib/shopee/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Redireciona o dono da loja para a tela de autorização da Shopee.
 * Chamar manualmente uma única vez (ou quando o refresh_token expirar).
 */
export async function GET() {
  if (!hasShopeeEnv()) {
    return NextResponse.json(
      {
        error:
          "Variáveis Shopee ausentes. Configure SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY e SHOPEE_REDIRECT_URL.",
      },
      { status: 500 },
    );
  }

  const url = buildAuthorizationUrl();
  return NextResponse.redirect(url, { status: 302 });
}
