import { Link } from "@tanstack/react-router";

import { Product } from "@/types";

import { ProductCard } from "../common/product-card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

interface FreshListingsSectionProps {
  products: Product[];
  isLoading?: boolean;
}

export const FreshListingsSection = ({ products, isLoading }: FreshListingsSectionProps) => {
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

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-32 md:h-40 w-full rounded-xl" />
                <Skeleton className="h-3 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))
          : products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
};
