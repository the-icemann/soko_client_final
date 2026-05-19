import { useNavigate } from "@tanstack/react-router";
import { Sparkle, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { useMessagesStore } from "@/store/useMessagesStore";

import { FarmerCard } from "./famers-card";

// ── Shapes returned by recommendation service ──────────────────────────────

interface RecFarmer {
  id: string;
  name: string;
  district: string;
  specialties: string[];
  averageRating: number;
  totalSales: number;
  totalListings: number;
  matchScore: number;
}

interface RecBuyer {
  id: string;
  name: string;
  district: string;
  interests: string[];
  totalOrders: number;
  matchScore: number;
}

// ── Adapters ───────────────────────────────────────────────────────────────

function farmerFromRec(f: RecFarmer) {
  const initials = f.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: f.id,
    name: f.name,
    avatar: initials,
    avatarUrl: "",
    online: false,
    verified: false,
    badge: f.specialties[0] ?? "Farmer",
    location: f.district,
    rating: f.averageRating || 3.5,
    produce: f.specialties.slice(0, 3),
    matchScore: f.matchScore,
  };
}

function buyerFromRec(b: RecBuyer) {
  const initials = b.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: b.id,
    name: b.name,
    avatar: initials,
    avatarUrl: "",
    online: false,
    verified: false,
    badge: b.interests[0] ?? "Buyer",
    location: b.district,
    rating: 3.5,
    produce: b.interests.slice(0, 3),
    matchScore: b.matchScore,
  };
}

// ── Skeleton row ───────────────────────────────────────────────────────────

function RecommendationSkeleton() {
  return (
    <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 pb-2 no-scrollbar">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="w-42 h-36 shrink-0 rounded-xl" />
      ))}
    </div>
  );
}

// ── Main section ───────────────────────────────────────────────────────────

const AIMatchedFarmersSection = () => {
  const { user, token } = useAuthStore();
  const isFarmer = useAuthStore((s) => s.isFarmer());
  const isBuyer = useAuthStore((s) => s.isBuyer());
  const navigate = useNavigate();
  const { startConversation, setActiveConversation } = useMessagesStore();

  const [farmers, setFarmers] = useState<ReturnType<typeof farmerFromRec>[]>([]);
  const [buyers, setBuyers] = useState<ReturnType<typeof buyerFromRec>[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleConnect(
    recipientId: string,
    recipientName: string,
    isBuyerRecipient: boolean,
  ) {
    const firstName = recipientName.split(" ")[0];
    const greeting = isBuyerRecipient
      ? `Hi ${firstName}, I grow produce matching your interests. Let's connect on Soko!`
      : `Hi ${firstName}, I'm interested in what you grow. Let's connect on Soko!`;
    const conversationId = await startConversation(recipientId, greeting);
    setActiveConversation(conversationId);
    navigate({ to: "/messages" });
  }

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const fetches: Promise<void>[] = [];

    if (isBuyer || useAuthStore.getState().isBoth()) {
      fetches.push(
        fetch(`/ml/recommend/farmers-for-buyer/${user.id}?top_n=6`, { headers })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.recommended_farmers) {
              setFarmers(data.recommended_farmers.map(farmerFromRec));
            }
          })
          .catch(() => {})
      );
    }

    if (isFarmer || useAuthStore.getState().isBoth()) {
      fetches.push(
        fetch(`/ml/recommend/buyers-for-farmer/${user.id}?top_n=6`, { headers })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.recommended_buyers) {
              setBuyers(data.recommended_buyers.map(buyerFromRec));
            }
          })
          .catch(() => {})
      );
    }

    Promise.all(fetches).finally(() => setLoading(false));
  }, [user?.id]);

  if (!user) return null;

  return (
    <div className="space-y-5">
      {/* ── AI-Matched Farmers (shown to buyers) ── */}
      {(isBuyer || useAuthStore.getState().isBoth()) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkle size={13} className="text-foreground" />
              <h3 className="text-foreground font-semibold text-sm">AI-Matched Farmers</h3>
            </div>
          </div>

          {loading ? (
            <RecommendationSkeleton />
          ) : farmers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No matched farmers yet — update your interests in your profile.
            </p>
          ) : (
            <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 pb-2 no-scrollbar">
              {farmers.map((f) => (
                <FarmerCard
                  key={f.id}
                  farmer={f}
                  onClick={() => navigate({ to: "/farmers/$id", params: { id: String(f.id) } })}
                  onMessage={() => handleConnect(String(f.id), f.name, false)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── AI-Matched Buyers (shown to farmers) ── */}
      {(isFarmer || useAuthStore.getState().isBoth()) && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users size={13} className="text-foreground" />
              <h3 className="text-foreground font-semibold text-sm">AI-Matched Buyers</h3>
            </div>
          </div>

          {loading ? (
            <RecommendationSkeleton />
          ) : buyers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No matched buyers yet — add your specialties in your profile.
            </p>
          ) : (
            <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 pb-2 no-scrollbar">
              {buyers.map((b) => (
                <FarmerCard
                  key={b.id}
                  farmer={b}
                  onClick={() => navigate({ to: "/buyers/$id", params: { id: String(b.id) } })}
                  onMessage={() => handleConnect(String(b.id), b.name, true)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMatchedFarmersSection;
