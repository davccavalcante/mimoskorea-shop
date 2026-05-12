import type { Marketplace } from "@/lib/products";
import { marketplaceLabels } from "@/lib/products";

interface PlatformBadgeProps {
  marketplace: Marketplace;
}

// Cores de marca de cada marketplace, via tokens em globals.css.
const styles: Record<Marketplace, string> = {
  shopee: "bg-shopee text-shopee-foreground",
  mercadolivre: "bg-mercadolivre text-mercadolivre-foreground",
  amazon: "bg-amazon text-amazon-foreground",
};

export function PlatformBadge({ marketplace }: PlatformBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles[marketplace]}`}
    >
      {marketplaceLabels[marketplace]}
    </span>
  );
}
