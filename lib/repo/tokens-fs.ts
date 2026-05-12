import "server-only";

import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";

import type { Marketplace } from "@/lib/products";

/**
 * Persistência de tokens em JSON no disco. Usado como fonte de verdade quando
 * Supabase não está configurado.
 *
 * Caminho do arquivo:
 *   - `TOKENS_FILE` env var, se definida (recomendado em produção, ex.:
 *     `/var/lib/mimoskorea-shop/tokens.json` — fora do diretório do deploy
 *     pra sobreviver a `git pull`/rsync do CI/CD).
 *   - Senão `<cwd>/tokens.json` (gitignored, bom pra dev local).
 *
 * Escrita atômica via tmp + rename pra evitar corrupção em caso de crash
 * no meio da escrita.
 */

export interface SerializedToken {
  marketplace: Marketplace;
  shopId: string | null;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: string; // ISO
  refreshExpiresAt: string | null; // ISO
  metadata: Record<string, unknown>;
  updatedAt: string; // ISO
}

type FileShape = Partial<Record<Marketplace, SerializedToken>>;

const DEFAULT_FILENAME = "tokens.json";

export function tokensFilePath(): string {
  const fromEnv = process.env.TOKENS_FILE?.trim();
  const path = fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_FILENAME;
  return isAbsolute(path) ? path : resolve(process.cwd(), path);
}

async function readAll(): Promise<FileShape> {
  const path = tokensFilePath();
  if (!existsSync(path)) return {};
  try {
    const text = await readFile(path, "utf8");
    return JSON.parse(text) as FileShape;
  } catch (err) {
    console.error(`[tokens-fs] falha lendo ${path}:`, err);
    return {};
  }
}

async function writeAll(data: FileShape): Promise<void> {
  const path = tokensFilePath();
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  await rename(tmp, path);
}

export async function readTokenFromFile(
  marketplace: Marketplace,
): Promise<SerializedToken | null> {
  const all = await readAll();
  return all[marketplace] ?? null;
}

export async function writeTokenToFile(token: SerializedToken): Promise<void> {
  const all = await readAll();
  all[token.marketplace] = token;
  await writeAll(all);
}
