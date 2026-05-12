import "server-only";

import { type MemoryTokenRecord, memoryStore } from "@/lib/cache/memory";
import type { Marketplace } from "@/lib/products";
import {
  readTokenFromFile,
  type SerializedToken,
  writeTokenToFile,
} from "@/lib/repo/tokens-fs";

export interface IntegrationToken {
  marketplace: Marketplace;
  shopId: string | null;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string; // ISO
  refreshExpiresAt: string | null; // ISO
  metadata: Record<string, unknown>;
  updatedAt: string; // ISO
}

function memoryToDomain(record: MemoryTokenRecord): IntegrationToken {
  return {
    marketplace: record.marketplace,
    shopId: record.shopId,
    accessToken: record.accessToken,
    refreshToken: record.refreshToken,
    accessExpiresAt: record.accessExpiresAt,
    refreshExpiresAt: record.refreshExpiresAt,
    metadata: record.metadata,
    updatedAt: record.updatedAt,
  };
}

function fileToDomain(record: SerializedToken): IntegrationToken {
  return {
    marketplace: record.marketplace,
    shopId: record.shopId,
    accessToken: record.accessToken,
    refreshToken: record.refreshToken,
    accessExpiresAt: record.accessExpiresAt,
    refreshExpiresAt: record.refreshExpiresAt,
    metadata: record.metadata ?? {},
    updatedAt: record.updatedAt,
  };
}

export async function getToken(
  marketplace: Marketplace,
): Promise<IntegrationToken | null> {
  // Cache em memória (rápido) + arquivo em disco (durável entre reinícios).
  const cached = memoryStore.tokens.get(marketplace);
  if (cached) return memoryToDomain(cached);

  const fromFile = await readTokenFromFile(marketplace);
  if (fromFile) {
    memoryStore.tokens.set(marketplace, {
      marketplace: fromFile.marketplace,
      shopId: fromFile.shopId,
      accessToken: fromFile.accessToken,
      refreshToken: fromFile.refreshToken,
      accessExpiresAt: fromFile.accessExpiresAt,
      refreshExpiresAt: fromFile.refreshExpiresAt,
      metadata: fromFile.metadata ?? {},
      updatedAt: fromFile.updatedAt,
    });
    return fileToDomain(fromFile);
  }
  return null;
}

export interface SaveTokenInput {
  marketplace: Marketplace;
  shopId: string | null;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date | null;
  metadata?: Record<string, unknown>;
}

export async function saveToken(
  input: SaveTokenInput,
): Promise<IntegrationToken> {
  const record: MemoryTokenRecord = {
    marketplace: input.marketplace,
    shopId: input.shopId,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    accessExpiresAt: input.accessExpiresAt.toISOString(),
    refreshExpiresAt: input.refreshExpiresAt?.toISOString() ?? null,
    metadata: input.metadata ?? {},
    updatedAt: new Date().toISOString(),
  };
  memoryStore.tokens.set(input.marketplace, record);
  // Persiste no disco (best-effort; se falhar, memória ainda tem).
  try {
    await writeTokenToFile({
      marketplace: record.marketplace,
      shopId: record.shopId,
      accessToken: record.accessToken,
      refreshToken: record.refreshToken,
      accessExpiresAt: record.accessExpiresAt,
      refreshExpiresAt: record.refreshExpiresAt,
      metadata: record.metadata,
      updatedAt: record.updatedAt,
    });
  } catch (err) {
    console.error(
      `[repo.tokens] falha persistindo ${input.marketplace} em disco:`,
      err,
    );
  }
  return memoryToDomain(record);
}
