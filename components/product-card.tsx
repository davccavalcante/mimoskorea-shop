"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { PlatformBadge } from "@/components/platform-badge";
import { Price } from "@/components/price";
import type { Product } from "@/lib/products";

interface ProductCardProps {
  product: Product;
  index?: number;
  priority?: boolean;
}

export function ProductCard({
  product,
  index = 0,
  priority = false,
}: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.015, 0.15),
        ease: "easeOut",
      }}
      className="product-card-shell flex flex-col overflow-hidden rounded-pill bg-background"
    >
      {/* Imagem */}
      <Link
        href={product.url}
        target="_blank"
        rel="noopener"
        className="relative aspect-[4/5] w-full overflow-hidden bg-white"
        aria-label={`Ver ${product.title} no marketplace`}
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          className="object-contain"
        />
        <div className="absolute left-2 top-2">
          <PlatformBadge marketplace={product.marketplace} />
        </div>
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-3 bg-card-content p-4">
        <h2 className="text-[1.25rem] font-bold leading-[1.25rem] text-foreground line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h2>

        <div className="flex items-center justify-between">
          <Price value={product.price} />
        </div>

        {/* CTA */}
        <Link
          href={product.url}
          target="_blank"
          rel="noopener"
          aria-label={`Comprar ${product.title} no marketplace`}
          className="mt-auto inline-flex h-11 items-center justify-center rounded-pill bg-cta px-5 text-[1.125rem] font-bold uppercase text-cta-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2"
        >
          Eu quero
        </Link>
      </div>
    </motion.article>
  );
}
