import { api } from "@/api/api";
// ── Re-export order summary mapped to profile shape ───────────────────────────
import { OrderSummaryOut } from "@/api/orders.api";
import { FarmerProfile, OrderSummaryItem, PayoutRecord } from "@/types/profile";

function toOrderSummaryItem(
  o: OrderSummaryOut & {
    productName?: string;
    productImage?: string;
    farmer?: string;
    quantity?: number;
    unit?: string;
  }
): OrderSummaryItem {
  return {
    id: o.id,
    productName: o.productName ?? "Order",
    productImage: o.productImage ?? "",
    farmer: o.farmer ?? "",
    quantity: o.quantity ?? o.itemCount,
    unit: o.unit ?? "item",
    total: o.total,
    status: o.status as OrderSummaryItem["status"],
    createdAt: o.createdAt,
  };
}

/** GET /orders/me — buyer order history */
export async function fetchProfileOrders(token: string, page = 1): Promise<OrderSummaryItem[]> {
  const raw = await api.get<
    (OrderSummaryOut & {
      productName?: string;
      productImage?: string;
      farmer?: string;
      quantity?: number;
      unit?: string;
    })[]
  >(`orders/me?page=${page}&limit=20`, token);
  return raw.map(toOrderSummaryItem);
}

// ── Farmer public profile ─────────────────────────────────────────────────────

/** GET /users/{farmerId} — public farmer profile */
export function fetchFarmerProfile(farmerId: string, token?: string | null) {
  return api.get<FarmerProfile>(`users/${farmerId}`, token);
}

// ── Farmer listings ───────────────────────────────────────────────────────────

export interface ListingOut {
  id: string;
  slug: string;
  farmerId: string;
  name: string;
  category: string;
  image: string;
  img: string;
  badge?: string;
  farmer: string;
  district: string;
  verified: boolean;
  price: number;
  priceValue: number;
  unit: string;
  qty: number;
  qtyDisplay: string;
  rating: number;
  fresh: boolean;
  status: string;
  description?: string;
  images: string[];
  minimumOrder: number;
  harvestDate?: string;
  storage?: string;
  tags: string[];
  priceTiers: { id: string; minQty: number; price: number; label: string }[];
  reviewCount: number;
  isWishlisted?: boolean;
  farmerDetail?: {
    name: string;
    district: string;
    verified: boolean;
    phone?: string;
    responseTime?: string;
    totalSales?: number;
    memberSince?: string;
  };
  posted?: string;
  createdAt: string;
  updatedAt: string;
}

/** GET /listings?farmer_id={farmerId} — all active listings for a farmer */
export function fetchFarmerListings(farmerId: string, token?: string | null) {
  return api.get<ListingOut[]>(`listings?farmer_id=${farmerId}&limit=50`, token);
}

// ── Payouts ───────────────────────────────────────────────────────────────────

export interface PayoutOut {
  id: string;
  orderId: string;
  buyerName: string;
  product: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  paidAt?: string;
  createdAt: string;
}

/** GET /payments/farmer/payouts */
export async function fetchMyPayouts(token: string, page = 1): Promise<PayoutRecord[]> {
  const raw = await api.get<PayoutOut[]>(`payments/farmer/payouts?page=${page}&limit=20`, token);
  return raw.map((p) => ({
    id: p.id,
    amount: p.amount,
    orderId: p.orderId,
    buyerName: p.buyerName,
    product: p.product,
    status: p.status,
    paidAt: p.paidAt,
    createdAt: p.createdAt,
  }));
}

// ── Reviews / Ratings ─────────────────────────────────────────────────────────

export interface CreateReviewPayload {
  rating: number;
  body: string;
}

export interface FarmerReviewOut {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerInitials: string;
  rating: number;
  body: string;
  createdAt: string;
  helpful: number;
  isHelpfulByMe?: boolean;
}

/** POST /users/{farmerId}/reviews */
export function postFarmerReview(farmerId: string, payload: CreateReviewPayload, token: string) {
  return api.post<FarmerReviewOut>(`users/${farmerId}/reviews`, payload, token);
}

/** GET /users/{farmerId}/reviews */
export function fetchFarmerReviews(farmerId: string, token?: string | null) {
  return api.get<FarmerReviewOut[]>(`users/${farmerId}/reviews`, token);
}

/** POST /users/reviews/{reviewId}/helpful */
export function toggleReviewHelpful(reviewId: string, token: string) {
  return api.post<{ helpful: number }>(`users/reviews/${reviewId}/helpful`, {}, token);
}

// ── Profile update ────────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  district?: string;
  village?: string;
  avatarUrl?: string;
  farmerBio?: string;
  farmName?: string;
  specialties?: string[];
  interests?: string[];
}

/** PUT /users/me */
export function updateMyProfile(payload: UpdateProfilePayload, token: string) {
  return api.put(`users/me`, payload, token);
}
