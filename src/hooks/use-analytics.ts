// src/hooks/use-analytics.ts
// ─────────────────────────────────────────────────────────────────────────────
// TanStack Query hooks for the /profile/analytics page
// Wraps existing API functions with preview limits
// ─────────────────────────────────────────────────────────────────────────────

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/api/api";
import { fetchMyListings } from "@/api/listings.api";
import { fetchFarmerOrders, fetchMyOrders } from "@/api/orders.api";
import { useAuthStore } from "@/store/auth-store";
import { Post } from "@/types";
import { OrderSummaryItem, PayoutRecord } from "@/types/profile";

// ── My listings (preview) ────────────────────────────────────────────────────

export function useMyListingsPreview(limit = 4) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["my-listings-preview", limit],
    queryFn: async () => {
      const all = await fetchMyListings(token!, "active");
      return all.slice(0, limit);
    },
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── My orders preview (buyer) ─────────────────────────────────────────────────

export function useMyOrdersPreview(limit = 4) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["my-orders-preview", limit],
    queryFn: async () => {
      const orders = await fetchMyOrders(token!, undefined, 1, limit);
      return orders.map((o) => ({
        id: o.id,
        productName: (o as any).productName ?? "Order",
        productImage: (o as any).productImage ?? "",
        farmer: (o as any).farmerName ?? "",
        quantity: (o as any).itemCount ?? 1,
        unit: (o as any).unit ?? "unit",
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })) as OrderSummaryItem[];
    },
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── My payouts preview (farmer) ───────────────────────────────────────────────
// No dedicated payments/farmer endpoint — maps GET /orders/farmer to payout shape.
// Delivered orders = paid, anything else = pending.

export function useMyPayoutsPreview(limit = 4) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["my-payouts-preview", limit],
    queryFn: async () => {
      const orders = await fetchFarmerOrders(token!, undefined, 1);
      return orders.slice(0, limit).map((o) => ({
        id: o.id,
        amount: o.total,
        orderId: o.id,
        buyerName: (o as any).buyerName ?? "Buyer",
        product: (o as any).productName ?? `Order #${o.id.slice(0, 6)}`,
        status: o.status === "delivered" ? "paid" : "pending",
        paidAt: o.status === "delivered" ? o.createdAt : undefined,
        createdAt: o.createdAt,
      })) as PayoutRecord[];
    },
    enabled: !!token,
    staleTime: 60_000,
  });
}

// ── My blog posts preview ─────────────────────────────────────────────────────

export function useMyBlogPostsPreview(limit = 3) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: ["my-blog-posts-preview", limit],
    queryFn: async () => {
      const posts = await api.get<Post[]>("posts/me/posts?page=1&limit=10", token);
      return posts.slice(0, limit);
    },
    enabled: !!token,
    staleTime: 120_000,
  });
}

// ── Delete listing ────────────────────────────────────────────────────────────

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, token }: { id: string; token: string }) =>
      api.delete(`listings/${id}`, token),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-listings-preview"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}
