import "server-only";

export type ShopeeTokenResponse = {
  access_token: string;
  refresh_token: string;
  expire_in: number; // segundos até access_token expirar (normalmente 14400 = 4h)
  /**
   * A Shopee não documenta TTL do refresh_token, mas a prática é ~30 dias.
   * Quando ausente, tratamos como desconhecido e apenas renovamos antes do access_token expirar.
   */
  request_id?: string;
  error?: string;
  message?: string;
};

export type ShopeeItemListItem = {
  item_id: number;
  item_status: string;
  update_time?: number;
};

export type ShopeeItemListResponse = {
  error: string;
  message: string;
  warning?: string;
  request_id: string;
  response?: {
    item: ShopeeItemListItem[];
    has_next_page: boolean;
    next_offset: number;
    total_count?: number;
  };
};

export type ShopeeItemBaseInfo = {
  item_id: number;
  item_name: string;
  item_status: string;
  category_id?: number;
  image?: {
    image_url_list?: string[];
    image_id_list?: string[];
  };
  price_info?: Array<{
    currency: string;
    original_price: number;
    current_price: number;
    inflated_price_of_original_price?: number;
    inflated_price_of_current_price?: number;
  }>;
  stock_info_v2?: unknown;
  item_sku?: string;
  create_time?: number;
  update_time?: number;
  has_model?: boolean;
  models?: Array<{
    model_id: number;
    price_info?: Array<{
      currency: string;
      original_price: number;
      current_price: number;
    }>;
  }>;
};

export type ShopeeItemBaseInfoResponse = {
  error: string;
  message: string;
  warning?: string;
  request_id: string;
  response?: {
    item_list: ShopeeItemBaseInfo[];
  };
};

export type ShopeeApiError = {
  error: string;
  message: string;
  request_id?: string;
};

export type ShopeeModel = {
  model_id: number;
  model_name?: string;
  model_sku?: string;
  model_status?: string;
  price_info?: Array<{
    currency: string;
    original_price: number;
    current_price: number;
  }>;
  stock_info_v2?: {
    summary_info?: {
      total_available_stock?: number;
      total_reserved_stock?: number;
    };
  };
};

export type ShopeeModelListResponse = {
  error: string;
  message: string;
  warning?: string;
  request_id: string;
  response?: {
    tier_variation?: unknown;
    model?: ShopeeModel[];
  };
};
