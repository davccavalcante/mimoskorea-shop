import "server-only";

import { createHmac } from "node:crypto";

export type ShopeeSignScope =
  | { kind: "public" }
  | { kind: "shop"; accessToken: string; shopId: string };

/**
 * Gera a assinatura HMAC-SHA256 exigida pela Shopee Open Platform v2.
 *
 * - Endpoints públicos (auth_partner, token/get): partner_id + path + timestamp
 * - Endpoints de loja: partner_id + path + timestamp + access_token + shop_id
 *
 * Referência: https://open.shopee.com/developer-guide/20
 */
export function signShopee(params: {
  partnerId: string;
  partnerKey: string;
  apiPath: string;
  timestamp: number;
  scope: ShopeeSignScope;
}): string {
  const { partnerId, partnerKey, apiPath, timestamp, scope } = params;

  const base =
    scope.kind === "shop"
      ? `${partnerId}${apiPath}${timestamp}${scope.accessToken}${scope.shopId}`
      : `${partnerId}${apiPath}${timestamp}`;

  return createHmac("sha256", partnerKey).update(base).digest("hex");
}

export function currentTimestampSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
