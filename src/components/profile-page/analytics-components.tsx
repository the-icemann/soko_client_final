import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Edit3,
  ExternalLink,
  MapPin,
  Package,
  ShoppingBag,
  Star,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteListing,
  useMyBlogPostsPreview,
  useMyListingsPreview,
  useMyOrdersPreview,
  useMyPayoutsPreview,
} from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { Product } from "@/types";
import { AuthenticatedUser } from "@/types/profile";

// ─── Shared section wrapper ───────────────────────────────────────────────────

interface SectionProps {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}

export function AnalyticsSection({
  title,
  subtitle,
  href,
  hrefLabel = "See all",
  children,
}: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <h2 className="text-[15px] font-semibold text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {href && (
          <Link
            to={href}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {hrefLabel}
            <ArrowRight size={12} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// ─── KPI metric strip ─────────────────────────────────────────────────────────

interface KpiItem {
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  accent?: boolean;
}

export function KpiStrip({ items }: { items: KpiItem[] }) {
  return (
    <div
      className={cn(
        "grid gap-3",
        items.length === 2 && "grid-cols-2",
        items.length === 3 && "grid-cols-3",
        items.length >= 4 && "grid-cols-2 sm:grid-cols-4"
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-2xl border p-4 space-y-1",
            item.accent ? "bg-primary/5 border-primary/20" : "bg-card border-border/60"
          )}
        >
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
            {item.label}
          </p>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums leading-none",
              item.accent ? "text-primary" : "text-foreground"
            )}
          >
            {item.value}
          </p>
          {item.sub && <p className="text-[11px] text-muted-foreground">{item.sub}</p>}
          {item.trend && item.trend !== "neutral" && (
            <p
              className={cn(
                "text-[11px] font-medium flex items-center gap-0.5",
                item.trend === "up" ? "text-emerald-600" : "text-destructive"
              )}
            >
              <TrendingUp size={10} className={item.trend === "down" ? "rotate-180" : ""} />
              {item.trend === "up" ? "Trending up" : "Trending down"}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Buyer KPIs ───────────────────────────────────────────────────────────────

export function BuyerKpis({ user }: { user: AuthenticatedUser }) {
  const { getSummary } = useCartStore();
  const summary = getSummary();

  const items: KpiItem[] = [
    {
      label: "Total Orders",
      value: user.totalOrders ?? 0,
      trend: "neutral",
    },
    {
      label: "Total Spent",
      value: `UGX ${((user.totalSpent ?? 0) / 1_000).toFixed(0)}K`,
      accent: true,
      trend: "up",
    },
    {
      label: "In Cart",
      value: summary.itemCount,
      sub: `UGX ${summary.subtotal.toLocaleString()}`,
    },
    {
      label: "Wishlist",
      value: user.wishlistCount ?? 0,
    },
  ];

  return <KpiStrip items={items} />;
}

// ─── Farmer KPIs ─────────────────────────────────────────────────────────────

export function FarmerKpis({ user }: { user: AuthenticatedUser }) {
  const items: KpiItem[] = [
    {
      label: "Active Listings",
      value: user.totalListings ?? 0,
    },
    {
      label: "Units Sold",
      value: (user.totalSales ?? 0).toLocaleString(),
      trend: "up",
    },
    {
      label: "Total Earned",
      value: `UGX ${
        (((user.totalEarned ?? 0) / 1_000_000) * 10) % 10 === 0
          ? Math.floor((user.totalEarned ?? 0) / 1_000_000)
          : ((user.totalEarned ?? 0) / 1_000_000).toFixed(1)
      }M`,
      accent: true,
    },
    {
      label: "Avg Rating",
      value: (user.averageRating ?? 0).toFixed(1),
      sub: `${user.totalReviews ?? 0} reviews`,
    },
  ];

  return <KpiStrip items={items} />;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400",
  dispatched:
    "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400",
  delivered: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  active: "bg-primary/10 text-primary border-primary/20",
  draft: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted text-muted-foreground/60 border-border",
  paid: "bg-primary/10 text-primary border-primary/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold capitalize", STATUS_MAP[status] ?? "")}
    >
      {status}
    </Badge>
  );
}

// ─── Orders preview (buyer)
export function RecentOrdersPreview() {
  const { data: orders, isLoading } = useMyOrdersPreview(4);

  if (isLoading)
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-18 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (!orders?.length)
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
          <Package size={20} className="text-muted-foreground/50" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No orders yet</p>
          <p className="text-xs text-muted-foreground">Start shopping in the marketplace</p>
        </div>
        <Link to="/marketplace">
          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-8 text-xs">
            <ShoppingBag size={12} /> Browse Marketplace
          </Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-2">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl p-3 hover:border-border transition-colors"
        >
          <div className="size-11 rounded-xl overflow-hidden bg-muted shrink-0">
            <img
              src={order.productImage}
              alt={order.productName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-sm font-semibold text-foreground line-clamp-1">
              {order.productName}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {order.quantity} {order.unit}s · {order.farmer}
            </p>
            <StatusPill status={order.status} />
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-primary tabular-nums">
              UGX {order.total.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-UG", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Listings preview (farmer) ────────────────────────────────────────────────

export function MyListingsPreview() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const { data: listings, isLoading, refetch } = useMyListingsPreview(4);
  const deleteMutation = useDeleteListing();

  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (isLoading)
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-19 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (!listings?.length)
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
          <ShoppingBag size={20} className="text-muted-foreground/50" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No listings yet</p>
          <p className="text-xs text-muted-foreground">List your first product to start selling</p>
        </div>
        <Link to="/sell">
          <Button size="sm" className="rounded-xl gap-1.5 h-8 text-xs">
            + Create Listing
          </Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-2">
      {listings.map((listing: Product) => (
        <div
          key={listing.id}
          className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl p-3 hover:border-border transition-colors group"
        >
          {/* Thumbnail */}
          <div className="size-12 rounded-xl overflow-hidden bg-muted shrink-0">
            {listing.image ? (
              <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground line-clamp-1">{listing.name}</p>
              {listing.verified && <BadgeCheck size={12} className="text-primary shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusPill status={(listing as any).status ?? "active"} />
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
              <Button
                size="icon"
                variant="ghost"
                className="size-7 rounded-lg hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate({ to: `/sell?edit=${listing.slug}` })}
                title="Edit listing"
              >
                <Edit3 size={12} />
              </Button>
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
  );
}

// ─── Payouts preview (farmer) ─────────────────────────────────────────────────

export function RecentPayoutsPreview() {
  const { data: payouts, isLoading } = useMyPayoutsPreview(4);

  if (isLoading)
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-15 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (!payouts?.length)
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No payouts yet — start selling to earn.
      </p>
    );

  return (
    <div className="space-y-2">
      {payouts.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-3 bg-card border border-border/60 rounded-2xl px-3.5 py-3"
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
          <div className="text-right shrink-0 space-y-0.5">
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
  );
}

// ─── Blog posts preview (all users)

export function MyBlogPostsPreview() {
  const { data: posts, isLoading } = useMyBlogPostsPreview(3);

  if (isLoading)
    return (
      <div className="space-y-2.5">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );

  if (!posts?.length)
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
          <BookOpen size={20} className="text-muted-foreground/50" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No posts yet</p>
          <p className="text-xs text-muted-foreground">Share your knowledge with the community</p>
        </div>
        <Link to="/blog/write">
          <Button size="sm" variant="outline" className="rounded-xl gap-1.5 h-8 text-xs">
            <BookOpen size={12} /> Write a Post
          </Button>
        </Link>
      </div>
    );

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex items-start gap-3 bg-card border border-border/60 rounded-2xl p-3.5 hover:border-border transition-colors group"
        >
          {post.image && (
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground line-clamp-1">{post.title}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">
                {post.category}
              </Badge>
              <span className="text-[11px] text-muted-foreground">{post.readTime}</span>
              <span className="text-[11px] text-muted-foreground">
                {post.likes} likes · {post.comments} comments
              </span>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Link to="/blog/$slug" params={{ slug: post.slug }}>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 rounded-lg hover:bg-primary/10 hover:text-primary"
                title="View post"
              >
                <ExternalLink size={12} />
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Activity timeline ────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: "order" | "listing" | "post" | "review" | "payout";
  label: string;
  sub: string;
  time: string;
  status?: string;
}

const ACTIVITY_ICON = {
  order: Package,
  listing: ShoppingBag,
  post: BookOpen,
  review: Star,
  payout: Wallet,
};

const ACTIVITY_COLOR: Record<string, string> = {
  order: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  listing: "bg-primary/10 text-primary",
  post: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  review: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  payout: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
};

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (!items.length)
    return <p className="text-sm text-muted-foreground text-center py-6">No recent activity.</p>;

  return (
    <div className="space-y-0">
      {items.map((item, idx) => {
        const Icon = ACTIVITY_ICON[item.type];
        const isLast = idx === items.length - 1;
        return (
          <div key={item.id} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={cn(
                  "size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                  ACTIVITY_COLOR[item.type]
                )}
              >
                <Icon size={13} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border/60 my-1.5" />}
            </div>

            {/* Content */}
            <div className={cn("flex-1 min-w-0", !isLast ? "pb-4" : "pb-1")}>
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground leading-snug">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.status && <StatusPill status={item.status} />}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Skeleton loader for the whole page ──────────────────────────────────────

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-32 rounded-lg" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-18 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-40 rounded-lg" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-19 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
