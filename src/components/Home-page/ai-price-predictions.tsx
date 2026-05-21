import { ChartNoAxesColumnDecreasing } from "lucide-react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { CROP_DISPLAY, fmtUGX, mapToMLCrop, ML_CROPS } from "@/lib/prices-utils";
import { useAuthStore } from "@/store/auth-store";
import { PricePrediction as PricePredictionData } from "@/types";

import { PricePredictionCard } from "./predictions-card";

// ── nearest reference market by district ─────────────────────────────────────

function nearestMarket(district: string | undefined): string {
  const d = (district ?? "").toLowerCase();
  if (d.includes("gulu") || d.includes("kitgum") || d.includes("pader")) return "Gulu";
  if (d.includes("lira") || d.includes("otuke") || d.includes("amolatar")) return "Lira";
  if (d.includes("mbarara") || d.includes("bushenyi") || d.includes("kabale")) return "Mbarara";
  if (d.includes("mbale") || d.includes("jinja") || d.includes("tororo") || d.includes("soroti"))
    return "Mbale";
  if (d.includes("masaka") || d.includes("ssembabule") || d.includes("lwengo")) return "Masaka";
  return "Kisenyi_Kampala";
}

// ── fetch one card's data from /ml/price/predict ──────────────────────────────

async function fetchCropCard(cropKey: string, market: string): Promise<PricePredictionData | null> {
  try {
    const res = await fetch("/ml/price/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop: cropKey, market, weeks_ahead: 4 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const preds = data.predictions;
    if (!preds || preds.length < 2) return null;

    const curr = preds[0].predicted_price_ugx;
    const next = preds[1].predicted_price_ugx;
    const spread = preds[0].upper_bound - preds[0].lower_bound;
    const confidence = Math.round(Math.max(30, Math.min(95, 100 - (spread / curr) * 50)));

    return {
      crop: CROP_DISPLAY[cropKey] ?? cropKey,
      current: fmtUGX(curr) + "/kg",
      predicted: fmtUGX(next) + "/kg",
      trend: next >= curr ? "up" : "down",
      confidence,
    };
  } catch {
    return null;
  }
}

// ── skeleton strip ─────────────────────────────────────────────────────────────

function PriceSkeleton() {
  return (
    <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar my-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-38 h-28 shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

const PricePrediction = () => {
  const { user } = useAuthStore();
  const isFarmer = useAuthStore((s) => s.isFarmer());
  const isBuyer = useAuthStore((s) => s.isBuyer());

  const [cards, setCards] = useState<PricePredictionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const market = nearestMarket(user.district);

    const keys: string[] = [];
    const seen = new Set<string>();

    const addKey = (k: string) => {
      if (!seen.has(k)) {
        seen.add(k);
        keys.push(k);
      }
    };

    if (isFarmer && user.specialties?.length) {
      // Farmer: personalised — show their specialties only
      user.specialties.forEach((s) => {
        const k = mapToMLCrop(s);
        if (k) addKey(k);
      });
    }

    if (isBuyer) {
      // Buyer: show all available ML crop prices (market overview)
      ML_CROPS.forEach(addKey);
    }

    // Fallback (unauthenticated or no profile data)
    if (keys.length === 0) {
      ["maize_grain", "yellow_beans", "tomatoes", "matoke"].forEach(addKey);
    }

    Promise.all(keys.map((k) => fetchCropCard(k, market)))
      .then((results) => setCards(results.filter(Boolean) as PricePredictionData[]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const emptyHint =
    isFarmer && !isBuyer
      ? "Add specialties in your profile to see your crop price predictions."
      : "Price predictions are temporarily unavailable.";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-2">
          <ChartNoAxesColumnDecreasing size={13} className="text-foreground" />
          <h3 className="text-foreground font-semibold text-sm">Price Predictions</h3>
        </div>
      </div>

      {loading ? (
        <PriceSkeleton />
      ) : cards.length === 0 ? (
        <p className="text-xs text-muted-foreground py-3 my-1">{emptyHint}</p>
      ) : (
        <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar my-3">
          {cards.map((p, i) => (
            <PricePredictionCard key={i} p={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PricePrediction;
