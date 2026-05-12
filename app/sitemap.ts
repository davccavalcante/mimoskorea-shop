import type { MetadataRoute } from "next";

const SITE_URL = "https://mimoskorea.com.br/shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
