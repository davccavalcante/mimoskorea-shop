import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import Script from "next/script";
import { MotionProvider } from "@/components/motion-provider";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const SITE_URL = "https://mimoskorea.com.br/shop";
const SITE_NAME = "Mimos Korea Design";
const TITLE = "Ofertas Mimos Korea Design — Shopee, Amazon e Mercado Livre";
const DESCRIPTION =
  "Catálogo oficial da Mimos Korea Design: snacks, soju, lamen, cafés e bebidas coreanas com ofertas atualizadas na Shopee, Amazon Brasil e Mercado Livre.";
const GA_ID = "G-0XTJ2T9WM8";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  generator: "David C Cavalcante",
  authors: [{ name: "Mimos Korea Design", url: SITE_URL }],
  keywords: [
    "mimos korea",
    "mimos korea design",
    "produtos coreanos brasil",
    "soju",
    "lamen coreano",
    "ramyun",
    "buldak",
    "café coreano",
    "milkis",
    "snack coreano",
    "k-food",
    "yopokki",
    "kit coreano presente",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    site: "@mimoskorea",
    creator: "@mimoskorea",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: BRAND.pageCanvas,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: DESCRIPTION,
  inLanguage: "pt-BR",
  areaServed: "BR",
  sameAs: [
    "https://x.com/mimoskorea",
    "https://instagram.com/mimoskoreadesign",
    "https://tiktok.com/@mimoskoreadesign",
    "https://facebook.com/mimoskoreadesign",
    "https://linkedin.com/company/mimoskorea",
    "https://wa.me/5581998769121",
    "https://shopee.com.br/mimoskorea",
    "https://www.amazon.com.br/stores/MimosKoreaMKD",
    "https://www.mercadolivre.com.br/perfil/MIMOSKOREA",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    url: "https://wa.me/5581998769121",
    availableLanguage: ["Portuguese"],
    areaServed: "BR",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "pt-BR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} bg-background`}>
      <head>
        {/* JSON-LD: Organization + WebSite */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD precisa renderizar como texto bruto
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD precisa renderizar como texto bruto
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-sans antialiased">
        <MotionProvider>{children}</MotionProvider>
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            {/* Google Analytics 4 — atenção: usa cookies, requer banner LGPD pra produção. */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
