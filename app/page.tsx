import { ProductGrid } from "@/components/product-grid";
import { PromoStrip } from "@/components/promo-strip";
import { SiteFooter } from "@/components/site-footer";
import { getProductsPage } from "@/lib/repo/products";

const PAGE_SIZE = 18;
const SITE_URL = "https://mimoskorea.com.br/shop";

export default async function HomePage() {
  const initialData = await getProductsPage(1, PAGE_SIZE);

  // ItemList schema com os produtos visíveis no SSR — máx 30 pra não estourar o doc.
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Catálogo Mimos Korea Design",
    url: SITE_URL,
    numberOfItems: initialData.total,
    itemListElement: initialData.items.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.title,
        description: p.title,
        image: p.image,
        url: p.url,
        brand: { "@type": "Brand", name: "Mimos Korea Design" },
        offers: {
          "@type": "Offer",
          priceCurrency: p.currency,
          price: p.price,
          availability: "https://schema.org/InStock",
          url: p.url,
          seller: { "@type": "Organization", name: "Mimos Korea Design" },
        },
      },
    })),
  };

  return (
    <div className="flex min-h-dvh flex-col bg-page-canvas text-foreground">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD precisa renderizar como texto bruto
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <PromoStrip productCount={initialData.total} />
      <main className="flex-1">
        {/* Hero / Título */}
        <section>
          <div className="mx-auto w-full max-w-[1600px] px-4 py-10 md:px-8 md:py-14">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center">
              <h1 className="text-[2.625rem] font-black leading-tight text-black text-balance">
                Ofertas Mimos Korea Design na Shopee, Amazon, e Mercado Livre
              </h1>
              <p className="text-[1.25rem] font-medium text-black text-pretty">
                Seleção oficial de produtos coreanos disponíveis nas lojas Mimos
                Korea Design em Amazon Brasil, Shopee e Mercado Livre. Clique em
                qualquer item para comprar no marketplace de origem.
              </p>
              <span className="inline-flex items-center rounded-pill bg-white px-3 py-1 text-[0.8125rem] font-semibold text-black">
                {initialData.total} produtos no catálogo
              </span>
            </div>
          </div>
        </section>

        {/* Grid com scroll infinito */}
        <section className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-8 md:py-10">
          <ProductGrid initialData={initialData} pageSize={PAGE_SIZE} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
