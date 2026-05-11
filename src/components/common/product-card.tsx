import { useNavigate } from "@tanstack/react-router";
import { BadgeCheck, MapPin, MessageCircle, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useMessagesStore } from "@/store/useMessagesStore";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <Star
              key={i}
              size={12}
              className={cn(
                "transition-colors",
                filled
                  ? "fill-amber-400 text-amber-400"
                  : partial
                    ? "fill-amber-200 text-amber-300"
                    : "fill-muted text-muted-foreground/30"
              )}
            />
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground font-medium tabular-nums">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProductCard({ product: p, className }: ProductCardProps) {
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

    if (!isAuthenticated()) {
      navigate({ to: "/auth/sign-in" });
      return;
    }

    if (p.farmerId && p.farmerId === user?.id) {
      showWarning("This is your own listing.");
      return;
    }

    if (isFarmer() && !isBuyer()) {
      showWarning("Farmers can't message other farmers here.");
      return;
    }

    if (!p.farmerId) {
      showWarning("Unable to contact this farmer right now.");
      return;
    }

    setChatLoading(true);
    try {
      const conversationId = await startConversation(
        p.farmerId,
        `Hi, I'm interested in your listing: ${p.name}`,
        String(p.id)
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
    <TooltipProvider delayDuration={300}>
      <div className="relative">
        {/* Warning tooltip — floats above the card */}
        {warningMsg && (
          <div className="absolute -top-9 left-0 right-0 z-20 mx-auto flex w-max max-w-[90%] items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[10px] font-medium text-amber-800 shadow-md animate-in fade-in slide-in-from-top-1 duration-150">
            <MessageCircle size={10} className="shrink-0" />
            {warningMsg}
          </div>
        )}

        <Card
          className={cn(
            "group overflow-hidden cursor-pointer border-border/60",
            "hover:shadow-md hover:shadow-emerald-900/5 hover:-translate-y-0.5",
            "transition-all duration-200 ease-out pt-0",
            className
          )}
          onClick={() => navigate({ to: `/marketplace/${p.slug}` })}
        >
          {/* ── Image area ────────────────────────────────────── */}
          <div className="relative h-32 md:h-40 flex items-center justify-center overflow-hidden">
            <span className="leading-none select-none drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img src={p.image} alt={p.name} className="" />
            </span>

            {p.fresh && (
              <Badge
                variant="secondary"
                className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 border gap-1 shadow-sm"
              >
                Fresh
              </Badge>
            )}

            {p.verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm ring-2 ring-white/80 cursor-default">
                    <BadgeCheck size={14} className="text-white fill-white/20" strokeWidth={2.5} />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="text-xs">
                  Verified farmer
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* ── Body ──────────────────────────────────────────── */}
          <CardContent className="p-2 md:p-4 space-y-1 md:space-y-3">
            {/* Name + category */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xs md:text-[15px] text-shadow-md font-semibold text-foreground leading-tight line-clamp-1">
                {p.name}
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] font-medium shrink-0 px-2 py-0.5 text-muted-foreground border-border/70 bg-muted/40"
              >
                {p.category}
              </Badge>
            </div>

            {/* Farmer + location */}
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5.5 h-5.5 ring-1 ring-border/60">
                <AvatarFallback className="text-[9px] font-bold">
                  {getInitials(p.farmer)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium truncate">{p.farmer}</span>
              <span className="text-muted-foreground/50 text-xs">·</span>
              <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0">
                <MapPin size={10} className="text-muted-foreground/60" />
                {p.district}
              </span>
            </div>

            {/* Rating */}
            <StarRating rating={p.rating} />

            {/* Price row */}
            <div className="flex flex-col">
              <div className="flex items-baseline gap-0.5">
                <span
                  className="text-[19px] font-extrabold text-primary tracking-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  UGX {p.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground mb-0.5">/{p.unit}</span>
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {p.qty.toLocaleString()} {p.unit}s avail.
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-0.5">
              <Button
                size="sm"
                className="flex-1 h-9 text-[13px] font-semibold gap-1.5 hover:bg-primary/90 active:scale-[0.97] shadow-sm rounded-lg transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate({ to: `/marketplace/${p.slug}` });
                }}
              >
                <ShoppingCart size={13} strokeWidth={2.2} />
                Buy Now
              </Button>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 w-9 p-0 rounded-lg border-border/70 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
                    onClick={handleChat}
                    disabled={chatLoading}
                    aria-label={`Message ${p.farmer}`}
                  >
                    <MessageCircle
                      size={14}
                      strokeWidth={2}
                      className={cn(chatLoading && "animate-pulse")}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {chatLoading ? "Starting chat…" : "Message farmer"}
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
