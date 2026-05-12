import type { NextConfig } from "next";

// Em produção, o app é servido em `mimoskorea.com.br/shop`. Build com:
//   NEXT_PUBLIC_BASE_PATH=/shop npm run build
// Em dev local, omita a env var para rodar no root (`http://localhost:3002/`).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
  images: {
    remotePatterns: [
      // Mercado Livre CDNs
      { protocol: "https", hostname: "http2.mlstatic.com" },
      { protocol: "https", hostname: "mlstatic.com" },
      { protocol: "https", hostname: "**.mlstatic.com" },
      // Shopee CDNs
      { protocol: "https", hostname: "cf.shopee.com.br" },
      { protocol: "https", hostname: "down-br.img.susercontent.com" },
      { protocol: "https", hostname: "**.susercontent.com" },
      // Amazon CDNs
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" },
      { protocol: "https", hostname: "**.ssl-images-amazon.com" },
    ],
  },
};

export default nextConfig;
