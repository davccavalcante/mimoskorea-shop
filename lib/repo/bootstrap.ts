import "server-only";

import { memoryStore, productCompositeKey } from "@/lib/cache/memory";
import { hasMeliEnv, hasShopeeEnv } from "@/lib/env";
import type { Marketplace, Product } from "@/lib/products";
import shopeeSnapshot from "@/lib/snapshots/shopee.json" with { type: "json" };

/**
 * Garante que o catálogo tenha dados reais para servir ao primeiro request.
 *
 * Tokens persistem em disco (`lib/repo/tokens-fs.ts`); o sync usa o token
 * salvo, refresha quando perto de expirar, e regrava o novo par. Em ambiente
 * com filesystem persistente (Debian + systemd) o ciclo se mantém forever.
 *
 * O snapshot estático em `lib/snapshots/shopee.json` é seedado primeiro como
 * rede de segurança: se o sync da Shopee falhar (token revogado, rede caída,
 * primeira instalação sem OAuth), o catálogo ainda mostra produtos reais.
 * O sync subsequente sobrescreve as entradas com dados frescos.
 */

const RESYNC_MIN_INTERVAL_MS = 10 * 60 * 1000;

let shopeeSeeded = false;

function seedShopeeFromSnapshot(): void {
  if (shopeeSeeded) return;
  const products = shopeeSnapshot.products as Product[];
  for (const p of products) {
    const itemId = p.id.startsWith("shopee:")
      ? p.id.slice("shopee:".length)
      : p.id;
    const key = productCompositeKey("shopee", itemId);
    if (!memoryStore.products.has(key)) {
      memoryStore.products.set(key, p);
    }
  }
  shopeeSeeded = true;
}

function memoryHasMarketplace(marketplace: Marketplace): boolean {
  const prefix = `${marketplace}:`;
  for (const key of memoryStore.products.keys()) {
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

export async function bootstrapIfEmpty(): Promise<void> {
  // Fallback estático sempre aplicado (idempotente, instantâneo).
  seedShopeeFromSnapshot();

  const now = Date.now();
  const tasks: Promise<unknown>[] = [];

  if (hasMeliEnv()) {
    const lastMeli = memoryStore.lastSyncAt.get("mercadolivre") ?? 0;
    if (now - lastMeli > RESYNC_MIN_INTERVAL_MS) {
      tasks.push(
        (async () => {
          const { syncMeli } = await import("@/lib/meli/sync");
          try {
            await syncMeli();
          } catch (err) {
            console.error("[bootstrap] sync Mercado Livre falhou:", err);
          }
        })(),
      );
    }
  }

  if (hasShopeeEnv()) {
    const lastShopee = memoryStore.lastSyncAt.get("shopee") ?? 0;
    if (now - lastShopee > RESYNC_MIN_INTERVAL_MS) {
      tasks.push(
        (async () => {
          const { syncShopee } = await import("@/lib/shopee/sync");
          try {
            await syncShopee();
            memoryStore.lastSyncAt.set("shopee", Date.now());
          } catch (err) {
            console.error("[bootstrap] sync Shopee falhou:", err);
          }
        })(),
      );
    }
  }

  if (tasks.length === 0) return;
  // Aguarda apenas se algum marketplace ainda não tem produtos em memória
  // (cobertura mínima já é garantida pelo snapshot Shopee, então o critério
  // real aqui é se ML já hidratou).
  if (!memoryHasMarketplace("mercadolivre")) {
    await Promise.all(tasks);
  } else {
    Promise.all(tasks).catch(() => undefined);
  }
}
