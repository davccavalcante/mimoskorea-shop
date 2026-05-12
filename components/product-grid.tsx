"use client";

import { useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";
import { ProductCard } from "@/components/product-card";
import { ProductCardSkeleton } from "@/components/product-card-skeleton";
import type { Product, ProductPage } from "@/lib/products";

interface ProductGridProps {
  initialData: ProductPage;
  pageSize?: number;
}

const fetcher = (url: string): Promise<ProductPage> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Falha ao carregar produtos");
    return res.json();
  });

export function ProductGrid({ initialData, pageSize = 18 }: ProductGridProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const getKey = (pageIndex: number, previousPageData: ProductPage | null) => {
    if (previousPageData && !previousPageData.hasMore) return null;
    return `/api/products?page=${pageIndex + 1}&pageSize=${pageSize}`;
  };

  const { data, size, setSize, isValidating, error } =
    useSWRInfinite<ProductPage>(getKey, fetcher, {
      fallbackData: [initialData],
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    });

  const items: Product[] = useMemo(
    () => (data ? data.flatMap((page) => page.items) : []),
    [data],
  );

  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage?.hasMore ?? false;
  const isLoadingMore =
    isValidating && data && typeof data[size - 1] === "undefined";

  const skeletonKeys = useMemo(
    () => Array.from({ length: pageSize }, () => crypto.randomUUID()),
    [pageSize],
  );

  // IntersectionObserver para scroll infinito
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isValidating) {
          setSize((s) => s + 1);
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isValidating, setSize]);

  if (items.length === 0 && !isValidating) {
    return (
      <div className="flex min-h-[320px] items-center justify-center border border-border bg-background">
        <p className="text-[16px] text-muted-foreground">
          Nenhum produto disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            priority={index < 6}
          />
        ))}

        {isLoadingMore &&
          skeletonKeys.map((key) => <ProductCardSkeleton key={key} />)}
      </div>

      {/* Sentinela para o observer */}
      {hasMore && (
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
      )}

      {/* Estado final */}
      <div className="flex items-center justify-center pb-2">
        {error ? (
          <button
            type="button"
            onClick={() => setSize(size)}
            className="rounded-pill border border-border px-4 py-2 text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            Tentar novamente
          </button>
        ) : null}
      </div>
    </div>
  );
}
