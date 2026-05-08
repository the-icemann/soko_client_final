import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CreateReviewPayload,
  fetchFarmerListings,
  fetchFarmerProfile,
  fetchFarmerReviews,
  fetchMyPayouts,
  fetchProfileOrders,
  ListingOut,
  postFarmerReview,
  toggleReviewHelpful,
  updateMyProfile,
  UpdateProfilePayload,
} from "@/api/profile.api";
import { useAuthStore } from "@/store/auth-store";
import { FarmerProfile, FarmerReview, OrderSummaryItem, PayoutRecord } from "@/types/profile";
// ── Query keys ────────────────────────────────────────────────────────────────

export const profileKeys = {
  orders: () => ["profile", "orders"] as const,
  payouts: () => ["profile", "payouts"] as const,
  farmerProfile: (id: string) => ["profile", "farmer", id] as const,
  farmerListings: (id: string) => ["profile", "farmer", id, "listings"] as const,
  farmerReviews: (id: string) => ["profile", "reviews", id] as const,
};

// ── useMyOrders ───────────────────────────────────────────────────────────────

export function useMyOrders() {
  const token = useAuthStore((s) => s.token);
  return useQuery<OrderSummaryItem[]>({
    queryKey: profileKeys.orders(),
    queryFn: () => fetchProfileOrders(token!),
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}

// ── useMyPayouts ──────────────────────────────────────────────────────────────

export function useMyPayouts() {
  const token = useAuthStore((s) => s.token);
  return useQuery<PayoutRecord[]>({
    queryKey: profileKeys.payouts(),
    queryFn: () => fetchMyPayouts(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 2,
  });
}

// ── useFarmerProfile ──────────────────────────────────────────────────────────
/**
 * Fetches a public farmer profile by ID.
 * Token is optional — unauthenticated users can still view profiles.
 */
export function useFarmerProfile(farmerId: string) {
  const token = useAuthStore((s) => s.token);
  return useQuery<FarmerProfile>({
    queryKey: profileKeys.farmerProfile(farmerId),
    queryFn: () => fetchFarmerProfile(farmerId, token),
    enabled: !!farmerId,
    staleTime: 1000 * 60 * 5,
  });
}

// ── useFarmerListings ─────────────────────────────────────────────────────────
/**
 * Fetches all active listings for a farmer — shown on the farmer profile page.
 */
export function useFarmerListings(farmerId: string) {
  const token = useAuthStore((s) => s.token);
  return useQuery<ListingOut[]>({
    queryKey: profileKeys.farmerListings(farmerId),
    queryFn: () => fetchFarmerListings(farmerId, token),
    enabled: !!farmerId,
    staleTime: 1000 * 60 * 2,
  });
}

// ── useFarmerReviews ──────────────────────────────────────────────────────────

export function useFarmerReviews(farmerId: string) {
  const token = useAuthStore((s) => s.token);
  return useQuery<FarmerReview[]>({
    queryKey: profileKeys.farmerReviews(farmerId),
    queryFn: () => fetchFarmerReviews(farmerId, token),
    enabled: !!farmerId,
    staleTime: 1000 * 60,
  });
}

// ── useRateFarmer ─────────────────────────────────────────────────────────────

export function useRateFarmer(farmerId: string) {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => {
      if (!token) throw new Error("You must be signed in to rate a farmer");
      return postFarmerReview(farmerId, payload, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.farmerReviews(farmerId) });
    },
  });
}

// ── useToggleHelpful ──────────────────────────────────────────────────────────

export function useToggleHelpful(farmerId: string) {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reviewId: string) => {
      if (!token) throw new Error("Sign in to mark reviews as helpful");
      return toggleReviewHelpful(reviewId, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.farmerReviews(farmerId) });
    },
  });
}

// ── useUpdateProfile ──────────────────────────────────────────────────────────

export function useUpdateProfile() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => {
      if (!token) throw new Error("Not authenticated");
      return updateMyProfile(payload, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
