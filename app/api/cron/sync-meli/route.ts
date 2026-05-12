import { NextResponse } from "next/server";

import { getAppEnv, hasMeliEnv } from "@/lib/env";
import { syncMeli } from "@/lib/meli/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function handle(request: Request) {
  if (!hasMeliEnv()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Ambiente Mercado Livre incompleto — preencha MELI_CLIENT_ID, MELI_CLIENT_SECRET e MELI_USER_ID.",
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
    const result = await syncMeli();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron.sync-meli] falhou:", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
