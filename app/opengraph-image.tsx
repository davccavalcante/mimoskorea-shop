import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt =
  "Ofertas Mimos Korea Design — Shopee, Amazon e Mercado Livre";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PILL_RADIUS = 30;

const PILL_STYLE = {
  padding: "10px 24px",
  borderRadius: PILL_RADIUS,
  fontSize: 22,
  fontWeight: 700,
  textTransform: "uppercase" as const,
  letterSpacing: 2,
};

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: BRAND.pageCanvas,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          fontSize: 28,
          color: BRAND.brand,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        Mimos Korea Design
      </div>
      <div
        style={{
          fontSize: 72,
          color: "#000",
          fontWeight: 900,
          textAlign: "center",
          lineHeight: 1.1,
          maxWidth: 980,
        }}
      >
        Ofertas Coreanas na Shopee, Amazon e Mercado Livre
      </div>
      <div style={{ marginTop: 40, display: "flex", gap: 16 }}>
        <span
          style={{ ...PILL_STYLE, background: BRAND.shopee, color: "white" }}
        >
          Shopee
        </span>
        <span
          style={{
            ...PILL_STYLE,
            background: BRAND.mercadolivre,
            color: "black",
          }}
        >
          Mercado Livre
        </span>
        <span
          style={{ ...PILL_STYLE, background: BRAND.amazon, color: "black" }}
        >
          Amazon
        </span>
      </div>
    </div>,
    { ...size },
  );
}
