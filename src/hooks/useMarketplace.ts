/**
 * TanStack Query hooks for the marketplace.
 *
 * useListings  — filtered list page (server-side filter, client-side sort)
 * useListing   — single listing by slug (detail page)
 * useFarmerListings — all active listings by a farmer
 * useMyListings     — authenticated farmer's own listings
 * usePriceSuggestion — AI price suggestion for the sell form
 */
import { useQuery } from "@tanstack/react-query";

import {
  fetchFarmerListings,
  fetchListingBySlug,
  fetchListings,
  fetchMyListings,
  fetchPriceSuggestion,
  type ListingParams,
} from "@/api/listings.api";
import { useAuthStore } from "@/store/auth-store";
import { useMarketplaceStore } from "@/store/marketplace-store";
import { Product } from "@/types";

// ── Query key factory ──────────────────────────────────────────────────────
export const listingKeys = {
  all: () => ["listings"] as const,
  list: (p: ListingParams) => ["listings", "list", p] as const,
  detail: (slug: string) => ["listings", "detail", slug] as const,
  farmer: (farmerId: string) => ["listings", "farmer", farmerId] as const,
  mine: (status?: string) => ["listings", "mine", status] as const,
  price: (cat: string, unit: string, district?: string) =>
    ["listings", "price", cat, unit, district] as const,
  reviews: (id: string, page = 1) => [...listingKeys.all(), "reviews", id, page] as const,
};

// ── useListings ────────────────────────────────────────────────────────────
/**
 * Reads filter state from the Zustand store, sends it to the backend as
 * query params, and returns the raw list so the page component can sort
 * client-side without an extra round-trip.
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
    limit: 60,
  };

  return useQuery<Product[]>({
    queryKey: listingKeys.list(params),
    queryFn: () => fetchListings(params, token),
    staleTime: 1000 * 60 * 2, // 2 min — mirrors Redis TTL
    placeholderData: (prev) => prev, // no loading flash on filter change
  });
}

// ── useListing ─────────────────────────────────────────────────────────────
export function useListing(slug: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery<Product>({
    queryKey: listingKeys.detail(slug),
    queryFn: () => fetchListingBySlug(slug, token),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

// ── useFarmerListings ──────────────────────────────────────────────────────
export function useFarmerListings(farmerId: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery<Product[]>({
    queryKey: listingKeys.farmer(farmerId),
    queryFn: () => fetchFarmerListings(farmerId, token),
    enabled: !!farmerId,
    staleTime: 1000 * 60 * 5,
  });
}

// ── useMyListings ──────────────────────────────────────────────────────────
export function useMyListings(status?: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery<Product[]>({
    queryKey: listingKeys.mine(status),
    queryFn: () => fetchMyListings(token!, status),
    enabled: !!token,
    staleTime: 1000 * 30,
  });
}

// ── usePriceSuggestion ─────────────────────────────────────────────────────
export function usePriceSuggestion(category: string, unit: string, district?: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: listingKeys.price(category, unit, district),
    queryFn: () => fetchPriceSuggestion(category, unit, district, token),
    enabled: !!(category && unit),
    staleTime: 1000 * 60 * 10,
  });
}
