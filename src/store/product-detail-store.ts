import { create } from "zustand";

import { Product } from "@/types";

type ActiveTab = "details" | "reviews" | "similar";

interface ProductDetailState {
  product: Product | null;
  activeImageIndex: number;
  quantity: number;
  activeTab: ActiveTab;
  isLoading: boolean;
  error: string | null;
  isAddingToCart: boolean;
  userRating: number;
  pendingRating: number | null;

  // Setters
  setProduct: (p: Product) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;

  // UI
  setActiveImageIndex: (i: number) => void;
  setActiveTab: (tab: ActiveTab) => void;

  // Quantity
  setQuantity: (qty: number, minimumOrder?: number) => void;
  increment: (step?: number, max?: number) => void;
  decrement: (step?: number, minimumOrder?: number) => void;

  // Wishlist (optimistic — local only until backend supports it)
  toggleWishlist: () => void;

  // Rating
  setUserRating: (r: number) => void;
  submitRating: (r: number) => void;

  // Cart
  setAddingToCart: (v: boolean) => void;

  // Derived
  effectivePrice: () => number;
  subtotal: () => number;
}

export const useProductDetailStore = create<ProductDetailState>((set, get) => ({
  product: null, // ← no placeholder; useProduct hook fills on mount
  activeImageIndex: 0,
  quantity: 50,
  activeTab: "details",
  isLoading: false,
  error: null,
  isAddingToCart: false,
  userRating: 0,
  pendingRating: null,

  setProduct: (p) => set({ product: p, quantity: p.minimumOrder ?? 50, activeImageIndex: 0 }),
  setLoading: (v) => set({ isLoading: v }),
  setError: (e) => set({ error: e }),

  setActiveImageIndex: (i) => set({ activeImageIndex: i }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ── Quantity ───────────────────────────────────────────────────────────────
  increment: (step = 50) => set((s) => ({ quantity: s.quantity + step })),

  decrement: (step = 50) =>
    set((s) => ({ quantity: Math.max(s.product?.minimumOrder ?? 1, s.quantity - step) })),

  setQuantity: (qty) => set((s) => ({ quantity: Math.max(s.product?.minimumOrder ?? 1, qty) })),

  // ── Wishlist ───────────────────────────────────────────────────────────────
  toggleWishlist: () =>
    set((s) => ({
      product: s.product ? { ...s.product, isWishlisted: !s.product.isWishlisted } : null,
    })),

  // ── Rating ─────────────────────────────────────────────────────────────────
  setUserRating: (r) => set({ userRating: r }),

  submitRating: (r) => {
    set({ pendingRating: r });
    set((s) => ({
      product: s.product
        ? { ...s.product, rating: parseFloat(((s.product.rating + r) / 2).toFixed(1)) }
        : null,
      pendingRating: null,
    }));
  },

  setAddingToCart: (v) => set({ isAddingToCart: v }),

  // ── Derived ────────────────────────────────────────────────────────────────
  effectivePrice: () => {
    const { product, quantity } = get();
    if (!product) return 0;
    if (!product.priceTiers?.length) return product.price;
    const tier = [...product.priceTiers].reverse().find((t) => quantity >= t.minQty);
    return tier?.price ?? product.price;
  },

  subtotal: () => {
    const { quantity, effectivePrice } = get();
    return quantity * effectivePrice();
  },
}));
