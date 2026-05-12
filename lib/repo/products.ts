import "server-only";

import { memoryStore, productCompositeKey } from "@/lib/cache/memory";
import {
  type Marketplace,
  marketplaceUrls,
  type Product,
  type ProductPage,
} from "@/lib/products";
import { bootstrapIfEmpty } from "@/lib/repo/bootstrap";

/**
 * Camada de acesso ao catálogo unificado.
 *
 * Fonte única: memória do processo (snapshot Shopee + sync ao vivo Shopee/ML).
 * Catálogo vazio só acontece se o snapshot não foi seedado ou se ambos os syncs
 * falharam — sinaliza erro de configuração.
 */

function paginateMemory(page: number, pageSize: number): ProductPage {
  const safePage = Math.max(1, page);
  const all = Array.from(memoryStore.products.values());
  // Round-robin por marketplace: garante que a primeira página exiba uma
  // mistura representativa em vez de saturar com o marketplace que sincronizou
  // primeiro (memoryStore.products é um Map em ordem de inserção).
  const buckets = new Map<Marketplace, Product[]>();
  for (const p of all) {
    const bucket = buckets.get(p.marketplace);
    if (bucket) bucket.push(p);
    else buckets.set(p.marketplace, [p]);
  }
  const ordered: Product[] = [];
  let idx = 0;
  let added = true;
  while (added) {
    added = false;
    for (const list of buckets.values()) {
      if (idx < list.length) {
        ordered.push(list[idx]);
        added = true;
      }
    }
    idx += 1;
  }
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize;
  const items = ordered.slice(from, to);
  return {
    items,
    page: safePage,
    pageSize,
    total: ordered.length,
    hasMore: to < ordered.length,
  };
}

export async function getProductsPage(
  page: number,
  pageSize = 18,
): Promise<ProductPage> {
  await bootstrapIfEmpty();

  if (memoryStore.products.size > 0) {
    return paginateMemory(page, pageSize);
  }

  return {
    items: [],
    page: Math.max(1, page),
    pageSize,
    total: 0,
    hasMore: false,
  };
}

export interface UpsertProductInput {
  marketplace: Marketplace;
  marketplaceItemId: string;
  title: string;
  price: number;
  currency?: string;
  image: string;
  url: string;
  status?: "active" | "hidden" | "archived";
}

export async function upsertProducts(
  inputs: UpsertProductInput[],
): Promise<number> {
  if (inputs.length === 0) return 0;

  let upserted = 0;
  for (const p of inputs) {
    const status = p.status ?? "active";
    if (status !== "active") {
      memoryStore.products.delete(
        productCompositeKey(p.marketplace, p.marketplaceItemId),
      );
      continue;
    }
    const product: Product = {
      id: `${p.marketplace}:${p.marketplaceItemId}`,
      title: p.title,
      price: p.price,
      currency: "BRL",
      image: p.image,
      url: p.url,
      marketplace: p.marketplace,
    };
    memoryStore.products.set(
      productCompositeKey(p.marketplace, p.marketplaceItemId),
      product,
    );
    upserted += 1;
  }
  return upserted;
}

/**
 * Remove da memória os produtos do marketplace cujo id não aparece em
 * `keepItemIds`.
 */
export async function archiveMissingProducts(params: {
  marketplace: Marketplace;
  keepItemIds: string[];
}): Promise<number> {
  const keep = new Set(params.keepItemIds);
  let removed = 0;
  for (const [key, product] of memoryStore.products.entries()) {
    if (product.marketplace !== params.marketplace) continue;
    const [, id] = key.split(":");
    if (!keep.has(id)) {
      memoryStore.products.delete(key);
      removed += 1;
    }
  }
  return removed;
}

export function getMarketplaceStorefront(marketplace: Marketplace): string {
  return marketplaceUrls[marketplace];
}
