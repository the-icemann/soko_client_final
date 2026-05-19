import { Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CROP_DISPLAY, fmtUGX, mapToMLCrop, ML_CROPS } from "@/lib/prices-utils";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CropSnap {
  cropKey: string;
  cropLabel: string;
  currentPrice: number;
  price2wk: number;
  pctChange: number;
  confidence: number;
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function fetchSnap(cropKey: string): Promise<CropSnap | null> {
  try {
    const res = await fetch("/ml/price/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop: cropKey, market: "Kisenyi_Kampala", weeks_ahead: 4 }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const p = data.predictions;
    if (!p || p.length < 3) return null;

    const curr = p[0].predicted_price_ugx;
    const wk2 = p[2].predicted_price_ugx;
    const spread = p[0].upper_bound - p[0].lower_bound;

    return {
      cropKey,
      cropLabel: CROP_DISPLAY[cropKey] ?? cropKey,
      currentPrice: curr,
      price2wk: wk2,
      pctChange: Math.round(Math.abs(((wk2 - curr) / curr) * 100) * 10) / 10,
      confidence: Math.round(Math.max(30, Math.min(95, 100 - (spread / curr) * 50))),
    };
  } catch {
    return null;
  }
}

// ── Pick crop candidates based on role ────────────────────────────────────────

function pickCandidates(
  isFarmer: boolean,
  specialties: string[] | undefined
): { keys: string[]; isPersonalised: boolean } {
  if (isFarmer && specialties?.length) {
    const mapped = specialties.map(mapToMLCrop).filter((k) => k !== null) as string[];
    if (mapped.length > 0) {
      const deduped = Array.from(new Set(mapped));
      return { keys: deduped, isPersonalised: true };
    }
    // Farmer has specialties but none map to ML crops — signal "no coverage"
    return { keys: [], isPersonalised: true };
  }
  // Buyer / unauthenticated / both with no specialties → full market
  return { keys: [...ML_CROPS], isPersonalised: false };
}

function pickTwo(pool: string[]): [string, string | null] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1] ?? null];
}

// ── Headline templates ────────────────────────────────────────────────────────

function buildHeadline(snap: CropSnap, idx: number) {
  const dir = snap.price2wk >= snap.currentPrice ? "rising" : "falling";
  const pct = `${snap.pctChange}%`;
  const options = [
    { before: `${snap.cropLabel} prices ${dir} `, accent: `${pct} in 2 weeks` },
    {
      before: `${pct} ${dir === "rising" ? "surge" : "drop"} forecast for `,
      accent: snap.cropLabel,
    },
    {
      before: `Best time to ${dir === "rising" ? "sell" : "hold"} `,
      accent: `${snap.cropLabel} — ${pct} shift ahead`,
    },
  ];
  return options[idx % options.length];
}

// ── StatPill ──────────────────────────────────────────────────────────────────

function StatPill({ snap }: { snap: CropSnap }) {
  const up = snap.price2wk >= snap.currentPrice;
  return (
    <div className="flex flex-col gap-0.5 bg-white/10 backdrop-blur-sm rounded-2xl px-3.5 py-2.5 border border-white/20 min-w-[90px]">
      <span className="text-white/60 text-[10px] uppercase tracking-widest font-medium truncate">
        {snap.cropLabel}
      </span>
      <span className="text-white font-bold text-sm leading-none">
        {fmtUGX(snap.currentPrice)}/kg
      </span>
      <span
        className={`text-[10px] font-semibold mt-0.5 ${up ? "text-emerald-300" : "text-red-300"}`}
      >
        {up ? "↑ +" : "↓ -"}
        {snap.pctChange}% 2 wks
      </span>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function BannerSkeleton() {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[180px]">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600" />
      <div className="relative z-10 p-5 md:p-7 space-y-3">
        <Skeleton className="h-5 w-24 rounded-full bg-white/15" />
        <Skeleton className="h-8 w-72 rounded-lg bg-white/15" />
        <Skeleton className="h-3 w-52 rounded bg-white/10" />
        <Skeleton className="h-9 w-36 rounded-xl bg-white/15 mt-4" />
      </div>
    </div>
  );
}

// ── No-coverage banner (farmer whose crops aren't in the ML model yet) ────────

function NoCoverageBanner({ specialties }: { specialties: string[] }) {
  const listed = specialties.slice(0, 3).join(", ");
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.10)_0%,transparent_60%)]" />
      <div className="relative z-10 p-5 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3 py-1 mb-3 backdrop-blur-sm">
              <Sparkles size={11} className="text-emerald-200" />
              <span className="text-white/90 text-[11px] font-semibold uppercase tracking-widest">
                AI Insights
              </span>
            </div>
            <h2 className="text-white text-xl md:text-2xl font-bold leading-tight mb-1.5 font-serif">
              Price intelligence <span className="text-emerald-200">coming soon</span> for your
              crops
            </h2>
            <p className="text-white/55 text-xs md:text-sm mb-4 max-w-sm">
              Our ML models don't yet cover{listed ? ` ${listed}` : " your specialties"}. Check the
              market overview for nearby commodities.
            </p>
            <Link to="/prices">
              <Button
                size="sm"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl shadow-lg shadow-black/20 gap-1.5 h-9 px-4"
              >
                View Market Overview
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="hidden md:flex items-center justify-center size-24 rounded-3xl bg-white/10 border border-white/20">
            <Leaf className="size-10 text-emerald-300 opacity-70" />
          </div>
        </div>
        <div className="hidden md:flex mt-5 pt-4 border-t border-white/10 items-center justify-between text-white/40 text-[11px]">
          <span className="flex items-center gap-1.5">
            <TrendingUp size={11} />
            Powered by Soko AI Market Intelligence
          </span>
          <span>8 crops currently covered</span>
        </div>
      </div>
    </div>
  );
}

// ── Main banner ───────────────────────────────────────────────────────────────

const AiBanner = () => {
  const { user } = useAuthStore();
  const isFarmer = useAuthStore((s) => s.isFarmer());

  // Compute candidate pool once — stable for this mount
  const { keys: candidateKeys, isPersonalised } = useRef(
    pickCandidates(isFarmer, user?.specialties)
  ).current;

  // Also stable per mount: which two crops to show and which headline template
  const [featuredKey, secondKey, templateIdx] = useRef(
    candidateKeys.length > 0
      ? ([...pickTwo(candidateKeys), Math.floor(Math.random() * 3)] as const)
      : ([null, null, 0] as const)
  ).current;

  const [featured, setFeatured] = useState<CropSnap | null>(null);
  const [second, setSecond] = useState<CropSnap | null>(null);
  const [loading, setLoading] = useState(candidateKeys.length > 0);

  useEffect(() => {
    if (!featuredKey) return;
    const fetches = [fetchSnap(featuredKey)];
    if (secondKey) fetches.push(fetchSnap(secondKey));

    Promise.all(fetches)
      .then(([f, s]) => {
        setFeatured(f ?? null);
        setSecond(s ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Farmer with no ML coverage → friendly fallback
  if (isPersonalised && candidateKeys.length === 0) {
    return <NoCoverageBanner specialties={user?.specialties ?? []} />;
  }

  if (loading) return <BannerSkeleton />;
  if (!featured) return null;

  const hl = buildHeadline(featured, templateIdx);
  const dir = featured.price2wk >= featured.currentPrice ? "rising" : "falling";
  const subtext = isPersonalised
    ? `Based on your ${user?.specialties?.slice(0, 2).join(" & ")} specialty data`
    : "Based on Kisenyi (Kampala) market data & regional seasonal trends";

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-600" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.2)_0%,transparent_70%)]" />
      <div className="absolute -top-12 -right-12 size-52 rounded-full border-[28px] border-white/10" />
      <div className="absolute -top-6  -right-6  size-32 rounded-full border-[16px] border-white/8" />
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
        aria-hidden
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      <div className="relative z-10 p-5 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8">
          {/* Left: text */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3 py-1 mb-3 backdrop-blur-sm">
              <Sparkles size={11} className="text-emerald-200" />
              <span className="text-white/90 text-[11px] font-semibold uppercase tracking-widest">
                AI Insights
              </span>
            </div>

            <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-1.5 font-serif">
              {hl.before}
              <span className={dir === "rising" ? "text-emerald-200" : "text-red-300"}>
                {hl.accent}
              </span>
            </h2>

            <p className="text-white/55 text-xs md:text-sm mb-4 max-w-sm">{subtext}</p>

            <Link to="/prices">
              <Button
                size="sm"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold rounded-xl shadow-lg shadow-black/20 gap-1.5 h-9 px-4 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                View Prediction
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>

          {/* Right: pills */}
          <div className="flex flex-row md:flex-col gap-2 md:gap-2.5 md:items-end">
            <StatPill snap={featured} />
            {second && <StatPill snap={second} />}

            <div className="hidden md:flex flex-col gap-1 bg-white/10 rounded-2xl px-3.5 py-2.5 border border-white/20 min-w-[90px]">
              <span className="text-white/60 text-[10px] uppercase tracking-widest font-medium">
                Confidence
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-300"
                    style={{ width: `${featured.confidence}%` }}
                  />
                </div>
                <span className="text-white font-bold text-sm">{featured.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 md:hidden flex items-center gap-1.5 text-white/40 text-[10px]">
          <TrendingUp size={10} />
          <span>Powered by Soko AI · Live market data</span>
        </div>
        <div className="hidden md:flex mt-5 pt-4 border-t border-white/10 items-center justify-between text-white/40 text-[11px]">
          <span className="flex items-center gap-1.5">
            <TrendingUp size={11} />
            Powered by Soko AI Market Intelligence
          </span>
          <span>Live data · Kampala, UG</span>
        </div>
      </div>
    </div>
  );
};

export default AiBanner;
