// src/routes/(app)/profile/index.tsx
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Edit3,
  LayoutDashboard,
  MapPin,
  Package,
  PenLine,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import { fetchFarmerListings, fetchMyPayouts, fetchProfileOrders } from "@/api/profile.api";
import {
  BuyerStatsRow,
  FarmerStatsRow,
  OwnProfileHero,
  SettingsPanel,
} from "@/components/profile-page/own-profile-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteListing } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Product } from "@/types";
import { OrderSummaryItem, PayoutRecord } from "@/types/profile";

export const Route = createFileRoute("/(app)/profile/")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) throw redirect({ to: "/auth/sign-in" });
  },
  component: RouteComponent,
});

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  confirmed:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  processing: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400",
  dispatched:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400",
  delivered: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  active: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted text-muted-foreground/60 border-border",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

function StatusPill({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold capitalize shrink-0", STATUS_MAP[status] ?? "")}
    >
      {status}
    </Badge>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function RowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[72px] w-full rounded-2xl" />
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  icon: Icon,
  title,
  sub,
  action,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
        <Icon size={20} className="text-muted-foreground/50" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
      {action}
    </div>
  );
}

// ─── Orders tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const { token, user } = useAuthStore();

  const { data: orders, isLoading } = useQuery<OrderSummaryItem[]>({
    queryKey: ["profile-orders"],
    queryFn: () => fetchProfileOrders(token!),
    enabled: !!token,
    staleTime: 30_000,
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Order History</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          UGX {(user?.totalSpent ?? 0).toLocaleString()} total spent
        </span>
      </div>

      {isLoading && <RowSkeleton />}

      {!isLoading && !orders?.length && (
        <EmptyState
          icon={Package}
          title="No orders yet"
          sub="Start shopping fresh produce from verified farmers"
          action={
            <Link to="/marketplace">
              <Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-8 text-xs">
                <ShoppingBag size={12} /> Browse Marketplace
              </Button>
            </Link>
          }
        />
      )}

      {!isLoading && !!orders?.length && (
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl p-3 hover:border-border transition-colors"
            >
              {/* Product image */}
              <div className="size-12 rounded-xl overflow-hidden bg-muted shrink-0">
                {order.productImage ? (
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={16} className="text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground line-clamp-1">
                  {order.productName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {order.quantity} {order.unit}
                  {order.quantity !== 1 ? "s" : ""} · {order.farmer}
                </p>
                <StatusPill status={order.status} />
              </div>

              {/* Amount + date */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-primary tabular-nums">
                  UGX {order.total.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-UG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Earnings tab ─────────────────────────────────────────────────────────────

function EarningsTab() {
  const { token, user } = useAuthStore();

  const { data: payouts, isLoading } = useQuery<PayoutRecord[]>({
    queryKey: ["profile-payouts"],
    queryFn: () => fetchMyPayouts(token!),
    enabled: !!token,
    staleTime: 30_000,
  });

  const pendingTotal =
    payouts?.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0) ??
    user?.pendingPayout ??
    0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Earnings & Payouts</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          UGX {pendingTotal.toLocaleString()} pending
        </span>
      </div>

      {/* Pending banner */}
      {pendingTotal > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-3">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            💰 <strong>UGX {pendingTotal.toLocaleString()}</strong> will be released to your mobile
            number once buyers confirm delivery.
          </p>
        </div>
      )}

      {isLoading && <RowSkeleton />}

      {!isLoading && !payouts?.length && (
        <EmptyState
          icon={Wallet}
          title="No earnings yet"
          sub="Your payouts from confirmed orders will appear here"
          action={
            <Link to="/sell">
              <Button size="sm" className="rounded-xl gap-1.5 h-8 text-xs">
                <Plus size={12} /> List a Product
              </Button>
            </Link>
          }
        />
      )}

      {!isLoading && !!payouts?.length && (
        <div className="space-y-2">
          {payouts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-3.5 py-3 hover:border-border transition-colors"
            >
              <div
                className={cn(
                  "size-9 rounded-xl flex items-center justify-center shrink-0",
                  p.status === "paid" ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Wallet
                  size={14}
                  className={p.status === "paid" ? "text-primary" : "text-muted-foreground"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-1">{p.product}</p>
                <p className="text-[11px] text-muted-foreground">{p.buyerName}</p>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <p
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    p.status === "paid" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  UGX {p.amount.toLocaleString()}
                </p>
                <StatusPill status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Listings tab ─────────────────────────────────────────────────────────────

function ListingsTab() {
  const { token, user } = useAuthStore();
  const deleteMutation = useDeleteListing();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: listings,
    isLoading,
    refetch,
  } = useQuery<Product[]>({
    queryKey: ["profile-listings", user?.id],
    queryFn: () => fetchFarmerListings(user!.id, token),
    enabled: !!token && !!user?.id,
    staleTime: 30_000,
  });

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync({ id, token });
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">My Listings</h3>
        <Link to="/sell">
          <Button size="sm" className="h-7 text-xs rounded-lg gap-1">
            <Plus size={11} /> Add
          </Button>
        </Link>
      </div>

      {isLoading && <RowSkeleton />}

      {!isLoading && !listings?.length && (
        <EmptyState
          icon={ShoppingBag}
          title="No listings yet"
          sub="List your first product to start selling on Soko"
          action={
            <Link to="/sell">
              <Button size="sm" className="rounded-xl gap-1.5 h-8 text-xs">
                <Plus size={12} /> Create Listing
              </Button>
            </Link>
          }
        />
      )}

      {!isLoading && !!listings?.length && (
        <div className="space-y-2">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl p-3 hover:border-border transition-colors group"
            >
              {/* Thumbnail */}
              <div className="size-12 rounded-xl overflow-hidden bg-muted shrink-0">
                {listing.image ? (
                  <img
                    src={listing.image}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {listing.name}
                  </p>
                  {listing.verified && <BadgeCheck size={12} className="text-primary shrink-0" />}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <StatusPill status={(listing as any).status ?? "active"} />
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    <MapPin size={9} className="text-muted-foreground/60" />
                    {listing.district}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {listing.qty.toLocaleString()} {listing.unit} avail.
                  </span>
                  {listing.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <Star size={9} className="fill-amber-400 text-amber-400" />
                      {listing.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Price + actions */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-primary tabular-nums">
                    UGX {listing.price.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">/{listing.unit}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link to="/sell" search={{ edit: listing.slug }}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 rounded-lg hover:bg-primary/10 hover:text-primary"
                      title="Edit listing"
                    >
                      <Edit3 size={12} />
                    </Button>
                  </Link>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDelete(String(listing.id))}
                    disabled={deletingId === String(listing.id)}
                    title="Delete listing"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Route component ──────────────────────────────────────────────────────────

function RouteComponent() {
  const { user, isFarmer, isBuyer } = useAuthStore();
  const farmer = isFarmer();
  const buyer = isBuyer();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-lg font-semibold text-foreground">You're not signed in</p>
          <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
          <Link to="/auth/sign-in">
            <Button className="rounded-xl">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    ...(buyer ? [{ value: "orders", label: "Orders" }] : []),
    ...(farmer ? [{ value: "earnings", label: "Earnings" }] : []),
    ...(farmer ? [{ value: "listings", label: "Listings" }] : []),
    { value: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-background pt-4 pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground font-serif">My Profile</h1>
          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-9 text-xs">
            <PenLine size={13} /> Edit Profile
          </Button>
        </div>

        {/* Hero */}
        <OwnProfileHero />

        {/* Stats */}
        {buyer && <BuyerStatsRow />}
        {farmer && <FarmerStatsRow />}

        {/* Farmer quick actions */}
        {farmer && (
          <div className="flex gap-3">
            <Link to="/sell" className="flex-1">
              <Button className="w-full h-10 rounded-xl gap-2 font-semibold text-sm">
                <Plus size={14} /> List New Product
              </Button>
            </Link>
            <Link to="/marketplace" className="flex-1">
              <Button variant="outline" className="w-full h-10 rounded-xl gap-2 text-sm">
                <ShoppingBag size={14} /> View Marketplace
              </Button>
            </Link>
          </div>
        )}

        {/* Analytics entry */}
        <Link to="/profile/analytics" className="block group">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-5 py-4 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <LayoutDashboard size={16} className="text-primary" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  My Analytics
                </p>
                <p className="text-xs text-muted-foreground">
                  Orders, listings, earnings, posts & activity
                </p>
              </div>
            </div>
            <ArrowRight
              size={15}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          </div>
        </Link>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue={tabs[0]?.value}>
          <TabsList
            className={`w-full rounded-xl h-10 bg-muted/50 border border-border/50 grid grid-cols-${tabs.length}`}
          >
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="rounded-lg text-xs capitalize">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {buyer && (
            <TabsContent value="orders" className="mt-5">
              <OrdersTab />
            </TabsContent>
          )}

          {farmer && (
            <TabsContent value="earnings" className="mt-5">
              <EarningsTab />
            </TabsContent>
          )}

          {farmer && (
            <TabsContent value="listings" className="mt-5">
              <ListingsTab />
            </TabsContent>
          )}

          <TabsContent value="settings" className="mt-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Account Settings</h3>
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
