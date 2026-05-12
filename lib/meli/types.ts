import "server-only";

export type MeliTokenResponse = {
  access_token: string;
  token_type: "Bearer" | "bearer" | string;
  expires_in: number; // segundos (normalmente 21600 = 6h)
  scope?: string;
  user_id: number;
  refresh_token: string;
  /** Presente quando ocorre erro */
  error?: string;
  message?: string;
  status?: number;
};

export type MeliItemsSearchResponse = {
  seller_id?: string;
  results: string[]; // lista de MLB IDs
  paging: {
    limit: number;
    offset: number;
    total: number;
  };
  query?: string;
};

export type MeliPicture = {
  id?: string;
  url: string;
  secure_url?: string;
  size?: string;
  max_size?: string;
  quality?: string;
};

export type MeliItem = {
  id: string;
  title: string;
  price: number | null;
  currency_id: string; // "BRL"
  permalink: string; // deep-link para o produto
  thumbnail: string | null;
  secure_thumbnail?: string | null;
  pictures?: MeliPicture[];
  status: "active" | "paused" | "closed" | "under_review" | string;
  available_quantity?: number;
  sold_quantity?: number;
};

/**
 * Resposta de `/items?ids=...` vem como array de envelopes:
 *   [{ code: 200, body: MeliItem }, ...]
 */
export type MeliMultiGetEnvelope = {
  code: number;
  body: MeliItem | Record<string, unknown>;
};
