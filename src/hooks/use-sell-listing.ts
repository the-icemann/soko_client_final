// Full sell flow:
//   1. POST /listings/           → create draft → { id, slug }
//   2. POST /listings/{id}/images → upload photos (multipart)
//   3. POST /listings/{id}/publish → go live
//   4. Reset store + navigate to /sell/success?listingId={id}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useAuthStore } from "@/store/auth-store";
import { useSellStore } from "@/store/sell-store";

import { listingKeys } from "./useMarketplace";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/";

// ── Step 1: Create draft (JSON body) ──────────────────────────────────────────

interface CreateListingPayload {
  name: string;
  category: string;
  district: string;
  village: string;
  description: string;
  price: number;
  unit: string;
  totalQty: number;
  minimumOrder: number;
  fresh: boolean;
  tags: string[];
  priceTiers: { minQty: number; price: number; label: string }[];
}

interface CreateListingResponse {
  id: string;
  slug: string;
  message: string;
}

async function createDraftApi(
  payload: CreateListingPayload,
  token: string
): Promise<CreateListingResponse> {
  const res = await fetch(`${BASE_URL}listings/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail = err?.detail;
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d: { msg: string }) => d.msg).join(", "));
    }
    throw new Error(typeof detail === "string" ? detail : "Failed to create listing");
  }
  return res.json();
}

// ── Step 2: Upload images (multipart) ─────────────────────────────────────────

async function uploadImagesApi(listingId: string, files: File[], token: string): Promise<void> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  const res = await fetch(`${BASE_URL}listings/${listingId}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Failed to upload images");
  }
}

// ── Step 3: Publish draft ─────────────────────────────────────────────────────

async function publishListingApi(listingId: string, token: string): Promise<void> {
  const res = await fetch(`${BASE_URL}listings/${listingId}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Failed to publish listing");
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCreateListing() {
  const token = useAuthStore((s) => s.token);
  const draft = useSellStore((s) => s.draft);
  const resetDraft = useSellStore((s) => s.resetDraft);
  const setPlacedId = useSellStore((s) => s.setPlacedListingId);
  const setPlacedSlug = useSellStore((s) => s.setPlacedSlug);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("You must be logged in to list produce");

      // Build tags array
      const tags = draft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Build price tiers
      const priceTiers: CreateListingPayload["priceTiers"] = [];
      if (draft.enableTiers) {
        priceTiers.push({ minQty: 1, price: Number(draft.price), label: "Standard" });
        if (draft.tier2MinQty && draft.tier2Price) {
          priceTiers.push({
            minQty: Number(draft.tier2MinQty),
            price: Number(draft.tier2Price),
            label: "Bulk",
          });
        }
        if (draft.tier3MinQty && draft.tier3Price) {
          priceTiers.push({
            minQty: Number(draft.tier3MinQty),
            price: Number(draft.tier3Price),
            label: "Wholesale",
          });
        }
      }

      // ── 1. Create draft ──────────────────────────────────────────────────
      const created = await createDraftApi(
        {
          name: draft.name.trim(),
          category: draft.category,
          district: draft.district,
          village: draft.village.trim(),
          description: draft.description.trim(),
          price: Number(draft.price),
          unit: draft.unit,
          totalQty: Number(draft.totalQty),
          minimumOrder: Number(draft.minimumOrder) || 1,
          fresh: draft.fresh,
          tags,
          priceTiers,
        },
        token
      );

      // ── 2. Upload images ─────────────────────────────────────────────────
      if (draft.photoFiles.length > 0) {
        await uploadImagesApi(created.id, draft.photoFiles, token);
      }

      // ── 3. Publish ───────────────────────────────────────────────────────
      await publishListingApi(created.id, token);

      return created;
    },

    onSuccess: (data) => {
      setPlacedId(data.id);
      setPlacedSlug(data.slug);
      resetDraft();
      // Bust marketplace cache so the new listing appears immediately
      qc.invalidateQueries({ queryKey: listingKeys.all() });
      navigate({ to: "/sell/success", search: { listingId: data.id, slug: data.slug } });
    },
  });
}
