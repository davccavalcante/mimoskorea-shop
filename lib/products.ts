export type Marketplace = "amazon" | "shopee" | "mercadolivre";

export interface Product {
  id: string;
  title: string;
  price: number;
  currency: "BRL";
  image: string;
  url: string;
  marketplace: Marketplace;
}

export interface ProductPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export const marketplaceLabels: Record<Marketplace, string> = {
  amazon: "Amazon",
  shopee: "Shopee",
  mercadolivre: "Mercado Livre",
};

export const marketplaceUrls: Record<Marketplace, string> = {
  amazon: "https://www.amazon.com.br/stores/MimosKoreaMKD",
  shopee: "https://shopee.com.br/mimoskorea",
  mercadolivre: "https://www.mercadolivre.com.br/perfil/MIMOSKOREA",
};
