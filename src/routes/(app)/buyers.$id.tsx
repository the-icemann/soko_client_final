import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, Calendar, MapPin, ShoppingBasket } from "lucide-react";

import { api } from "@/api/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/(app)/buyers/$id")({
  component: RouteComponent,
});

interface BuyerPublicProfile {
  id:          string;
  name:        string;
  initials:    string;
  avatarUrl?:  string;
  district:    string;
  verified:    boolean;
  interests:   string[];
  memberSince: string;
  totalOrders: number | null;
}

function useBuyerProfile(id: string) {
  const token = useAuthStore((s) => s.token);
  return useQuery<BuyerPublicProfile>({
    queryKey: ["buyer-profile", id],
    queryFn:  () => api.get<BuyerPublicProfile>(`users/buyers/${id}`, token),
    enabled:  !!id,
    staleTime: 1000 * 60 * 5,
  });
}

function BuyerSkeleton() {
  return (
    <div className="space-y-4 pt-4">
      <Skeleton className="h-36 w-full rounded-3xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: buyer, isLoading, error } = useBuyerProfile(id);

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-4 pb-24">
        <BuyerSkeleton />
      </div>
    );
  }

  if (error || !buyer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Buyer profile not found.</p>
      </div>
    );
  }

  const joined = new Date(buyer.memberSince).toLocaleDateString("en-UG", {
    month: "long",
    year:  "numeric",
  });

  return (
    <div className="min-h-screen bg-background pt-4 pb-24">
      <div className="max-w-lg mx-auto px-4 space-y-5">
        {/* Back */}
        <Link
          to="/home"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </Link>

        {/* Hero card */}
        <div className="rounded-3xl bg-gradient-to-br from-sky-900 via-sky-800 to-sky-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 ring-2 ring-white/30">
              <AvatarImage src={buyer.avatarUrl} alt={buyer.name} />
              <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                {buyer.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">{buyer.name}</h1>
              {buyer.verified && (
                <div className="flex items-center gap-1 mt-0.5">
                  <BadgeCheck className="size-3.5 text-sky-300" />
                  <span className="text-xs text-sky-200 font-medium">Verified Buyer</span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-1 text-sky-200 text-xs">
                <MapPin className="size-3" />
                <span>{buyer.district || "Uganda"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-1 py-4">
              <ShoppingBasket className="size-5 text-primary" />
              <p className="text-xl font-bold">{buyer.totalOrders ?? 0}</p>
              <p className="text-xs text-muted-foreground">Orders placed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-1 py-4">
              <Calendar className="size-5 text-primary" />
              <p className="text-sm font-bold text-center leading-tight">{joined}</p>
              <p className="text-xs text-muted-foreground">Member since</p>
            </CardContent>
          </Card>
        </div>

        {/* Interests */}
        {buyer.interests.length > 0 && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <h2 className="text-sm font-semibold">Looking to buy</h2>
              <div className="flex flex-wrap gap-2">
                {buyer.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
