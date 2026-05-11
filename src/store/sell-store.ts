import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  AiPriceSuggestion,
  CreateListingPayload,
  ProductUnit,
  SELL_STEPS,
  SellListingDraft,
  SellStep,
} from "@/types/sell";

const EMPTY_DRAFT: SellListingDraft = {
  name: "",
  category: "",
  district: "",
  village: "",
  description: "",
  tags: "",
  price: "",
  unit: "kg",
  totalQty: "",
  minimumOrder: "50",
  fresh: false,
  enableTiers: false,
  tier2MinQty: "",
  tier2Price: "",
  tier3MinQty: "",
  tier3Price: "",
  photoFiles: [],
  photoPreviews: [],
};

interface SellStore {
  // State
  draft: SellListingDraft;
  currentStep: SellStep;
  aiSuggestion: AiPriceSuggestion | null;
  isLoadingAi: boolean;
  placedListingId: string | null;
  placedSlug: string;

  // Field setters
  setField: <K extends keyof SellListingDraft>(key: K, value: SellListingDraft[K]) => void;
  setPlacedSlug: (slug: string) => void;

  // Photos
  addPhotos: (files: File[]) => void;
  removePhoto: (index: number) => void;
  reorderPhoto: (from: number, to: number) => void;

  // Navigation
  goToStep: (step: SellStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // AI suggestion
  setAiSuggestion: (s: AiPriceSuggestion | null) => void;
  setLoadingAi: (v: boolean) => void;
  applyAiPrice: () => void;

  // After publish
  setPlacedListingId: (id: string) => void;
  resetDraft: () => void;

  // Derived
  isStepValid: (step: SellStep) => boolean;
  isReadyToPublish: () => boolean;
  buildFormData: () => FormData;
}

export const useSellStore = create<SellStore>()(
  persist(
    (set, get) => ({
      draft: EMPTY_DRAFT,
      currentStep: "info",
      aiSuggestion: null,
      isLoadingAi: false,
      placedListingId: null,
      placedSlug: "",

      // ── Field setter ─────────────────────────────────────────────────────
      setField: (key, value) => set((s) => ({ draft: { ...s.draft, [key]: value } })),
      setPlacedSlug: (slug) => set({ placedSlug: slug }),

      // ── Photos ───────────────────────────────────────────────────────────
      addPhotos: (files) => {
        const MAX = 8;
        set((s) => {
          const remaining = MAX - s.draft.photoFiles.length;
          const toAdd = files.slice(0, remaining);
          const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
          return {
            draft: {
              ...s.draft,
              photoFiles: [...s.draft.photoFiles, ...toAdd],
              photoPreviews: [...s.draft.photoPreviews, ...newPreviews],
            },
          };
        });
      },

      removePhoto: (index) =>
        set((s) => {
          URL.revokeObjectURL(s.draft.photoPreviews[index]);
          return {
            draft: {
              ...s.draft,
              photoFiles: s.draft.photoFiles.filter((_, i) => i !== index),
              photoPreviews: s.draft.photoPreviews.filter((_, i) => i !== index),
            },
          };
        }),

      reorderPhoto: (from, to) =>
        set((s) => {
          const files = [...s.draft.photoFiles];
          const previews = [...s.draft.photoPreviews];
          const [rf] = files.splice(from, 1);
          const [rp] = previews.splice(from, 1);
          files.splice(to, 0, rf);
          previews.splice(to, 0, rp);
          return { draft: { ...s.draft, photoFiles: files, photoPreviews: previews } };
        }),

      // ── Navigation ───────────────────────────────────────────────────────
      goToStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const steps = SELL_STEPS.map((s) => s.key);
        const curr = steps.indexOf(get().currentStep);
        if (curr < steps.length - 1) set({ currentStep: steps[curr + 1] });
      },

      prevStep: () => {
        const steps = SELL_STEPS.map((s) => s.key);
        const curr = steps.indexOf(get().currentStep);
        if (curr > 0) set({ currentStep: steps[curr - 1] });
      },

      // ── AI ───────────────────────────────────────────────────────────────
      setAiSuggestion: (s) => set({ aiSuggestion: s }),
      setLoadingAi: (v) => set({ isLoadingAi: v }),
      applyAiPrice: () => {
        const { aiSuggestion } = get();
        if (aiSuggestion) {
          set((s) => ({
            draft: { ...s.draft, price: String(aiSuggestion.suggested) },
          }));
        }
      },

      // ── Post publish ─────────────────────────────────────────────────────
      setPlacedListingId: (id) => set({ placedListingId: id }),
      resetDraft: () => set({ draft: EMPTY_DRAFT, currentStep: "info", placedListingId: null }),

      // ── Validation ───────────────────────────────────────────────────────
      isStepValid: (step) => {
        const { draft } = get();
        switch (step) {
          case "info":
            return !!(
              draft.name.trim() &&
              draft.category &&
              draft.district &&
              draft.description.trim()
            );
          case "pricing":
            return !!(
              draft.price &&
              Number(draft.price) > 0 &&
              draft.totalQty &&
              Number(draft.totalQty) > 0
            );
          case "photos":
            return draft.photoFiles.length > 0;
          case "publish":
            return get().isReadyToPublish();
        }
      },

      isReadyToPublish: () => {
        const { isStepValid } = get();
        return isStepValid("info") && isStepValid("pricing") && isStepValid("photos");
      },

      // ── Build FormData to POST to FastAPI ─────────────────────────────────
      buildFormData: () => {
        const { draft } = get();
        const form = new FormData();

        form.append("name", draft.name.trim());
        form.append("category", draft.category);
        form.append("district", draft.district);
        form.append("village", draft.village.trim());
        form.append("description", draft.description.trim());
        form.append("price", draft.price);
        form.append("unit", draft.unit);
        form.append("total_qty", draft.totalQty);
        form.append("minimum_order", draft.minimumOrder || "1");
        form.append("fresh", String(draft.fresh));

        const tags = draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        form.append("tags", JSON.stringify(tags));

        // Price tiers
        const tiers = [];
        if (draft.enableTiers) {
          tiers.push({ minQty: 1, price: Number(draft.price), label: "Standard" });
          if (draft.tier2MinQty && draft.tier2Price)
            tiers.push({
              minQty: Number(draft.tier2MinQty),
              price: Number(draft.tier2Price),
              label: "Bulk",
            });
          if (draft.tier3MinQty && draft.tier3Price)
            tiers.push({
              minQty: Number(draft.tier3MinQty),
              price: Number(draft.tier3Price),
              label: "Wholesale",
            });
        }
        form.append("price_tiers", JSON.stringify(tiers));

        // Images — raw File objects, backend generates URLs
        draft.photoFiles.forEach((file) => form.append("images", file));

        return form;
      },
    }),
    {
      name: "soko-sell-draft",
      partialize: (s) => ({
        draft: {
          ...s.draft,
          // Exclude File objects and object URLs — not serialisable
          photoFiles: [],
          photoPreviews: [],
        },
        currentStep: s.currentStep,
      }),
    }
  )
);
