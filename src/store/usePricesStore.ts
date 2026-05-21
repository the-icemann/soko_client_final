import { create } from "zustand";

import { api } from "@/api/api";
import { CROP_DISPLAY, ML_CROPS, ML_MARKETS, type MLCrop } from "@/lib/prices-utils";
import { useAuthStore } from "@/store/auth-store";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface WeeklyPrediction {
  date: string;
  predicted_price_ugx: number;
  lower_bound: number;
  upper_bound: number;
}

export interface MarketResult {
  market: string;
  distance_km: number;
  transport_mode: string;
  transport_cost_per_kg_ugx: number;
  predicted_price_ugx: number;
  net_value_per_kg_ugx: number;
  total_net_value_ugx: number;
  signal: string;
  signal_reason: string;
  confidence: string;
}

export interface FarmerCropInsight {
  cropKey: string;
  cropLabel: string;
  listingName: string;
  quantityKg: number | null; // null = specialty-only, no listing quantity known
  tier: number;
  tierMessage: string | null;
  rankedMarkets: MarketResult[];
  transportDisclaimer: string;
  isFallback: boolean;
  error: string | null;
}

export interface BuyerCropData {
  cropKey: string;
  cropLabel: string;
  markets: Array<{
    market: string;
    currentPrice: number;
    lowerBound: number;
    upperBound: number;
    weeklyPredictions: WeeklyPrediction[];
  }>;
  bestBuyMarket: string;
  lowestPrice: number;
  highestPrice: number;
  error: string | null;
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface PricesStore {
  farmerInsights: FarmerCropInsight[];
  isLoadingFarmer: boolean;

  buyerData: BuyerCropData[];
  isLoadingBuyer: boolean;

  fetchFarmerInsights: (
    userId: string,
    farmerLat: number,
    farmerLng: number,
    crops: Array<{
      key: string;
      label: string;
      listingName: string;
      quantityKg: number | null;
      isFallback: boolean;
    }>
  ) => Promise<void>;

  fetchBuyerData: (cropKeys?: string[]) => Promise<void>;

  reset: () => void;
}

// ── Helper: call /ml/location/route ──────────────────────────────────────────

async function fetchRoute(
  token: string | null,
  userId: string,
  lat: number,
  lng: number,
  crop: string,
  qty: number | null
): Promise<{
  tier: number;
  tier_message: string | null;
  ranked_markets: MarketResult[];
  transport_disclaimer: string;
} | null> {
  try {
    const res = await fetch("/ml/location/route", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        farmer_id: userId,
        farmer_lat: lat,
        farmer_lng: lng,
        crop,
        ...(qty !== null ? { quantity_kg: qty } : {}),
        max_distance_km: 300,
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Helper: call /ml/price/predict ───────────────────────────────────────────

async function fetchPredict(
  crop: string,
  market: string,
  weeksAhead = 8
): Promise<WeeklyPrediction[] | null> {
  try {
    const res = await fetch("/ml/price/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop, market, weeks_ahead: weeksAhead }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.predictions ?? null;
  } catch {
    return null;
  }
}

// ── Store implementation ──────────────────────────────────────────────────────

export const usePricesStore = create<PricesStore>((set, get) => ({
  farmerInsights: [],
  isLoadingFarmer: false,
  buyerData: [],
  isLoadingBuyer: false,

  fetchFarmerInsights: async (userId, farmerLat, farmerLng, crops) => {
    if (get().isLoadingFarmer) return;
    set({ isLoadingFarmer: true });

    const token = useAuthStore.getState().token;

    try {
      const insights = await Promise.all(
        crops.map(async (c): Promise<FarmerCropInsight> => {
          if (c.isFallback) {
            return {
              cropKey: c.key,
              cropLabel: c.label,
              listingName: c.listingName,
              quantityKg: c.quantityKg,
              tier: 3,
              tierMessage: "No price model available for this crop.",
              rankedMarkets: [],
              transportDisclaimer: "",
              isFallback: true,
              error: null,
            };
          }

          const route = await fetchRoute(token, userId, farmerLat, farmerLng, c.key, c.quantityKg);

          if (!route) {
            return {
              cropKey: c.key,
              cropLabel: c.label,
              listingName: c.listingName,
              quantityKg: c.quantityKg,
              tier: 1,
              tierMessage: null,
              rankedMarkets: [],
              transportDisclaimer: "",
              isFallback: false,
              error: "Could not reach the market routing service. Ensure the ML stack is running.",
            };
          }

          return {
            cropKey: c.key,
            cropLabel: c.label,
            listingName: c.listingName,
            quantityKg: c.quantityKg,
            tier: route.tier,
            tierMessage: route.tier_message ?? null,
            rankedMarkets: route.ranked_markets ?? [],
            transportDisclaimer: route.transport_disclaimer ?? "",
            isFallback: false,
            error: null,
          };
        })
      );
      set({ farmerInsights: insights });
    } finally {
      set({ isLoadingFarmer: false });
    }
  },

  fetchBuyerData: async (cropKeys) => {
    if (get().isLoadingBuyer) return;
    set({ isLoadingBuyer: true });

    const targets = (cropKeys && cropKeys.length > 0 ? cropKeys : [...ML_CROPS]) as MLCrop[];

    const results = await Promise.all(
      targets.map(async (cropKey): Promise<BuyerCropData> => {
        const { CROP_DISPLAY } = await import("@/lib/prices-utils");

        const marketResults = await Promise.all(
          ML_MARKETS.map(async (market) => {
            const predictions = await fetchPredict(cropKey, market, 4);
            return { market, predictions };
          })
        );

        const markets = marketResults
          .filter((m) => m.predictions && m.predictions.length > 0)
          .map((m) => ({
            market: m.market,
            currentPrice: m.predictions![0].predicted_price_ugx,
            lowerBound: m.predictions![0].lower_bound,
            upperBound: m.predictions![0].upper_bound,
            weeklyPredictions: m.predictions!,
          }));

        if (markets.length === 0) {
          return {
            cropKey,
            cropLabel: CROP_DISPLAY[cropKey] ?? cropKey,
            markets: [],
            bestBuyMarket: "-",
            lowestPrice: 0,
            highestPrice: 0,
            error: "No market data available for this commodity.",
          };
        }

        const sorted = [...markets].sort((a, b) => a.currentPrice - b.currentPrice);
        const lowestPrice = sorted[0].currentPrice;
        const highestPrice = sorted[sorted.length - 1].currentPrice;
        const bestBuyMarket = sorted[0].market;

        return {
          cropKey,
          cropLabel: CROP_DISPLAY[cropKey] ?? cropKey,
          markets,
          bestBuyMarket,
          lowestPrice,
          highestPrice,
          error: null,
        };
      })
    );

    set({ buyerData: results, isLoadingBuyer: false });
  },

  reset: () =>
    set({ farmerInsights: [], isLoadingFarmer: false, buyerData: [], isLoadingBuyer: false }),
}));
