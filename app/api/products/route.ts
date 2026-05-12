import { NextResponse } from "next/server";

import { getProductsPage } from "@/lib/repo/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPage = Number(searchParams.get("page") ?? "1");
  const rawPageSize = Number(searchParams.get("pageSize") ?? "18");

  const page = Number.isFinite(rawPage) ? rawPage : 1;
  const pageSize = Number.isFinite(rawPageSize) ? rawPageSize : 18;

  const data = await getProductsPage(page, pageSize);
  return NextResponse.json(data);
}
