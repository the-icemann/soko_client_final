import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useMemo } from "react";

import { MarketplaceFilters } from "@/components/market-place/MarketplaceFilters";
import { MarketplaceGrid } from "@/components/market-place/MarketplaceGrid";
import { Button } from "@/components/ui/button";
import { useListings } from "@/hooks/useMarketplace";
import { useMarketplaceStore } from "@/store/useMarketplaceStore";

export const Route = createFileRoute("/(app)/marketplace/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  // ── Server state ──────────────────────────────────────────────────────────
  // Filtering by category, district, search is done server-side via query params.
  const { data: listings = [], isLoading, error } = useListings();

  // ── Client UI state ───────────────────────────────────────────────────────
  const { sort, viewMode } = useMarketplaceStore();

  // ── Client-side sort only (server already filtered) ───────────────────────
  const sorted = useMemo(() => {
    if (sort === "price-asc") return [...listings].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...listings].sort((a, b) => b.price - a.price);
    if (sort === "rating") return [...listings].sort((a, b) => b.rating - a.rating);
    // "newest" — sorted by createdAt desc (backend default, preserve order)
    return listings;
  }, [listings, sort]);

  return (
    <div className="max-w-7xl mx-auto px-5 py-6 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover fresh produce from verified Ugandan farmers
        </p>
      </div>

      <MarketplaceFilters />

      {/* Results bar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            <span className="animate-pulse">Loading listings…</span>
          ) : error ? (
            <span className="text-destructive">Failed to load listings</span>
          ) : (
            <>
              <span className="font-semibold text-foreground">{sorted.length}</span> results found
            </>
          )}
        </p>
        <Button size="sm" className="gap-1.5" onClick={() => navigate({ to: "/sell" })}>
          <Plus className="w-4 h-4" />
          List Your Produce
        </Button>
      </div>

      <MarketplaceGrid products={sorted} viewMode={viewMode} isLoading={isLoading} />
    </div>
  );
}
