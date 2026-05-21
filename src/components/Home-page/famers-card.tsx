import { BadgeCheck, MapPin, MessageCircle, Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Farmer } from "@/types";

//── Star Rating
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
    <span className="ml-1 text-[10px] text-muted-foreground">{rating}</span>
  </div>
);

//── Farmer Card
export const FarmerCard = ({
  farmer,
  onClick,
  onMessage,
}: {
  farmer: Farmer;
  onClick?: () => void;
  onMessage?: () => void;
}) => {
  return (
    <Card
      className="w-42 shrink-0 cursor-pointer shadow-sm transition-shadow hover:shadow-md mt-2"
      onClick={onClick}
    >
      <CardContent className="flex flex-col gap-2 p-3.5">
        {/* Avatar + name row */}
        <div className="flex items-center gap-2">
          {/* Online indicator wraps the avatar */}
          <div className="relative shrink-0">
            <Avatar className="size-9">
              <AvatarImage src={farmer.avatarUrl} alt={farmer.name} />
              <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                {farmer.avatar}
              </AvatarFallback>
            </Avatar>
            {farmer.online && (
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
            )}
          </div>

          {/* Name + verified */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-foreground">{farmer.name}</p>
            {farmer.verified && (
              <div className="flex items-center gap-1">
                <BadgeCheck className="size-3 text-primary" />
                <span className="text-[9px] font-medium text-primary">Verified</span>
              </div>
            )}
          </div>
        </div>

        {/* Category badge */}
        <Badge variant="secondary" className="w-fit text-[10px]">
          {farmer.badge}
        </Badge>

        {/* Location */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="size-2.5 shrink-0" />
          <span className="truncate">{farmer.location}</span>
        </div>

        {/* Star rating */}
        <StarRating rating={farmer.rating} />

        {/* Produce tags */}
        <p className="truncate text-[10px] text-muted-foreground">{farmer.produce.join(" · ")}</p>

        {/* Connect button — only shown on recommendation cards */}
        {onMessage && (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-7 text-[10px] gap-1 rounded-lg mt-0.5"
            onClick={(e) => {
              e.stopPropagation();
              onMessage();
            }}
          >
            <MessageCircle className="size-3" />
            Connect
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
