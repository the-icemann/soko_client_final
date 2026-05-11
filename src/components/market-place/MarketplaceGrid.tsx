import { ProductCard } from "@/components/common/product-card";
import { ProductListItem } from "@/components/market-place/ProductListItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { ViewMode } from "@/store/marketplace-store";
import type { Product } from "@/types";

interface MarketplaceGridProps {
  products: Product[];
  viewMode: ViewMode;
  isLoading?: boolean;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4">🌾</span>
      <p className="text-base font-semibold text-foreground">No produce found</p>
      <p className="text-sm text-muted-foreground mt-1">
        Try adjusting your filters or search term.
      </p>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/2 rounded" />
          <Skeleton className="h-8 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function MarketplaceGrid({ products, viewMode, isLoading }: MarketplaceGridProps) {
  if (isLoading) {
    return viewMode === "list" ? <ListSkeleton /> : <GridSkeleton />;
  }

  if (products.length === 0) return <EmptyState />;

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-3">
        {products.map((p) => (
          <ProductListItem key={p.id} product={p} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
