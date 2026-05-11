import { create } from "zustand";

export type ViewMode = "grid" | "list";
export type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

interface MarketplaceState {
  // API filters
  search: string;
  district: string;
  activeCategory: string;

  // UI state
  sort: SortOption;
  viewMode: ViewMode;

  // Extra UI filters
  priceRange: [number, number];
  cartCount: number;

  // actions
  setSearch: (v: string) => void;
  setDistrict: (v: string) => void;
  setActiveCategory: (v: string) => void;
  setSort: (v: SortOption) => void;
  setViewMode: (v: ViewMode) => void;

  setCategory: (v: string) => void;
  setPriceRange: (v: [number, number]) => void;
  setCartCount: (v: number) => void;

  resetFilters: () => void;
}

const DEFAULTS = {
  search: "",
  district: "All",
  activeCategory: "All",
  sort: "newest" as SortOption,
  viewMode: "grid" as ViewMode,

  priceRange: [0, 500000] as [number, number],
  cartCount: 0,
};

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  ...DEFAULTS,

  setSearch: (search) => set({ search }),
  setDistrict: (district) => set({ district }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSort: (sort) => set({ sort }),
  setViewMode: (viewMode) => set({ viewMode }),

  setCategory: (activeCategory) => set({ activeCategory }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setCartCount: (cartCount) => set({ cartCount }),

  resetFilters: () =>
    set((s) => ({
      search: DEFAULTS.search,
      district: DEFAULTS.district,
      activeCategory: DEFAULTS.activeCategory,
      sort: DEFAULTS.sort,
      priceRange: DEFAULTS.priceRange,
      viewMode: s.viewMode,
      cartCount: s.cartCount, // preserve cart
    })),
}));
