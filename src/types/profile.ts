// ── User role
export type UserRole = "buyer" | "farmer" | "both";

// ── Verification status
export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

// ── Auth user (logged-in user — private)
export interface AuthenticatedUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  district: string;
  village?: string;
  role: UserRole;
  verified: boolean;
  verificationStatus: VerificationStatus;
  memberSince: string; // ISO
  // Farmer-specific
  farmerBio?: string;
  farmName?: string;
  // Stats — populated by API
  totalOrders?: number; // buyer
  totalSpent?: number; // buyer (UGX)
  wishlistCount?: number; // buyer
  totalListings?: number; // farmer
  totalSales?: number; // farmer (units sold)
  totalEarned?: number; // farmer (UGX)
  pendingPayout?: number; // farmer (UGX)
  averageRating?: number; // farmer
  totalReviews?: number; // farmer
}

// ── Public farmer profile (seen by anyone)
export interface FarmerProfile {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  district: string;
  village?: string;
  verified: boolean;
  farmerBio?: string;
  farmName?: string;
  specialties: string[];
  memberSince: string;
  totalListings: number;
  totalSales: number;
  averageRating: number;
  totalReviews: number;
  responseTime?: string;
  isFollowedByMe?: boolean;
  isRatedByMe?: number | null;
}

// ── Farmer review (on farmer profile)
export interface FarmerReview {
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

// ── Order summary (buyer's order history)
export interface OrderSummaryItem {
  id: string;
  productName: string;
  productImage: string;
  farmer: string;
  quantity: number;
  unit: string;
  total: number;
  status: "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled";
  createdAt: string;
}

// ── Payout record (farmer earnings)
export interface PayoutRecord {
  id: string;
  amount: number;
  orderId: string;
  buyerName: string;
  product: string;
  status: "pending" | "paid" | "failed";
  paidAt?: string;
  createdAt: string;
}

// ── Settings ─
export type ThemePreference = "light" | "dark" | "system";

export interface UserSettings {
  theme: ThemePreference;
  notificationsEmail: boolean;
  notificationsSms: boolean;
  notificationsPush: boolean;
  language: "en" | "lg" | "sw"; // English, Luganda, Swahili
  currency: "UGX";
}

// ── Auth API payloads

export interface LoginPayload {
  email: string;
  password: string;
}

interface BaseRegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  district: string;
  role: UserRole;
}

export interface FarmerRegisterPayload extends BaseRegisterPayload {
  role: "farmer" | "both";
  specialties: string[]; // max 3
}

export interface BuyerRegisterPayload extends BaseRegisterPayload {
  role: "buyer" | "both";
  interests: string[];
}

// Discriminated union — TypeScript enforces specialties only for farmer/both
export type RegisterPayload = FarmerRegisterPayload | BuyerRegisterPayload;

// ── Auth API responses

export interface AuthTokens {
  tokens: {
    access_token: string;
    token_type: string; // "bearer";
  };
  user: AuthenticatedUser;
}
