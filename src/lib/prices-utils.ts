// ── Supported ML crops ────────────────────────────────────────────────────────

export const ML_CROPS = [
  "maize_grain",
  "yellow_beans",
  "irish_potatoes",
  "tomatoes",
  "matoke",
  "cassava_chips",
  "sorghum",
  "millet",
] as const;

export type MLCrop = (typeof ML_CROPS)[number];

export const ML_MARKETS = [
  "Kisenyi_Kampala",
  "Gulu",
  "Mbarara",
  "Mbale",
  "Lira",
  "Masaka",
] as const;

export const CROP_DISPLAY: Record<string, string> = {
  maize_grain: "Maize Grain",
  yellow_beans: "Yellow Beans",
  irish_potatoes: "Irish Potatoes",
  tomatoes: "Tomatoes",
  matoke: "Matoke",
  cassava_chips: "Cassava Chips",
  sorghum: "Sorghum",
  millet: "Millet",
};

export const MARKET_DISPLAY: Record<string, string> = {
  Kisenyi_Kampala: "Kisenyi (Kampala)",
  Gulu: "Gulu",
  Mbarara: "Mbarara",
  Mbale: "Mbale",
  Lira: "Lira",
  Masaka: "Masaka",
};

// Keyword → ML crop key (longest/most-specific keywords first)
const CROP_KEYWORDS: [string, string[]][] = [
  ["irish_potatoes", ["irish potato", "potato", "irish"]],
  ["yellow_beans", ["yellow bean", "beans", "bean"]],
  ["cassava_chips", ["cassava chip", "cassava", "manioc", "tapioca"]],
  ["maize_grain", ["maize grain", "maize", "corn", "grain"]],
  ["tomatoes", ["tomato"]],
  ["matoke", ["matoke", "plantain", "banana"]],
  ["sorghum", ["sorghum"]],
  ["millet", ["millet"]],
];

export function mapToMLCrop(text: string): MLCrop | null {
  const lower = text.toLowerCase();
  for (const [crop, keywords] of CROP_KEYWORDS) {
    if (keywords.some((k) => lower.includes(k))) return crop as MLCrop;
  }
  return null;
}

// ── District → approximate coordinates ───────────────────────────────────────

export const DISTRICT_COORDS: Record<string, [number, number]> = {
  Kampala: [0.3476, 32.5825],
  Wakiso: [0.401, 32.4541],
  Mukono: [0.3536, 32.7553],
  Jinja: [0.4247, 33.204],
  Mbale: [1.079, 34.1754],
  Gulu: [2.7749, 32.2895],
  Lira: [2.2499, 32.8998],
  Mbarara: [-0.6117, 30.6545],
  Masaka: [-0.3416, 31.74],
  Kabale: [-1.2492, 29.9926],
  "Fort Portal": [0.6588, 30.2744],
  Soroti: [1.7148, 33.6108],
  Arua: [3.0209, 30.9111],
  Hoima: [1.435, 31.3517],
  Iganga: [0.6081, 33.4689],
  Busia: [0.4624, 34.0903],
  Tororo: [0.6921, 34.1802],
  Moroto: [2.5348, 34.668],
  Kotido: [2.9851, 34.1305],
  Bundibugyo: [0.6737, 30.0563],
  Kasese: [0.1842, 30.0855],
  Kyenjojo: [0.6228, 30.6357],
  Kamuli: [0.9462, 33.1192],
  Bugiri: [0.5703, 33.7468],
  Pallisa: [1.1448, 33.7093],
  Kumi: [1.4597, 33.9399],
  Kapchorwa: [1.3541, 34.4523],
  Nebbi: [2.4788, 31.0877],
  Adjumani: [3.3778, 31.7942],
  Moyo: [3.6517, 31.724],
  Yumbe: [3.4641, 31.2489],
  Koboko: [3.4136, 30.9604],
  Maracha: [3.329, 30.9213],
};

export const DEFAULT_COORDS: [number, number] = [0.3476, 32.5825]; // Kampala

export function getDistrictCoords(district: string): [number, number] {
  return DISTRICT_COORDS[district] ?? DEFAULT_COORDS;
}

// ── Formatting ────────────────────────────────────────────────────────────────

export function fmtUGX(v: number): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    maximumFractionDigits: 0,
  }).format(v);
}

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-UG", { day: "numeric", month: "short" });
}

// ── Signal metadata ───────────────────────────────────────────────────────────

export type Signal = "SELL_NOW" | "SELL_NOW_PERISHABLE" | "WAIT" | string;

export function signalMeta(signal: Signal): { label: string; color: string; bg: string } {
  switch (signal) {
    case "SELL_NOW":
      return { label: "Sell Now", color: "text-green-700", bg: "bg-green-100" };
    case "SELL_NOW_PERISHABLE":
      return { label: "Sell Urgent", color: "text-orange-700", bg: "bg-orange-100" };
    case "WAIT":
      return { label: "Hold", color: "text-blue-700", bg: "bg-blue-100" };
    default:
      return { label: signal, color: "text-muted-foreground", bg: "bg-muted" };
  }
}

export function confidenceMeta(c: string): { label: string; color: string } {
  switch (c?.toLowerCase()) {
    case "high":
      return { label: "High", color: "text-green-600" };
    case "medium":
      return { label: "Medium", color: "text-yellow-600" };
    default:
      return { label: "Low", color: "text-red-500" };
  }
}
