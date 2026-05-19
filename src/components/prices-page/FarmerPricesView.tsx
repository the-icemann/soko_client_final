import {
  AlertTriangle,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Leaf,
  MapPin,
  TrendingDown,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  confidenceMeta,
  CROP_DISPLAY,
  fmtUGX,
  getDistrictCoords,
  mapToMLCrop,
  MARKET_DISPLAY,
  signalMeta,
} from "@/lib/prices-utils";
import { useAuthStore } from "@/store/auth-store";
import { type FarmerCropInsight, usePricesStore } from "@/store/usePricesStore";

interface ListingSnap {
  id: string;
  name: string;
  category: string;
  tags: string[];
  qty: number;
}

// ── Crop tab selector ─────────────────────────────────────────────────────────

function CropTabs({
  insights,
  activeKey,
  onSelect,
}: {
  insights: FarmerCropInsight[];
  activeKey: string;
  onSelect: (k: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {insights.map((ins) => (
        <button
          key={ins.cropKey}
          onClick={() => onSelect(ins.cropKey)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            activeKey === ins.cropKey
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:border-primary/50"
          }`}
        >
          {ins.cropLabel}
          {ins.isFallback && <span className="ml-1 opacity-60">?</span>}
        </button>
      ))}
    </div>
  );
}

// ── Fallback card ─────────────────────────────────────────────────────────────

function FallbackCard({ insight }: { insight: FarmerCropInsight }) {
  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
          <AlertTriangle className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-semibold">No price model for "{insight.listingName}"</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Our ML models cover: maize, beans, potatoes, tomatoes, matoke, cassava, sorghum, and
            millet. Price intelligence for other crops is coming soon.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Top summary cards ─────────────────────────────────────────────────────────

function SellSignalCard({ insight }: { insight: FarmerCropInsight }) {
  const top = insight.rankedMarkets[0];
  if (!top) return null;
  const sig = signalMeta(top.signal);
  const conf = confidenceMeta(top.confidence);

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          Sell Signal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${sig.bg} ${sig.color}`}
        >
          {sig.label}
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">{top.signal_reason}</p>
        <p className={`text-[10px] font-medium ${conf.color}`}>Confidence: {conf.label}</p>
      </CardContent>
    </Card>
  );
}

function BestMarketCard({ insight }: { insight: FarmerCropInsight }) {
  const top = insight.rankedMarkets[0];
  if (!top) return null;

  return (
    <Card className="flex-1 min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="size-4 text-primary" />
          Best Market
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <p className="text-base font-bold">{MARKET_DISPLAY[top.market] ?? top.market}</p>
        <div className="text-xs space-y-0.5 text-muted-foreground">
          <div className="flex justify-between">
            <span>Predicted price</span>
            <span className="font-semibold text-foreground">
              {fmtUGX(top.predicted_price_ugx)}/kg
            </span>
          </div>
          <div className="flex justify-between">
            <span>Transport ({top.transport_mode.replace("_", " ")})</span>
            <span className="text-red-500">-{fmtUGX(top.transport_cost_per_kg_ugx)}/kg</span>
          </div>
          <div className="flex justify-between border-t border-border pt-1 mt-1">
            <span className="font-semibold text-foreground">Net value/kg</span>
            <span className="font-bold text-green-600">{fmtUGX(top.net_value_per_kg_ugx)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Distance</span>
            <span>{top.distance_km.toFixed(0)} km</span>
          </div>
        </div>
        {insight.tierMessage && (
          <p className="text-[10px] text-muted-foreground italic mt-1">{insight.tierMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Ranked market table ───────────────────────────────────────────────────────

function MarketRankTable({ insight }: { insight: FarmerCropInsight }) {
  const [expanded, setExpanded] = useState(false);
  const markets = insight.rankedMarkets;
  const shown = expanded ? markets : markets.slice(0, 3);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <Truck className="size-3" /> All Markets Ranked by Net Value
        </h4>
        {markets.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="size-3 mr-1" />
                {markets.length - 3} more
              </>
            )}
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden text-xs">
        {/* Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-3 py-2 bg-muted/40 text-muted-foreground font-semibold text-[10px] uppercase tracking-wide">
          <span>Market</span>
          <span className="text-right">Dist.</span>
          <span className="text-right">Transport</span>
          <span className="text-right">Net/kg</span>
          <span className="text-right">Signal</span>
        </div>

        {shown.map((m, i) => {
          const sig = signalMeta(m.signal);
          return (
            <div
              key={m.market}
              className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-3 py-2.5 items-center border-t border-border/50 ${
                i === 0 ? "bg-green-50/50 dark:bg-green-950/20" : ""
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                {i === 0 && <BadgeCheck className="size-3 text-green-600 shrink-0" />}
                <span className="truncate font-medium">{MARKET_DISPLAY[m.market] ?? m.market}</span>
              </div>
              <span className="text-right text-muted-foreground">
                {m.distance_km.toFixed(0)} km
              </span>
              <span className="text-right text-red-500">
                -{fmtUGX(m.transport_cost_per_kg_ugx)}
              </span>
              <span className={`text-right font-semibold ${i === 0 ? "text-green-600" : ""}`}>
                {fmtUGX(m.net_value_per_kg_ugx)}
              </span>
              <span className={`text-right text-[10px] font-bold ${sig.color}`}>{sig.label}</span>
            </div>
          );
        })}
      </div>

      {insight.transportDisclaimer && (
        <p className="text-[10px] text-muted-foreground flex items-start gap-1">
          <Info className="size-3 shrink-0 mt-0.5" />
          {insight.transportDisclaimer}
        </p>
      )}
    </div>
  );
}

// ── Main insight panel ────────────────────────────────────────────────────────

function InsightPanel({ insight }: { insight: FarmerCropInsight }) {
  if (insight.isFallback) return <FallbackCard insight={insight} />;

  if (insight.error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
          <AlertTriangle className="size-4 text-destructive" />
          {insight.error}
        </CardContent>
      </Card>
    );
  }

  if (insight.rankedMarkets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-sm text-center text-muted-foreground">
          No market route data available yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tier badge */}
      {insight.tier > 1 && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-lg">
          <AlertTriangle className="size-3 shrink-0" />
          <span>
            <strong>Limited data (Tier {insight.tier}):</strong>{" "}
            {insight.tier === 2
              ? "Partial coverage — estimates based on similar crops."
              : "Unknown crop — route uses market average prices."}
          </span>
        </div>
      )}

      {/* Summary cards */}
      <div className="flex gap-3">
        <SellSignalCard insight={insight} />
        <BestMarketCard insight={insight} />
      </div>

      {/* Full ranking table */}
      <MarketRankTable insight={insight} />
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function FarmerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-32 flex-1 rounded-xl" />
        <Skeleton className="h-32 flex-1 rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────────────

export function FarmerPricesView() {
  const { user, token } = useAuthStore();
  const { farmerInsights, isLoadingFarmer, fetchFarmerInsights } = usePricesStore();
  const [activeKey, setActiveKey] = useState<string>("");
  const [listingsLoading, setListingsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (farmerInsights.length > 0) {
      if (!activeKey) setActiveKey(farmerInsights[0].cropKey);
      return;
    }

    const buildInsights = async () => {
      setListingsLoading(true);

      // Determine crops from specialties, then fall back to listings
      let cropsInput: Array<{
        key: string;
        label: string;
        listingName: string;
        quantityKg: number;
        isFallback: boolean;
      }> = [];

      // Try specialties first
      if (user.specialties && user.specialties.length > 0) {
        cropsInput = user.specialties.map((s) => {
          const key = mapToMLCrop(s);
          return {
            key: key ?? s.toLowerCase().replace(/\s+/g, "_"),
            label: key ? (CROP_DISPLAY[key] ?? s) : s,
            listingName: s,
            quantityKg: 500,
            isFallback: !key,
          };
        });
      }

      // Augment specialties with actual listing data (qty override) — never replace
      try {
        const listings = await api.get<ListingSnap[]>("listings/me", token);
        if (listings.length > 0) {
          const byKey = new Map(cropsInput.map((c) => [c.key, c]));

          for (const l of listings) {
            const combined = `${l.name} ${(l.tags ?? []).join(" ")}`;
            const key = mapToMLCrop(combined) ?? mapToMLCrop(l.category);
            if (!key) continue;

            if (byKey.has(key)) {
              // Update qty from the actual listing, keep the specialty entry
              const entry = byKey.get(key)!;
              if (l.qty > 0) entry.quantityKg = l.qty;
            } else {
              // Listing crop not in specialties — add it
              const entry = {
                key,
                label: CROP_DISPLAY[key] ?? l.name,
                listingName: l.name,
                quantityKg: l.qty > 0 ? l.qty : 500,
                isFallback: false,
              };
              cropsInput.push(entry);
              byKey.set(key, entry);
            }
          }
        }
      } catch {
        // listings unavailable — use specialties already set
      }

      setListingsLoading(false);

      if (cropsInput.length === 0) {
        setListingsLoading(false);
        return;
      }

      const [lat, lng] = getDistrictCoords(user.district);
      await fetchFarmerInsights(user.id, lat, lng, cropsInput);
      setActiveKey(cropsInput[0].key);
    };

    buildInsights();
  }, [user]);

  // Keep activeKey in sync when insights arrive
  useEffect(() => {
    if (farmerInsights.length > 0 && !activeKey) {
      setActiveKey(farmerInsights[0].cropKey);
    }
  }, [farmerInsights]);

  const loading = listingsLoading || isLoadingFarmer;

  if (loading) return <FarmerSkeleton />;

  if (farmerInsights.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
            <Leaf className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">No crops found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Add your specialties in your profile or create a listing to get personalised market
              intelligence.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const active = farmerInsights.find((i) => i.cropKey === activeKey) ?? farmerInsights[0];

  return (
    <div className="space-y-4">
      <CropTabs insights={farmerInsights} activeKey={active.cropKey} onSelect={setActiveKey} />
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <MapPin className="size-3" />
        <span>
          Based on your location: <strong>{user?.district ?? "Uganda"}</strong>
        </span>
        {active.quantityKg > 0 && (
          <>
            <span>·</span>
            <span>
              Quantity: <strong>{active.quantityKg.toFixed(0)} kg</strong>
            </span>
          </>
        )}
      </div>
      <InsightPanel insight={active} />
    </div>
  );
}
