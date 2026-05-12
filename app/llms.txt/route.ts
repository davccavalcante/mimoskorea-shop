// Convenção 2026: /llms.txt — índice em Markdown pra LLMs (https://llmstxt.org/).
// Adoção pequena ainda, mas custo zero e potencialmente útil pra GEO.

const CONTENT = `# Mimos Korea Design

> Catálogo oficial da marca Mimos Korea Design — vitrine que reúne todos os produtos vendidos nas lojas oficiais em Shopee, Amazon Brasil e Mercado Livre. Cada produto linka direto para o marketplace de origem.

## O que vendemos

- Bebidas coreanas (Soju Lotte Chum-Churum, Milkis, café Lotte Cantata, Let's Be, OKF, sucos Yantai)
- Lamen e ramyun coreano (Sinomie, Buldak, Yopokki)
- Snacks coreanos (Orion O'Star, Koony, salgadinhos picantes)
- Kits temáticos (Soju, K-food, presentes)
- Mochilas infantis com tema coreano

## Onde comprar

- Shopee: https://shopee.com.br/mimoskorea
- Amazon Brasil: https://www.amazon.com.br/stores/MimosKoreaMKD
- Mercado Livre: https://www.mercadolivre.com.br/perfil/MIMOSKOREA

## Páginas

- [Catálogo unificado](https://mimoskorea.com.br/shop): todos os produtos com link direto pra cada marketplace
- [Política de privacidade](https://mimoskorea.com.br/shop/privacidade) — em construção
- [Termos de uso](https://mimoskorea.com.br/shop/termos) — em construção

## Contato

- Instagram: https://instagram.com/mimoskoreadesign
- TikTok: https://tiktok.com/@mimoskoreadesign
- Facebook: https://facebook.com/mimoskoreadesign
- X: https://x.com/mimoskorea
- LinkedIn: https://linkedin.com/company/mimoskorea
- WhatsApp: https://wa.me/5581998769121
`;

export function GET() {
  return new Response(CONTENT, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
