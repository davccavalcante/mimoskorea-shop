import "server-only";

import type { Marketplace, Product } from "@/lib/products";

/**
 * Fallback em memória (processo Node.js) para quando o Supabase não está
 * configurado. Sobrevive apenas ao ciclo de vida do runtime — em ambiente
 * serverless (Vercel) cold starts zeram. Útil em desenvolvimento e como
 * ponte até o DB ser provisionado.
 *
 * Mantemos uma instância única via `globalThis` para resistir ao HMR do Next.
 */

export interface MemoryTokenRecord {
  marketplace: Marketplace;
  shopId: string | null;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string; // ISO
  refreshExpiresAt: string | null; // ISO
  metadata: Record<string, unknown>;
  updatedAt: string; // ISO
}

export interface MemoryStore {
  products: Map<string, Product>;
  tokens: Map<Marketplace, MemoryTokenRecord>;
  lastSyncAt: Map<Marketplace, number>;
  /** Lock por marketplace para evitar sync concorrente. */
  syncLocks: Map<Marketplace, Promise<unknown>>;
}

declare global {
  var __mimos_memory_store__: MemoryStore | undefined;
}

function createStore(): MemoryStore {
  return {
    products: new Map(),
    tokens: new Map(),
    lastSyncAt: new Map(),
    syncLocks: new Map(),
  };
}

export const memoryStore: MemoryStore =
  globalThis.__mimos_memory_store__ ?? createStore();

if (!globalThis.__mimos_memory_store__) {
  globalThis.__mimos_memory_store__ = memoryStore;
}

export function productCompositeKey(
  marketplace: Marketplace,
  marketplaceItemId: string,
): string {
  return `${marketplace}:${marketplaceItemId}`;
}
