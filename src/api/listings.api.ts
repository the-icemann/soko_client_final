import { api } from "@/api/api";
import { Product } from "@/types";

const BASE = "listings";

// ── Query param shape ─────────────────────────────────────────────────────────

export interface ListingParams {
  category?: string;
  district?: string;
  fresh?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Backend response types ────────────────────────────────────────────────────
// These mirror the ListingOut / ProductReviewOut schemas from the produce service.

export interface ListingImageOut {
  id: string;
  url: string;
  order: number;
}

export interface PriceTierOut {
  minQty: number;
  price: number;
  label: string;
}

export interface ListingOut {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  district: string;
  village?: string;
  price: number;
  unit: string;
  availableQty: number;
  totalQty: number;
  minimumOrder: number;
  fresh: boolean;
  badge?: string;
  tags?: string[];
  harvestDate?: string;
  storageNotes?: string;
  status: "draft" | "active" | "archived";
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  // Farmer snapshot
  farmerId: string;
  farmerName: string;
  farmerDistrict: string;
  farmerVerified: boolean;
  farmerPhone?: string;
  farmerResponseTime?: string;
  farmerMemberSince?: string;
  farmerTotalSales?: number;
  // Relations
  images: ListingImageOut[];
  priceTiers: PriceTierOut[];
}

export interface ReviewOut {
  id: string;
  reviewer: string;
  reviewerInitials: string;
  rating: number;
  body: string;
  createdAt: string;
  helpful: number;
  isHelpfulByMe?: boolean;
}

// ── Mapper: ListingOut → Product ──────────────────────────────────────────────
// Maps the backend shape to the existing Product type so all components work
// without changes.

export function listingToProduct(l: ListingOut): Product {
  const primaryImage = l.images?.[0]?.url ?? "";
  const allImages = l.images?.map((i) => i.url) ?? [];

  return {
    id: l.id,
    slug: l.slug,
    name: l.name,
    category: l.category,
    description: l.description,
    image: primaryImage,
    img: primaryImage, // alias
    badge: l.badge,
    farmer: l.farmerName,
    farmerId: l.farmerId,
    district: l.district,
    verified: l.farmerVerified,
    price: l.price,
    priceValue: l.price,
    unit: l.unit,
    qty: l.availableQty,
    qtyDisplay: `${l.availableQty.toLocaleString()} ${l.unit} available`,
    rating: l.averageRating,
    fresh: l.fresh,
    // Detail-only fields
    images: allImages,
    minimumOrder: l.minimumOrder,
    harvestDate: l.harvestDate,
    storage: l.storageNotes,
    reviewCount: l.reviewCount,
    tags: l.tags ?? [],
    priceTiers: l.priceTiers ?? [],
    farmerDetail: {
      name: l.farmerName,
      district: l.farmerDistrict,
      verified: l.farmerVerified,
      phone: l.farmerPhone,
      responseTime: l.farmerResponseTime,
      memberSince: l.farmerMemberSince,
      totalSales: l.farmerTotalSales,
    },
    // Not returned by backend — defaults
    createdAt: l.createdAt,
    isWishlisted: false,
    posted: formatPosted(l.createdAt),
  };
}

function formatPosted(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// ── API calls ─────────────────────────────────────────────────────────────────

/** GET /listings/?category=&district=&... */
export async function fetchListings(
  params: ListingParams = {},
  token?: string | null
): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.district && params.district !== "All") qs.set("district", params.district);
  if (params.fresh !== undefined) qs.set("fresh", String(params.fresh));
  if (params.minPrice !== undefined) qs.set("min_price", String(params.minPrice));
  if (params.maxPrice !== undefined) qs.set("max_price", String(params.maxPrice));
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));

  const query = qs.toString();
  return api.get<Product[]>(`${BASE}/${query ? `?${query}` : ""}`, token);
}

/** GET /listings/slug/{slug} */
export async function fetchListingBySlug(slug: string, token?: string | null): Promise<Product> {
  return api.get<Product>(`${BASE}/slug/${slug}`, token);
}

/** GET /listings/farmer/{farmerId} */
export async function fetchFarmerListings(
  farmerId: string,
  token?: string | null,
  page = 1
): Promise<Product[]> {
  return api.get<Product[]>(`${BASE}/farmer/${farmerId}?page=${page}&limit=20`, token);
}

/** GET /listings/{listingId}/reviews */
export async function fetchReviews(
  listingId: string,
  token?: string | null,
  page = 1
): Promise<ReviewOut[]> {
  return api.get<ReviewOut[]>(`${BASE}/${listingId}/reviews?page=${page}&limit=10`, token);
}

/** POST /listings/{listingId}/reviews */
export async function submitReview(
  listingId: string,
  payload: { rating: number; body: string },
  token: string
): Promise<ReviewOut> {
  return api.post<ReviewOut>(`${BASE}/${listingId}/reviews`, payload, token);
}

/** POST /listings/reviews/{reviewId}/helpful */
export async function toggleReviewHelpful(
  reviewId: string,
  token: string
): Promise<{ helpful: number }> {
  return api.post<{ helpful: number }>(`${BASE}/reviews/${reviewId}/helpful`, {}, token);
}

/** GET /listings/price-suggestion */
export async function fetchPriceSuggestion(
  category: string,
  unit: string,
  district?: string,
  token?: string | null
) {
  const qs = new URLSearchParams({ category, unit });
  if (district) qs.set("district", district);
  return api.get<{
    min: number;
    max: number;
    suggested: number;
    basis: string;
  }>(`${BASE}/price-suggestion?${qs.toString()}`, token);
}

export async function fetchMyListings(token: string, status?: string): Promise<Product[]> {
  const qs = status ? `?status=${status}` : "";
  return api.get<Product[]>(`${BASE}/me${qs}`, token);
}
