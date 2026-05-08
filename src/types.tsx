export interface PricePrediction {
  crop: string;
  current: string;
  predicted: string;
  trend: "up" | "down";
  confidence: number;
}

export interface Farmer {
  id: number;
  name: string;
  avatar: string;
  avatarUrl?: string;
  verified: boolean;
  badge: string;
  location: string;
  rating: number;
  produce: string[];
  online?: boolean;
  reviews?: number;
  price?: string;
}
export interface MarketProduct {
  id: number;
  name: string;
  farmer: string;
  img: string;
  badge?: string;
  price: string;
  priceValue: number; // raw number for price range filter
  rating: number;
  qty: string;
  category: string;
}

export interface Article {
  id: number;
  img: string;
  tag: string;
  title: string;
  author: string;
  readTime: string;
}

export type PostCategory =
  | "Soil & Crops"
  | "Livestock"
  | "AgriTech"
  | "Sustainability"
  | "Business"
  | "Irrigation";

export interface PostSection {
  type: "paragraph" | "heading" | "quote" | "image";
  content: string; // text for paragraph/heading/quote; URL for image
  caption?: string; // only used when type === "image"
  attribution?: string; // only used when type === "quote"
}

export type Post = {
  // ── Existing fields (unchanged) ──────────────────────────────────────────
  id: string;
  slug: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  likes: number;
  comments: number; // total count (denormalised)
  readTime: string;
  publishedAt: string; // ISO date string

  // ── New fields for single-post view (all optional) ────────────────────────
  authorInitials?: string;
  authorBio?: string;
  isLikedByMe?: boolean; // scoped to logged-in user; defaults to false
  body?: PostSection[]; // structured article content
  tags?: string[];
};

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorInitials: string;
  body: string;
  likes: number;
  isLikedByMe: boolean;
  createdAt: string; // ISO string — format on display
}

// ─── Auth user stub (replace with your real auth type) ───────────────────────

export interface AuthUser {
  id: string;
  name: string;
  initials: string;
}

//Products
export interface ProductReview {
  id: string;
  reviewer: string;
  reviewerInitials: string;
  rating: number; // 0–5
  body: string;
  createdAt: string; // ISO
  helpful: number; // "X found this helpful" count
  isHelpfulByMe?: boolean;
}

// ─── Farmer (expanded from flat fields) ───────────────────────────────────────

export interface ProductFarmer {
  name: string;
  district: string;
  verified: boolean;
  phone?: string; // optional — shown on detail page
  responseTime?: string; // e.g. "Usually replies in 2h"
  totalSales?: number;
  memberSince?: string; // ISO
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  // ── Existing fields (unchanged — do NOT remove) ──────────────────────────
  id: string | number;
  name: string;
  category: string;
  image: string; // URL or emoji
  img: string; // alias for compatibility
  badge?: string;
  farmer: string; // kept flat for card components
  district: string; // kept flat for card components
  verified: boolean;
  price: number;
  priceValue: number;
  unit: string;
  qty: number;
  qtyDisplay: string;
  rating: number;
  fresh: boolean;

  // ── New optional fields (detail page only) ────────────────────────────────
  slug?: string;
  description?: string;
  images?: string[]; // gallery — falls back to [image] if absent
  minimumOrder?: number;
  harvestDate?: string; // ISO
  storage?: string;
  reviews?: ProductReview[];
  reviewCount?: number; // denormalised total
  isWishlisted?: boolean;
  farmerDetail?: ProductFarmer; // richer farmer object for detail page
  tags?: string[];
  posted?: string; // e.g. "3 days ago"
  // Pricing tiers — for bulk discounts
  priceTiers?: { minQty: number; price: number; label: string }[];
  createdAt: string;
}

//Cart Types
export interface CartItem {
  // ── Identity ────────────────────────────────────────────────────────────
  cartItemId: string; // unique per cart line (uuid or `${productId}-${Date.now()}`)
  productId: string | number; // references Product.id

  // ── Snapshot of product at time of adding ────────────────────────────────
  // Product
  name: string;
  image: string;
  farmer: string;
  district: string;
  verified: boolean;
  unit: string;
  category: string;

  // ── Pricing ─────────────────────────────────────────────────────────────
  unitPrice: number; // price per unit at time of adding (UGX)
  quantity: number; // how many units the buyer wants
  subtotal: number; // unitPrice × quantity (kept in sync)

  // ── Constraints ─────────────────────────────────────────────────────────
  minimumOrder: number; // Product.minimumOrder ?? 1
  availableQty: number; // Product.qty — used for max validation

  // ── Meta ────────────────────────────────────────────────────────────────
  addedAt: string; // ISO — when it was added
  isSelected: boolean; // for selective checkout (check/uncheck items)
}

// ─── Cart Summary ─────────────────────────────────────────────────────────────
// Derived values — computed from CartItem[], never stored separately.

export interface CartSummary {
  itemCount: number; // total number of line items
  totalUnits: number; // sum of all quantities
  subtotal: number; // sum of all CartItem.subtotal (UGX)
  deliveryFee: number; // flat or calculated (UGX)
  total: number; // subtotal + deliveryFee
  selectedCount: number; // how many items are checked for checkout
  selectedSubtotal: number; // subtotal of checked items only
}

// ─── Cart State (for Zustand) ─────────────────────────────────────────────────

export interface CartState {
  items: CartItem[];
  isOpen: boolean; // drawer/sheet open state
  isLoading: boolean;
  error: string | null;
}

// ─── Add to Cart Payload ──────────────────────────────────────────────────────
// What you pass when calling addToCart() — built from Product + chosen quantity.

export interface AddToCartPayload {
  product: Pick<
    Product,
    "id" | "name" | "image" | "farmer" | "district" | "verified" | "unit" | "category" | "qty"
  > & {
    minimumOrder?: number;
  };
  quantity: number;
  unitPrice: number; // effectivePrice at time of adding
}

// ─── Checkout Payload ─────────────────────────────────────────────────────────
// Shape to POST to your backend when the user confirms an order.

export interface CheckoutPayload {
  items: {
    productId: string | number;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  currency: "UGX";
}

// ─── Delivery Address ─────────────────────────────────────────────────────────

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  district: string;
  subCounty?: string;
  village?: string;
  landmark?: string;
}

// ─── Payment Method ───────────────────────────────────────────────────────────

export type PaymentMethodType = "mobile_money" | "cash_on_delivery" | "bank_transfer";

export interface PaymentMethod {
  type: PaymentMethodType;
  provider?: "MTN" | "Airtel"; // for mobile_money
  phoneNumber?: string; // for mobile_money
  accountName?: string; // for bank_transfer
}

// ─── Order (response from backend after checkout) ─────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  status: OrderStatus;
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: "UGX";
  createdAt: string; // ISO
  updatedAt: string; // ISO
  estimatedDelivery?: string; // ISO
}
