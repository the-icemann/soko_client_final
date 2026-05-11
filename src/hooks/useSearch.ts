import { useQuery } from "@tanstack/react-query";

import { searchFarmers, searchProducts } from "@/api/search.api";
import { useAuthStore } from "@/store/auth-store";
import { useSearchStore } from "@/store/search-store";

const STALE = 1000 * 30; // 30 s — search results go stale quickly

export function useProductSearch() {
  const query = useSearchStore((s) => s.query);
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["search", "products", query],
    queryFn: () => searchProducts(query, token),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}

export function useFarmerSearch() {
  const query = useSearchStore((s) => s.query);
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["search", "farmers", query],
    queryFn: () => searchFarmers(query, undefined, token),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}
