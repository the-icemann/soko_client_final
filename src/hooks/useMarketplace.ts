// TanStack Query hooks for the marketplace LIST page.
// existing useMarketplaceStore so every component that reads the store
// continues to work without changes.

import { useQuery } from "@tanstack/react-query";

import { fetchListings, ListingParams } from "@/api/listings.api";
import { useAuthStore } from "@/store/auth-store";
import { useMarketplaceStore } from "@/store/useMarketplaceStore";
import { Product } from "@/types";

// ── Query keys

export const listingKeys = {
  all: () => ["listings"] as const,
  list: (params: ListingParams) => ["listings", "list", params] as const,
  detail: (id: string) => ["listings", "detail", id] as const,
  reviews: (id: string, page: number) => ["listings", "reviews", id, page] as const,
  farmer: (farmerId: string) => ["listings", "farmer", farmerId] as const,
};

// ── useListings ───────────────────────────────────────────────────────────────
/**
 * Fetches the filtered listing list for the marketplace page.
 *
 * Filtering by category, district and search happens server-side.
 * Sorting is still done client-side (no backend sort param) to avoid
 * extra round-trips for each sort change.
 *
 * The raw Product[] is returned from the hook so the page component can
 * handle sorting locally (same as before), while `isLoading` and `error`
 * are exposed for UI feedback.
 */
export function useListings() {
  const token = useAuthStore((s) => s.token);
  const activeCategory = useMarketplaceStore((s) => s.activeCategory);
  const search = useMarketplaceStore((s) => s.search);
  const district = useMarketplaceStore((s) => s.district);

  const params: ListingParams = {
    category: activeCategory === "All" ? undefined : activeCategory,
    district: district === "All" ? undefined : district,
    search: search.trim() || undefined,
    limit: 60, // fetch enough to sort client-side without pagination for now
  };

  return useQuery({
    queryKey: listingKeys.list(params),
    queryFn: () => fetchListings(params, token),
    staleTime: 1000 * 60 * 2, // 2 min
    placeholderData: (prev) => prev,
  });
}
