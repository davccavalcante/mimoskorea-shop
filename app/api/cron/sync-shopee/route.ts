import { NextResponse } from "next/server";

import { getAppEnv, hasShopeeEnv } from "@/lib/env";
import { syncShopee } from "@/lib/shopee/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // até 5 min (Vercel Pro/Team)

/**
 * Rota acionada por Vercel Cron (`vercel.json`) e opcionalmente manualmente.
 *
 * Autenticação: header `x-cron-secret` ou query `?secret=` deve bater com
 * `CRON_SECRET`. Vercel Cron injeta o header `authorization: Bearer <secret>`
 * quando configurado; cobrimos os três modos.
 */
async function handle(request: Request) {
  if (!hasShopeeEnv()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Ambiente Shopee incompleto — preencha SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY e SHOPEE_REDIRECT_URL.",
      },
      { status: 500 },
    );
  }

  const { cronSecret } = getAppEnv();
  if (cronSecret) {
    const { searchParams } = new URL(request.url);
    const provided =
      request.headers.get("x-cron-secret") ??
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
      searchParams.get("secret");

    if (provided !== cronSecret) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 },
      );
    }
  }

  try {
    const result = await syncShopee();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron.sync-shopee] falhou:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
