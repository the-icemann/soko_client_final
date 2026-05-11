import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useMessagesStore } from "@/store/useMessagesStore";
import type { MarketProduct } from "@/types";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={cn(
          "size-2.5",
          s <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
        )}
      />
    ))}
  </div>
);

export const MarketProductCard = ({ product }: { product: MarketProduct }) => {
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

    // ── Not logged in ─────────────────────────────────────────────────────
    if (!isAuthenticated()) {
      navigate({ to: "/auth/sign-in" });
      return;
    }

    // ── Clicked own listing ───────────────────────────────────────────────
    if (product.farmerId && product.farmerId === user?.id) {
      showWarning("This is your own listing.");
      return;
    }

    // ── Farmer-to-farmer block ────────────────────────────────────────────
    if (isFarmer() && !isBuyer()) {
      showWarning("Farmers can't message other farmers here.");
      return;
    }

    // ── Missing farmerId (data gap) ───────────────────────────────────────
    if (!product.farmerId) {
      showWarning("Unable to contact this farmer right now.");
      return;
    }

    // ── Happy path: start or resume conversation ──────────────────────────
    setChatLoading(true);
    try {
      const conversationId = await startConversation(
        product.farmerId,
        `Hi, I'm interested in your listing: ${product.name}`,
        String(product.id)
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
      {warningMsg && (
        <div className="absolute -top-9 left-0 right-0 z-20 mx-auto flex w-max max-w-full items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] font-medium text-amber-800 shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
          <MessageCircle size={10} className="shrink-0" />
          {warningMsg}
        </div>
      )}

      <Card className="overflow-hidden shadow-sm">
        {/* Image */}
        <div className="relative flex h-28 items-center justify-center text-5xl">{product.img}</div>

        <CardContent className="flex flex-col gap-1.5 p-2.5">
          {/* Name */}
          <p className="truncate text-[11px] font-bold text-foreground">{product.name}</p>

          {/* Farmer name */}
          <button
            type="button"
            className="w-fit text-[10px] font-medium text-primary hover:underline"
          >
            {product.farmer}
          </button>

          {/* Price + rating */}
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold text-primary">{product.price}</p>
            <StarRating rating={product.rating} />
          </div>

          {/* Qty */}
          <p className="text-[10px] text-muted-foreground">{product.qty}</p>

          {/* Actions row */}
          <div className="mt-1 flex gap-1.5">
            <Button size="sm" className="h-7 flex-1 gap-1 text-[11px] font-bold">
              <ShoppingCart className="size-3" />
              Add to Cart
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="h-7 w-8 shrink-0 px-0"
              onClick={handleChat}
              disabled={chatLoading}
              title={`Chat with ${product.farmer}`}
            >
              <MessageCircle
                className={cn("size-3", chatLoading && "animate-pulse text-primary")}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
