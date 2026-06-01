// Checkout, order history, order detail, cancel, payment status polling.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import {
  cancelOrder,
  checkout,
  CheckoutResponse,
  fetchMyOrder,
  fetchMyOrders,
  fetchMyTransactions,
  fetchPaymentStatus,
  OrderSummaryOut,
  updateOrderStatus,
} from "@/api/orders.api";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { CheckoutPayload, OrderStatus } from "@/types";

// ── Query keys ─

export const orderKeys = {
  all: () => ["orders"] as const,
  myList: (status?: string) => ["orders", "me", status] as const,
  myDetail: (id: string) => ["orders", "me", id] as const,
  farmerList: (status?: string) => ["orders", "farmer", status] as const,
  paymentStatus: (orderId: string) => ["payments", "status", orderId] as const,
  transactions: (page: number) => ["payments", "me", page] as const,
};

// ── useCheckout
/**
 * Places an order and initiates payment.
 *
 * On success:
 * - If paymentUrl is returned → redirect to PesaPal
 * - If COD → navigate directly to confirmation page
 * - Cart is cleared and placedOrderId is set
 */
export function useCheckout() {
  const token = useAuthStore((s) => s.token);
  const clearCart = useCartStore((s) => s.clearCart);
  const setPlacedId = useCartStore((s) => s.setPlacedOrderId);
  const resetCheckout = useCartStore((s) => s.resetCheckout);
  const setStep = useCartStore((s) => s.setCheckoutStep);
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: CheckoutPayload) => {
      if (!token) throw new Error("You must be logged in to place an order");
      return checkout(payload, token);
    },
    onSuccess: (data: CheckoutResponse) => {
      setPlacedId(data.id);
      clearCart();
      qc.invalidateQueries({ queryKey: orderKeys.all() });

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setStep("confirmation");
        navigate({ to: "/checkout/confirmation", search: { orderId: data.id, status: "success" } });
      }
    },
  });
}

// ── useMyOrders

export function useMyOrders(status?: OrderStatus) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: orderKeys.myList(status),
    queryFn: () => {
      if (!token) return [] as OrderSummaryOut[];
      return fetchMyOrders(token, status);
    },
    enabled: !!token,
    staleTime: 1000 * 30,
  });
}

// ── useMyOrder — single order detail

export function useMyOrder(orderId: string | undefined) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: orderKeys.myDetail(orderId ?? ""),
    queryFn: () => fetchMyOrder(orderId!, token!),
    enabled: !!token && !!orderId,
    staleTime: 1000 * 30,
  });
}

// ── useCancelOrder

export function useCancelOrder() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!token) throw new Error("Not authenticated");
      return cancelOrder(orderId, token);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: orderKeys.myList() });
      qc.invalidateQueries({ queryKey: orderKeys.myDetail(data.id) });
    },
  });
}

// ── useUpdateOrderStatus (farmer)

export function useUpdateOrderStatus() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      if (!token) throw new Error("Not authenticated");
      return updateOrderStatus(orderId, status, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.farmerList() });
    },
  });
}

// ── usePaymentStatus — polling hook
/**
 * Poll /payments/order/{orderId}/status every 3 seconds while buyer is on
 * PesaPal. Stop polling once status is no longer "pending".
 *
 * Usage in the order confirmation/pending page:
 *   const { data } = usePaymentStatus(orderId);
 */
export function usePaymentStatus(orderId: string | undefined) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: orderKeys.paymentStatus(orderId ?? ""),
    queryFn: () => fetchPaymentStatus(orderId!, token!),
    enabled: !!token && !!orderId,
    refetchInterval: (query) => {
      // Stop polling once payment is no longer pending
      const status = query.state.data?.status;
      if (status && status !== "pending") return false;
      return 3000; // poll every 3 seconds
    },
    staleTime: 0,
  });
}

// ── useMyTransactions ─────────────────────────────────────────────────────────

export function useMyTransactions(page = 1) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: orderKeys.transactions(page),
    queryFn: () => fetchMyTransactions(token!, page),
    enabled: !!token,
    staleTime: 1000 * 60,
  });
}
