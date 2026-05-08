// All hooks the product detail page needs in one file.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchListingBySlug,
  fetchReviews,
  ReviewOut,
  submitReview,
  toggleReviewHelpful,
} from "@/api/listings.api";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useProductDetailStore } from "@/store/product-detail-store";
import { Product, ProductReview } from "@/types";

import { listingKeys } from "./useMarketplace";

// ── Mapper: ReviewOut → ProductReview

function toProductReview(r: ReviewOut): ProductReview {
  return {
    id: r.id,
    reviewer: r.reviewer,
    reviewerInitials: r.reviewerInitials,
    rating: r.rating,
    body: r.body,
    createdAt: r.createdAt,
    helpful: r.helpful,
    isHelpfulByMe: r.isHelpfulByMe,
  };
}

// ── useProduct
/**
 * Fetches a single listing by slug (or id — passed as the route param).
 * The route uses `$id` but the backend slug endpoint works with the slug
 * directly. If your route param IS the slug, pass it straight through.
 * If it's a UUID, you'll need a `/listings/id/{id}` endpoint — add that
 * to listings.api.ts when ready.
 */
export function useProduct(slugOrId: string) {
  const token = useAuthStore((s) => s.token);
  const setProduct = useProductDetailStore((s) => s.setProduct);

  return useQuery({
    queryKey: listingKeys.detail(slugOrId),
    queryFn: async () => {
      const product = await fetchListingBySlug(slugOrId, token);
      setProduct(product); // sync into store for quantity initialisation
      return product;
    },
    enabled: !!slugOrId,
    staleTime: 1000 * 60 * 2,
  });
}

// ── useReviews ────────────────────────────────────────────────────────────────

export function useReviews(listingId: string | undefined, page = 1) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: listingKeys.reviews(listingId ?? "", page),
    queryFn: async () => {
      const reviews = await fetchReviews(listingId!, token, page);
      return reviews.map(toProductReview);
    },
    enabled: !!listingId,
    staleTime: 1000 * 60,
  });
}

// ── useAddToCart
/**
 * Wraps cart-store.addItem so the detail page has a consistent interface.
 * No server call — cart is local (persisted to localStorage).
 */
export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  return {
    addToCart: (product: Product, quantity: number, unitPrice: number) => {
      addItem({
        product: {
          id: product.id,
          name: product.name,
          image: product.image,
          farmer: product.farmer,
          district: product.district,
          verified: product.verified,
          unit: product.unit,
          category: product.category,
          qty: product.qty,
          minimumOrder: product.minimumOrder,
        },
        quantity,
        unitPrice,
      });
      openDrawer();
    },
  };
}

// ── useToggleWishlist
/**
 * Optimistic wishlist toggle.
 * TODO: wire to a real wishlist endpoint when the backend supports it.
 * For now this is local-only via the store.
 */
export function useToggleWishlist(_listingId: string) {
  const toggleWishlist = useProductDetailStore((s) => s.toggleWishlist);

  return useMutation({
    mutationFn: async () => {
      // Optimistic — no API yet
      toggleWishlist();
    },
  });
}

// ── useSubmitRating ───────────────────────────────────────────────────────────

export function useSubmitRating(listingId: string) {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (rating: number) => {
      if (!token) throw new Error("Login to leave a review");
      return submitReview(
        listingId,
        { rating, body: "" }, // body-less quick rating — extend if you have a textarea
        token
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: listingKeys.reviews(listingId, 1) });
      qc.invalidateQueries({ queryKey: listingKeys.detail(listingId) });
    },
  });
}

// ── useToggleReviewHelpful ────────────────────────────────────────────────────

export function useToggleReviewHelpful(listingId: string) {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  return useMutation({
    // Optimistic update
    onMutate: async (reviewId: string) => {
      await qc.cancelQueries({ queryKey: listingKeys.reviews(listingId, 1) });
      const prev = qc.getQueryData<ProductReview[]>(listingKeys.reviews(listingId, 1));

      qc.setQueryData<ProductReview[]>(
        listingKeys.reviews(listingId, 1),
        (old) =>
          old?.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  isHelpfulByMe: !r.isHelpfulByMe,
                  helpful: r.helpful + (r.isHelpfulByMe ? -1 : 1),
                }
              : r
          ) ?? []
      );
      return { prev };
    },
    mutationFn: async (reviewId: string) => {
      if (!token) throw new Error("Login to mark reviews helpful");
      return toggleReviewHelpful(reviewId, token);
    },
    onError: (_err, _reviewId, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(listingKeys.reviews(listingId, 1), ctx.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: listingKeys.reviews(listingId, 1) });
    },
  });
}
