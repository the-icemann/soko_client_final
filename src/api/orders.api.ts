import { api } from "@/api/api";
import { CheckoutPayload, DeliveryAddress, Order, OrderStatus, PaymentMethod } from "@/types";

// ── Backend response types

export interface OrderItemOut {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  farmerName: string;
  unit: string;
  category: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderOut {
  id: string;
  status: OrderStatus;
  items: OrderItemOut[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: "UGX";
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  paymentUrl?: string; // PesaPal redirect URL
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
}

export interface OrderSummaryOut {
  id: string;
  status: OrderStatus;
  total: number;
  currency: "UGX";
  itemCount: number;
  createdAt: string;
  estimatedDelivery?: string;
}

export interface CheckoutResponse extends OrderOut {
  paymentUrl?: string; // redirect buyer here if online payment
}

export interface TransactionOut {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentStatusOut {
  status: string;
  pesapalStatus?: string;
  paymentUrl?: string;
}

// ── Orders ────────────────────────────────────────────────────────────────────

/** POST /orders/  — place order + initiate payment */
export function checkout(payload: CheckoutPayload, token: string) {
  return api.post<CheckoutResponse>("orders/", payload, token);
}

/** GET /orders/me  — buyer order history */
export function fetchMyOrders(token: string, status?: OrderStatus, page = 1, limit = 20) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) qs.set("status", status);
  return api.get<OrderSummaryOut[]>(`orders/me?${qs.toString()}`, token);
}

/** GET /orders/me/{orderId}  — single order detail */
export function fetchMyOrder(orderId: string, token: string) {
  return api.get<OrderOut>(`orders/me/${orderId}`, token);
}

/** POST /orders/me/{orderId}/cancel */
export function cancelOrder(orderId: string, token: string) {
  return api.post<OrderOut>(`orders/me/${orderId}/cancel`, {}, token);
}

/** GET /orders/farmer  — farmer order list */
export function fetchFarmerOrders(token: string, status?: OrderStatus, page = 1) {
  const qs = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) qs.set("status", status);
  return api.get<OrderSummaryOut[]>(`orders/farmer?${qs.toString()}`, token);
}

/** PUT /orders/farmer/{orderId}/status  — farmer updates order status */
export function updateOrderStatus(orderId: string, status: OrderStatus, token: string) {
  return api.put<OrderOut>(`orders/farmer/${orderId}/status`, { status }, token);
}

// ── Payments ──────────────────────────────────────────────────────────────────

/** GET /payments/me  — buyer transaction history */
export function fetchMyTransactions(token: string, page = 1) {
  return api.get<TransactionOut[]>(`payments/me?page=${page}&limit=20`, token);
}

/** GET /payments/me/{transactionId} */
export function fetchTransaction(transactionId: string, token: string) {
  return api.get<TransactionOut>(`payments/me/${transactionId}`, token);
}

/**
 * GET /payments/order/{orderId}/status
 * Poll this while the buyer is on PesaPal to detect completion.
 */
export function fetchPaymentStatus(orderId: string, token: string) {
  return api.get<PaymentStatusOut>(`payments/order/${orderId}/status`, token);
}
