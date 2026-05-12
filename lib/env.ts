import "server-only";

type EnvSource = NodeJS.ProcessEnv;

function read(source: EnvSource, key: string): string | undefined {
  const value = source[key];
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function required(source: EnvSource, key: string): string {
  const value = read(source, key);
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${key}`);
  }
  return value;
}

function optional(
  source: EnvSource,
  key: string,
  fallback?: string,
): string | undefined {
  return read(source, key) ?? fallback;
}

export function getAppEnv() {
  const source = process.env;
  return {
    baseUrl: optional(
      source,
      "APP_BASE_URL",
      "http://localhost:3001",
    ) as string,
    cronSecret: optional(source, "CRON_SECRET"),
  };
}

export function hasShopeeEnv(): boolean {
  const source = process.env;
  return Boolean(
    read(source, "SHOPEE_PARTNER_ID") &&
      read(source, "SHOPEE_PARTNER_KEY") &&
      read(source, "SHOPEE_REDIRECT_URL"),
  );
}

export function getShopeeEnv() {
  const source = process.env;
  return {
    partnerId: required(source, "SHOPEE_PARTNER_ID"),
    partnerKey: required(source, "SHOPEE_PARTNER_KEY"),
    shopId: optional(source, "SHOPEE_SHOP_ID"),
    host: optional(
      source,
      "SHOPEE_HOST",
      "https://partner.shopeemobile.com",
    ) as string,
    redirectUrl: required(source, "SHOPEE_REDIRECT_URL"),
    storefrontHost: optional(
      source,
      "SHOPEE_STOREFRONT_HOST",
      "https://shopee.com.br",
    ) as string,
    // Bootstrap opcional: se ainda não há token persistido (Supabase ou memória),
    // o sync usa esses valores para iniciar. Igual ao MELI_REFRESH_TOKEN.
    refreshToken: optional(source, "SHOPEE_REFRESH_TOKEN"),
    accessToken: optional(source, "SHOPEE_ACCESS_TOKEN"),
    accessTokenExpiresAt: optional(source, "SHOPEE_ACCESS_TOKEN_EXPIRES_AT"),
  };
}

export function hasMeliEnv(): boolean {
  const source = process.env;
  return Boolean(
    read(source, "MELI_CLIENT_ID") &&
      read(source, "MELI_CLIENT_SECRET") &&
      read(source, "MELI_USER_ID"),
  );
}

export function getMeliEnv() {
  const source = process.env;
  return {
    clientId: required(source, "MELI_CLIENT_ID"),
    clientSecret: required(source, "MELI_CLIENT_SECRET"),
    userId: required(source, "MELI_USER_ID"),
    redirectUrl: optional(
      source,
      "MELI_REDIRECT_URL",
      "http://localhost:3001/api/mercadolivre/oauth/callback",
    ) as string,
    refreshToken: optional(source, "MELI_REFRESH_TOKEN"),
    host: optional(
      source,
      "MELI_API_HOST",
      "https://api.mercadolibre.com",
    ) as string,
  };
}
