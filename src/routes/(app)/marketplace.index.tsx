import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ApiError } from "@/api/api";
import { MarketplaceFilters } from "@/components/market-place/MarketplaceFilters";
import { MarketplaceGrid } from "@/components/market-place/MarketplaceGrid";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useListings } from "@/hooks/useMarketplace";
import { useAuthStore } from "@/store/auth-store";
import { useMarketplaceStore } from "@/store/marketplace-store";

export const Route = createFileRoute("/(app)/marketplace/")({
  component: RouteComponent,
});

const PAGE_SIZE = 20;

function RouteComponent() {
  const navigate = useNavigate();

  const { data: listings = [], isLoading, error, refetch, isRefetching } = useListings();
  const { isAuthenticated, user } = useAuthStore();
  const { sort, viewMode, activeCategory, search, district } = useMarketplaceStore();

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, search, district, sort]);

  const sorted = useMemo(() => {
    if (sort === "price-asc") return [...listings].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...listings].sort((a, b) => b.price - a.price);
    if (sort === "rating") return [...listings].sort((a, b) => b.rating - a.rating);
    return listings;
  }, [listings, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    const is401 = error instanceof ApiError && error.status === 401;
    const is503 = error instanceof ApiError && error.status >= 500;

    return (
      <div className="max-w-7xl mx-auto px-5 py-6 pb-28">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
          <p className="text-4xl">{is503 ? "⚙️" : is401 ? "🔒" : "📡"}</p>
          <h2 className="text-xl font-bold text-foreground">
            {is503 ? "Server is unavailable" : is401 ? "Session expired" : "Couldn't load listings"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            {is503
              ? "We're having trouble on our end. Please try again in a moment."
              : is401
                ? "Your session has expired. Please sign in again."
                : error instanceof ApiError
                  ? error.message
                  : "Check your connection and try again."}
          </p>
          {is401 ? (
            <Button onClick={() => navigate({ to: "/auth/sign-in" })}>Sign in</Button>
          ) : (
            <Button onClick={() => refetch()} disabled={isRefetching}>
              {isRefetching ? "Retrying…" : "Try again"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ── Normal state ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-5 py-6 pb-28">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Marketplace</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover fresh produce from verified Ugandan farmers
        </p>
      </div>

      <MarketplaceFilters />

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            <span className="animate-pulse">Loading listings…</span>
          ) : (
            <>
              <span className="font-semibold text-foreground">{sorted.length}</span> results found
              {sorted.length > PAGE_SIZE && (
                <span className="ml-1">
                  · page {safePage} of {totalPages}
                </span>
              )}
            </>
          )}
        </p>
        {(user?.role === "farmer" || (user?.role === "both" && isAuthenticated())) && (
          <Button size="sm" className="gap-1.5" onClick={() => navigate({ to: "/sell" })}>
            <Plus className="w-4 h-4" />
            List Your Produce
          </Button>
        )}
      </div>

      <MarketplaceGrid products={paginated} viewMode={viewMode} isLoading={isLoading} />

      {!isLoading && totalPages > 1 && (
        <div className="mt-8">
          <PageControls page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}

function PageControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = buildPageRange(page, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => onPageChange(page - 1)} disabled={page <= 1} />
        </PaginationItem>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => onPageChange(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageRange(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const range: (number | "ellipsis")[] = [1];

  if (current > 3) range.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) range.push(i);

  if (current < total - 2) range.push("ellipsis");
  range.push(total);

  return range;
}
