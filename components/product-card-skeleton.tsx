export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-pill bg-background">
      <div className="aspect-[4/5] w-full bg-white animate-pulse" />
      <div className="flex flex-1 flex-col gap-3 bg-card-content p-4">
        <div className="h-5 w-11/12 bg-muted animate-pulse" />
        <div className="h-5 w-2/3 bg-muted animate-pulse" />
        <div className="h-7 w-32 bg-muted animate-pulse" />
        <div className="mt-auto h-11 w-full rounded-pill bg-muted animate-pulse" />
      </div>
    </div>
  );
}
