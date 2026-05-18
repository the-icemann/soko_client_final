import { useEffect, useState } from "react";
import { AlertTriangle, ShoppingBasket, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CROP_DISPLAY,
  MARKET_DISPLAY,
  ML_CROPS,
  fmtUGX,
} from "@/lib/prices-utils";
import { usePricesStore, type BuyerCropData } from "@/store/usePricesStore";
import { useAuthStore } from "@/store/auth-store";

// ── Trend badge ───────────────────────────────────────────────────────────────

function PriceTrend({ data }: { data: BuyerCropData }) {
  // Compare first and last weekly prediction across best-buy market
  const best = data.markets.find((m) => m.market === data.bestBuyMarket);
  if (!best || best.weeklyPredictions.length < 2) return null;

  const first = best.weeklyPredictions[0].predicted_price_ugx;
  const last  = best.weeklyPredictions[best.weeklyPredictions.length - 1].predicted_price_ugx;
  const pct   = (((last - first) / first) * 100).toFixed(1);
  const up    = last >= first;

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${up ? "text-red-500" : "text-green-600"}`}>
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {up ? "+" : ""}{pct}% (4 wk)
    </span>
  );
}

// ── Individual commodity card ─────────────────────────────────────────────────

function CropCard({ data }: { data: BuyerCropData }) {
  const [expanded, setExpanded] = useState(false);

  if (data.error) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader className="pb-1">
          <CardTitle className="text-sm font-semibold">{data.cropLabel}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground flex items-center gap-1.5 pb-4">
          <AlertTriangle className="size-3 shrink-0" />
          {data.error}
        </CardContent>
      </Card>
    );
  }

  const sorted = [...data.markets].sort((a, b) => a.currentPrice - b.currentPrice);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold">{data.cropLabel}</CardTitle>
          <PriceTrend data={data} />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-primary">{fmtUGX(data.lowestPrice)}</span>
          <span className="text-xs text-muted-foreground">— {fmtUGX(data.highestPrice)} / kg</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Best buy: <span className="font-semibold text-foreground">{MARKET_DISPLAY[data.bestBuyMarket] ?? data.bestBuyMarket}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-1.5">
        {/* Market breakdown */}
        <div className="rounded-md border border-border/60 overflow-hidden text-xs">
          {sorted.map((m, i) => (
            <div
              key={m.market}
              className={`flex items-center justify-between px-2.5 py-1.5 border-t border-border/50 first:border-0 ${
                i === 0 ? "bg-green-50/60 dark:bg-green-950/20" : ""
              }`}
            >
              <span className="text-muted-foreground">{MARKET_DISPLAY[m.market] ?? m.market}</span>
              <div className="text-right">
                <span className={`font-semibold ${i === 0 ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
                  {fmtUGX(m.currentPrice)}
                </span>
                <span className="text-muted-foreground ml-1">/kg</span>
              </div>
            </div>
          ))}
        </div>

        {/* 4-week outlook for best-buy market */}
        {expanded && (
          <div className="space-y-1 pt-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">
              4-Week Forecast · {MARKET_DISPLAY[data.bestBuyMarket] ?? data.bestBuyMarket}
            </p>
            <div className="rounded-md border border-border/60 overflow-hidden text-xs">
              {(data.markets.find((m) => m.market === data.bestBuyMarket)?.weeklyPredictions ?? []).map((p) => (
                <div
                  key={p.date}
                  className="flex items-center justify-between px-2.5 py-1.5 border-t border-border/50 first:border-0"
                >
                  <span className="text-muted-foreground">
                    {new Date(p.date).toLocaleDateString("en-UG", { day: "numeric", month: "short" })}
                  </span>
                  <span className="font-semibold">
                    {fmtUGX(p.predicted_price_ugx)}
                    <span className="text-muted-foreground font-normal text-[10px] ml-1">
                      ({fmtUGX(p.lower_bound)}–{fmtUGX(p.upper_bound)})
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-[10px] text-primary font-semibold hover:underline mt-1"
        >
          {expanded ? "Hide forecast ↑" : "Show 4-week forecast ↓"}
        </button>
      </CardContent>
    </Card>
  );
}

// ── Category filter ───────────────────────────────────────────────────────────

const CATEGORY_GROUPS: Record<string, string[]> = {
  All:        [...ML_CROPS],
  Grains:     ["maize_grain", "sorghum", "millet"],
  Legumes:    ["yellow_beans"],
  Vegetables: ["tomatoes", "irish_potatoes"],
  Starchy:    ["matoke", "cassava_chips"],
};

function CategoryFilter({
  active,
  onChange,
}: {
  active: string;
  onChange: (c: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.keys(CATEGORY_GROUPS).map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            active === cat
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/50"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BuyerSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-52 rounded-xl" />
      ))}
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export function BuyerPricesView() {
  const { user } = useAuthStore();
  const { buyerData, isLoadingBuyer, fetchBuyerData } = usePricesStore();
  const [category, setCategory] = useState("All");

  useEffect(() => {
    if (buyerData.length > 0) return;
    fetchBuyerData(); // always show all 8 ML crops; category tabs handle filtering
  }, []);

  const shown = buyerData.filter((d) =>
    category === "All" ? true : (CATEGORY_GROUPS[category] ?? []).includes(d.cropKey)
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-0.5">All commodities · current week predictions</h3>
        <p className="text-xs text-muted-foreground">
          Wholesale prices across 6 Ugandan markets. Updated daily.
        </p>
      </div>

      <CategoryFilter active={category} onChange={setCategory} />

      {isLoadingBuyer ? (
        <BuyerSkeleton />
      ) : shown.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
              <ShoppingBasket className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No data available for this category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((d) => (
            <CropCard key={d.cropKey} data={d} />
          ))}
        </div>
      )}
    </div>
  );
}
