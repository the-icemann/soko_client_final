import { LayoutGrid, List, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, UGANDA_DISTRICTS as districts } from "@/constants/districts";
import { cn } from "@/lib/utils";
import { type SortOption, useMarketplaceStore, type ViewMode } from "@/store/marketplace-store";

const DEBOUNCE_MS = 350;

export function MarketplaceFilters() {
  const {
    search,
    setSearch,
    district,
    setDistrict,
    sort,
    setSort,
    viewMode,
    setViewMode,
    activeCategory,
    setActiveCategory,
    resetFilters,
  } = useMarketplaceStore();

  // Local value so keystrokes feel instant; debounced write goes to the store
  // (and therefore triggers an API refetch via useListings)
  const [localSearch, setLocalSearch] = useState(search);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSearch(localSearch.trim()), DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [localSearch, setSearch]);

  // Stay in sync if the store is reset externally (e.g. "Clear filters")
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const hasActiveFilters = search !== "" || district !== "All" || activeCategory !== "All";

  return (
    <Card className="border border-border bg-card shadow-sm mb-5">
      <CardContent className="p-4 space-y-4">
        {/* Row 1: search · district · sort · view toggle */}
        <div className="flex gap-3 flex-wrap items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search produce, farmers…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 pr-9 h-10"
            />
            {localSearch && (
              <button
                onClick={() => {
                  setLocalSearch("");
                  setSearch("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* District */}
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="All">All Districts</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-45 h-10">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>

          {/* Grid / List toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
            {(["grid", "list"] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                aria-label={`${v} view`}
                className={cn(
                  "px-3.5 h-10 flex items-center justify-center transition-colors duration-150",
                  viewMode === v
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-accent"
                )}
              >
                {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </button>
            ))}
          </div>

          {/* Clear filters — only visible when something is active */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors shrink-0"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Row 2: Category pill tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={cn(
                "whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all duration-150 shrink-0",
                activeCategory === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
