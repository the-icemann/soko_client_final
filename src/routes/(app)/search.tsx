import { createFileRoute } from "@tanstack/react-router";
import { MapPin, SlidersHorizontal, Star, TrendingUp, Users, Wheat } from "lucide-react";

import { ProductCard } from "@/components/common/product-card";
import { EmptyState } from "@/components/search-page/empty-state";
import { FarmerResultCard } from "@/components/search-page/farmer-result-card";
import { ResultsCount } from "@/components/search-page/results-count";
import { SearchHeader } from "@/components/search-page/search-header";
import { TrendingSearches } from "@/components/search-page/trending-searches";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFarmerSearch, useProductSearch } from "@/hooks/useSearch";
import { useSearchStore } from "@/store/search-store";

export const Route = createFileRoute("/(app)/search")({
  component: RouteComponent,
});

// ── Sidebar ───────────────────────────────────────────────────────────────────

const TRENDING = [
  "Tomatoes",
  "Organic Maize",
  "Avocado",
  "Sesame",
  "Grace Auma",
  "Mbarara Farmers",
];
const DISTRICTS = ["Kampala", "Wakiso", "Gulu", "Mbarara", "Jinja", "Mbale"];

function SearchSidebar({ query, onSelect }: { query: string; onSelect: (q: string) => void }) {
  return (
    <aside className="hidden md:flex flex-col gap-4 w-64 lg:w-72 shrink-0">
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
            <TrendingUp className="w-4 h-4 text-primary" /> Trending Searches
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col gap-1">
            {TRENDING.map((item) => (
              <button
                key={item}
                onClick={() => onSelect(item)}
                className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors hover:bg-primary/10 hover:text-primary ${
                  query === item
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
            <MapPin className="w-4 h-4 text-primary" /> Filter by District
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5">
            {DISTRICTS.map((d) => (
              <Badge
                key={d}
                variant="outline"
                onClick={() => onSelect(d)}
                className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              >
                {d}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
            <Star className="w-4 h-4 text-primary" /> Platform Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex flex-col gap-3">
          {[
            { icon: <Users className="w-3.5 h-3.5" />, label: "Verified Farmers", value: "1,240+" },
            { icon: <Wheat className="w-3.5 h-3.5" />, label: "Products Listed", value: "5,800+" },
            { icon: <MapPin className="w-3.5 h-3.5" />, label: "Districts Covered", value: "86" },
          ].map(({ icon, label, value }, i, arr) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  {icon} {label}
                </span>
                <span className="font-semibold text-foreground">{value}</span>
              </div>
              {i < arr.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </aside>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-4 flex gap-3 animate-pulse">
      <div className="size-12 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-2/3" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border/40 bg-card overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-muted" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Route component ───────────────────────────────────────────────────────────

function RouteComponent() {
  const { query, activeTab, setQuery, setActiveTab } = useSearchStore();

  const { data: farmers = [], isFetching: loadingFarmers } = useFarmerSearch();
  const { data: products = [], isFetching: loadingProducts } = useProductSearch();

  const activeCount = activeTab === "farmers" ? farmers.length : products.length;

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader
        query={query}
        activeTab={activeTab}
        onQueryChange={setQuery}
        onTabChange={setActiveTab}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <div className="flex gap-6 items-start">
          <SearchSidebar query={query} onSelect={setQuery} />

          <main className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Desktop tab bar */}
              <div className="hidden md:flex items-center justify-between mb-4">
                <TabsList className="bg-muted/50 border border-border/50 p-1 h-10">
                  <TabsTrigger
                    value="farmers"
                    className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Farmers
                    {activeTab === "farmers" && (
                      <Badge
                        variant="secondary"
                        className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-primary-foreground/20 text-primary-foreground"
                      >
                        {farmers.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="produce"
                    className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
                  >
                    <Wheat className="w-3.5 h-3.5" />
                    Produce
                    {activeTab === "produce" && (
                      <Badge
                        variant="secondary"
                        className="ml-1 text-[10px] px-1.5 py-0 h-4 bg-primary-foreground/20 text-primary-foreground"
                      >
                        {products.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <button className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border/50 rounded-lg px-3 py-1.5 transition-colors hover:bg-muted/50">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
                </button>
              </div>

              {/* Trending — mobile only */}
              <div className="md:hidden">{!query && <TrendingSearches onSelect={setQuery} />}</div>

              <ResultsCount count={activeCount} query={query} />

              {/* Farmers tab */}
              <TabsContent value="farmers" className="mt-0">
                {loadingFarmers ? (
                  <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                ) : farmers.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3">
                    {farmers.map((f) => (
                      <FarmerResultCard key={f.id} farmer={f} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Produce tab */}
              <TabsContent value="produce" className="mt-0">
                {loadingProducts ? (
                  <GridSkeleton />
                ) : products.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>

      <div className="h-24 md:hidden" />
    </div>
  );
}
