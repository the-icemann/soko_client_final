import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { BadgeCheck, MapPin, MessageCircle, Star, TrendingUp } from "lucide-react";

import { startConversation } from "@/api/search.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { FarmerProfile } from "@/types/profile";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatSales(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface Props {
  farmer: FarmerProfile;
}

export function FarmerResultCard({ farmer }: Props) {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  /* Start / retrieve conversation then navigate to messages */
  const { mutate: chat, isPending: chatting } = useMutation({
    mutationFn: () => {
      if (!token) throw new Error("Sign in to message farmers");
      return startConversation(farmer.id, token);
    },
    onSuccess: (conv) => navigate({ to: "/messages", search: { conversationId: conv.id } }),
  });

  const specialties = farmer.farmerBio
    ? []
    : ((farmer as unknown as { specialties?: string[] }).specialties ?? []);

  return (
    <Card
      onClick={() => navigate({ to: "/farmers/$id", params: { id: farmer.id } })}
      className="border border-border/60 bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      <CardContent className="p-4 flex gap-3 items-start">
        {/* Avatar */}
        <Avatar className="size-12 ring-2 ring-primary/20 shrink-0">
          {farmer.avatarUrl && <AvatarImage src={farmer.avatarUrl} alt={farmer.name} />}
          <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
            {initials(farmer.name)}
          </AvatarFallback>
        </Avatar>

        {/* Main info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Name + verified */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {farmer.farmName ?? farmer.name}
            </h3>
            {farmer.verified && <BadgeCheck size={14} className="text-primary shrink-0" />}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{farmer.district}</span>
          </div>

          {/* Rating + sales */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={cn(
                    i < Math.floor(farmer.averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted-foreground/30"
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                {farmer.averageRating.toFixed(1)}
                {farmer.totalReviews > 0 && ` · ${farmer.totalReviews} reviews`}
              </span>
            </div>
            {farmer.totalSales > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <TrendingUp size={10} />
                {formatSales(farmer.totalSales)} sales
              </span>
            )}
          </div>

          {/* Specialties */}
          {specialties.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {specialties.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-[10px] rounded-full">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {/* Bio snippet */}
          {farmer.farmerBio && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {farmer.farmerBio}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {farmer.responseTime && (
            <span className="text-[10px] text-muted-foreground text-right leading-tight max-w-20">
              {farmer.responseTime}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={chatting}
            className="h-8 rounded-xl gap-1.5 text-xs border-border/60 hover:bg-primary/5 hover:border-primary/40"
            onClick={(e) => {
              e.stopPropagation(); // don't navigate to farmer profile
              chat();
            }}
          >
            <MessageCircle size={12} />
            {chatting ? "…" : "Chat"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
