// Cores de marca centralizadas.
//
// **Espelhado em `app/globals.css` (tokens CSS).** A duplicação é necessária
// porque os geradores de imagem (next/og em app/icon.tsx, apple-icon.tsx,
// opengraph-image.tsx) rodam fora do runtime CSS — não conseguem ler
// custom properties. Quando trocar uma cor aqui, atualizar também o token
// correspondente em globals.css.

export const BRAND = {
  brand: "#169485",
  cta: "#FFC313",
  pageCanvas: "#bac2f9",
  shopee: "#EE4D2D",
  mercadolivre: "#FFE600",
  amazon: "#FF9900",
} as const;
