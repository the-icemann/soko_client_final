import { api } from "@/api/api";
import { listingToProduct } from "@/api/listings.api";
import type { ListingOut } from "@/api/listings.api";
import type { Product } from "@/types";
import type { FarmerProfile } from "@/types/profile";

export interface SearchFarmerResult {
  id: string;
  name: string;
  avatarUrl?: string;
  verified: boolean;
  district: string;
  specialties: string[];
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  memberSince: string;
  farmerBio?: string;
  farmName?: string;
}

/** GET /listings/?search= */
export async function searchProducts(query: string, token?: string | null): Promise<Product[]> {
  const qs = new URLSearchParams({ limit: "40" });
  if (query) qs.set("search", query);
  const listings = await api.get<ListingOut[]>(`listings/?${qs}`, token);
  return listings.map(listingToProduct);
}

/** GET /users/farmers?search=&district= */
export async function searchFarmers(
  query: string,
  district?: string,
  token?: string | null
): Promise<FarmerProfile[]> {
  const qs = new URLSearchParams({ limit: "40" });
  if (query) qs.set("search", query);
  if (district) qs.set("district", district);
  return api.get<FarmerProfile[]>(`users/farmers?${qs}`, token);
}

/** POST /conversations — start or retrieve a conversation with a farmer */
export interface StartConversationPayload {
  participant_id: string;
}

export interface ConversationOut {
  id: string;
  participants: { id: string; name: string }[];
  created_at: string;
}

export async function startConversation(farmerId: string, token: string): Promise<ConversationOut> {
  return api.post<ConversationOut>(
    "conversations",
    { participant_id: farmerId } satisfies StartConversationPayload,
    token
  );
}
