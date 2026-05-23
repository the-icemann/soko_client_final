import { Link } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@/types";

import { ProductCard } from "../common/product-card";
import { Button } from "../ui/button";

export const FreshListingsSection = ({
  products,
  isLoading,
}: {
  products: Product[];
  isLoading?: boolean;
}) => {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-foreground">🛒 Fresh Listings</h3>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-[11px] font-semibold text-primary"
          asChild
        >
          <Link to="/marketplace">See all</Link>
        </Button>
      </div>

      {!isLoading && products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-10 text-center">
          <span className="text-3xl">🌾</span>
          <p className="text-sm font-medium text-muted-foreground">No listings right now</p>
          <p className="text-xs text-muted-foreground">Check back soon for fresh produce</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))
            : products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};
