import { NextResponse } from "next/server";

import { hasMeliEnv } from "@/lib/env";
import { buildAuthorizationUrl } from "@/lib/meli/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Redireciona o dono da conta Mercado Livre para a tela de autorização.
 * Use apenas quando `MELI_REFRESH_TOKEN` não estiver configurado ou quando
 * o refresh_token tiver expirado.
 */
export async function GET() {
  if (!hasMeliEnv()) {
    return NextResponse.json(
      {
        error:
          "Variáveis Mercado Livre ausentes. Configure MELI_CLIENT_ID, MELI_CLIENT_SECRET e MELI_USER_ID.",
      },
      { status: 500 },
    );
  }
  return NextResponse.redirect(buildAuthorizationUrl(), { status: 302 });
}
