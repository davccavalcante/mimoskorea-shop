/**
 * Preço estilo varejo brasileiro (Submarino/Americanas/Mercado Livre):
 * `R$` e centavos menores, reais dominante. Mantém `tabular-nums` para
 * alinhamento de dígitos em listas.
 *
 * Spec responsiva (rem-based, escala com user-font-size):
 *   mobile (<640px): reais 1.25rem / 800, R$ + centavos 0.75rem / 700
 *   sm+:             reais 1.5rem / 800,  R$ + centavos 0.875rem / 700
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
      <span className="mr-1 text-[0.75rem] font-bold sm:text-[0.875rem]">
        R$
      </span>
      <span className="text-[1.25rem] font-extrabold leading-none sm:text-[1.5rem]">
        {reais.toLocaleString("pt-BR")}
      </span>
      <span className="ml-0.5 text-[0.75rem] font-bold sm:text-[0.875rem]">
        ,{centsStr}
      </span>
    </div>
  );
}
