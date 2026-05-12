/**
 * Preço estilo varejo brasileiro (Submarino/Americanas/Mercado Livre):
 * `R$` e centavos menores, reais dominante. Mantém `tabular-nums` para
 * alinhamento de dígitos em listas.
 *
 * Spec: reais 24px / 800, R$ + centavos 14px / 700.
 */
interface PriceProps {
  value: number;
}

export function Price({ value }: PriceProps) {
  const reais = Math.floor(value);
  const cents = Math.round((value - reais) * 100);
  const centsStr = String(cents).padStart(2, "0");

  return (
    <div className="inline-flex items-baseline tabular-nums text-foreground">
      <span className="mr-1 text-[14px] font-bold">R$</span>
      <span className="text-[24px] font-extrabold leading-none">
        {reais.toLocaleString("pt-BR")}
      </span>
      <span className="ml-0.5 text-[14px] font-bold">,{centsStr}</span>
    </div>
  );
}
