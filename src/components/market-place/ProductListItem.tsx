import { useNavigate } from "@tanstack/react-router";
import { BadgeCheck, MapPin, MessageCircle, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useMessagesStore } from "@/store/useMessagesStore";
import type { Product } from "@/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

// ── Inline warning banner ─────────────────────────────────────────────────────

function ChatWarning({ message }: { message: string }) {
  return (
    <div className="absolute -top-9 right-0 z-20 flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-[11px] font-medium rounded-lg px-3 py-1.5 shadow-md whitespace-nowrap animate-in fade-in slide-in-from-top-1 duration-150">
      <MessageCircle size={11} className="shrink-0" />
      {message}
    </div>
  );
}

export function ProductListItem({ product: p }: { product: Product }) {
  const navigate = useNavigate();
  const { isFarmer, isBuyer, isAuthenticated, user } = useAuthStore();
  const { startConversation, setActiveConversation } = useMessagesStore();

  const [chatLoading, setChatLoading] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const showWarning = (msg: string) => {
    setWarningMsg(msg);
    setTimeout(() => setWarningMsg(null), 3500);
  };

  const handleChat = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // ── Guard: not logged in ──────────────────────────────────────────────
    if (!isAuthenticated()) {
      navigate({ to: "/auth/sign-in" });
      return;
    }

    // ── Guard: own listing ────────────────────────────────────────────────
    if (p.farmerId && p.farmerId === user?.id) {
      showWarning("This is your own listing.");
      return;
    }

    // ── Guard: farmer-to-farmer ───────────────────────────────────────────
    //    isFarmer() is true for "farmer" AND "both" roles.
    //    A "both" user acting as a buyer should still be allowed — adjust
    //    the condition below if your UX treats "both" as buyer-capable.
    if (isFarmer() && !isBuyer()) {
      showWarning("Farmers can't message other farmers here.");
      return;
    }

    // ── Guard: no farmerId on the product (data issue) ────────────────────
    if (!p.farmerId) {
      showWarning("Unable to contact this farmer right now.");
      return;
    }

    // ── Happy path ────────────────────────────────────────────────────────
    setChatLoading(true);
    try {
      const conversationId = await startConversation(
        p.farmerId,
        `Hi, I'm interested in your listing: ${p.name}`,
        String(p.id) // listingId — cast to string if your backend expects it
      );
      setActiveConversation(conversationId);
      navigate({ to: "/messages" });
    } catch {
      showWarning("Couldn't start conversation. Try again.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Warning tooltip — floats above the card */}
      {warningMsg && <ChatWarning message={warningMsg} />}

      <Card
        className="border border-border bg-card cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 group"
        onClick={() => navigate({ to: `/marketplace/${p.slug}` })}
      >
        <CardContent className="p-3.5 flex gap-4 items-center flex-wrap">
          {/* thumbnail */}
          <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            <img src={p.image} alt={p.name} />
          </div>

          {/* info */}
          <div className="flex-1 min-w-40 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                {p.name}
              </h3>
              {p.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
              <Badge variant="outline" className="text-[10px] ml-auto shrink-0">
                {p.category}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-[8px] font-bold">
                  {getInitials(p.farmer)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-muted-foreground truncate">{p.farmer}</span>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <MapPin className="w-2.5 h-2.5 text-muted-foreground/60 shrink-0" />
              <span className="text-[11px] text-muted-foreground shrink-0">{p.district}</span>
            </div>

            <StarRating rating={p.rating} />
          </div>

          {/* price + actions */}
          <div className={cn("flex items-center gap-4 shrink-0 ml-auto")}>
            <div className="text-right">
              <p className="text-base font-extrabold text-primary leading-none">
                UGX {p.price.toLocaleString()}
              </p>
              <span className="text-[11px] text-muted-foreground">/{p.unit}</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="h-8 text-xs px-4 gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: `/marketplace/${p.slug}` });
                }}
              >
                <ShoppingCart size={12} />
                Buy
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs px-4 gap-1.5"
                onClick={handleChat}
                disabled={chatLoading}
              >
                <MessageCircle size={12} className={chatLoading ? "animate-pulse" : ""} />
                {chatLoading ? "Starting…" : "Chat"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
