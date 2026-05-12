/**
 * Faixa de comunicação no topo — energia de catálogo de varejo (Amazon /
 * Black Friday / Mercado Livre) com mensagem **sempre verdadeira**:
 * - "OFICIAL" reforça trust
 * - Quantidade real de produtos como âncora numérica
 * - Marketplaces nomeados como pills coloridos (reforça o valor único do
 *   site: o cliente escolhe onde comprar)
 *
 * Não contém promessas que não controlamos (frete grátis, parcelamento,
 * descontos), pra evitar quebra de expectativa quando o usuário cai no
 * marketplace.
 */
interface PromoStripProps {
  productCount: number;
}

const MARKETPLACE_PILLS = [
  { label: "Shopee", className: "bg-shopee text-shopee-foreground" },
  { label: "Amazon", className: "bg-amazon text-amazon-foreground" },
  {
    label: "Mercado Livre",
    className: "bg-mercadolivre text-mercadolivre-foreground",
  },
] as const;

export function PromoStrip({ productCount }: PromoStripProps) {
  return (
    <div className="w-full bg-black px-4 py-2 md:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-white">
        <span>Oficial</span>
        <span aria-hidden="true" className="text-white/40">
          ·
        </span>
        <span>
          <span className="text-cta">{productCount}</span> produtos coreanos
        </span>
        <span aria-hidden="true" className="text-white/40">
          ·
        </span>
        <ul className="flex flex-wrap items-center justify-center gap-2">
          {MARKETPLACE_PILLS.map((pill) => (
            <li key={pill.label}>
              <span
                className={`inline-flex items-center rounded-pill px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] ${pill.className}`}
              >
                {pill.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
