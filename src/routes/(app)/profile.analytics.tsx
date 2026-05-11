import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, LayoutDashboard, Package, ShoppingBag, Wallet } from "lucide-react";

import {
  ActivityTimeline,
  AnalyticsSection,
  AnalyticsSkeleton,
  BuyerKpis,
  FarmerKpis,
  MyBlogPostsPreview,
  MyListingsPreview,
  RecentOrdersPreview,
  RecentPayoutsPreview,
} from "@/components/profile-page/analytics-components";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useMyBlogPostsPreview,
  useMyListingsPreview,
  useMyOrdersPreview,
  useMyPayoutsPreview,
} from "@/hooks/use-analytics";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/(app)/profile/analytics")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  component: AnalyticsPage,
});

// ─── Activity feed builder ────────────────────────────────────────────────────

function useActivityFeed(isFarmer: boolean, isBuyer: boolean) {
  const { data: orders } = useMyOrdersPreview(3);
  const { data: listings } = useMyListingsPreview(3);
  const { data: posts } = useMyBlogPostsPreview(2);
  const { data: payouts } = useMyPayoutsPreview(2);

  const items: any[] = [];

  if (isBuyer && orders) {
    orders.slice(0, 2).forEach((o) =>
      items.push({
        id: `order-${o.id}`,
        type: "order",
        label: `Ordered ${o.productName}`,
        sub: `${o.quantity} ${o.unit}s from ${o.farmer}`,
        time: new Date(o.createdAt).toLocaleDateString("en-UG", {
          day: "numeric",
          month: "short",
        }),
        status: o.status,
      })
    );
  }

  if (isFarmer && listings) {
    listings.slice(0, 2).forEach((l) =>
      items.push({
        id: `listing-${l.id}`,
        type: "listing",
        label: `Listed ${l.name}`,
        sub: `${l.qty.toLocaleString()} ${l.unit}s · UGX ${l.price.toLocaleString()}`,
        time: l.posted ?? "Recently",
        status: (l as any).status ?? "active",
      })
    );
  }

  if (posts) {
    posts.slice(0, 1).forEach((p) =>
      items.push({
        id: `post-${p.id}`,
        type: "post",
        label: `Published "${p.title}"`,
        sub: `${p.likes} likes · ${p.comments} comments`,
        time: new Date(p.publishedAt).toLocaleDateString("en-UG", {
          day: "numeric",
          month: "short",
        }),
      })
    );
  }

  if (isFarmer && payouts) {
    payouts.slice(0, 1).forEach((p) =>
      items.push({
        id: `payout-${p.id}`,
        type: "payout",
        label: `Payout for ${p.product}`,
        sub: `From ${p.buyerName}`,
        time: p.paidAt
          ? new Date(p.paidAt).toLocaleDateString("en-UG", {
              day: "numeric",
              month: "short",
            })
          : "Pending",
        status: p.status,
      })
    );
  }

  // Sort by most recently created — all have string times, so just preserve insert order
  return items;
}

// ─── Page component

function AnalyticsPage() {
  const { user, isFarmer, isBuyer } = useAuthStore();
  const farmer = isFarmer();
  const buyer = isBuyer();

  const activityItems = useActivityFeed(farmer, buyer);

  if (!user) return <AnalyticsSkeleton />;

  return (
    <div className="min-h-screen bg-background pt-4 pb-28 md:pb-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-xl"
                aria-label="Back to profile"
              >
                <ArrowLeft size={15} />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <LayoutDashboard size={18} className="text-primary" />
                My Analytics
              </h1>
              <p className="text-xs text-muted-foreground">
                Your activity across Soko — all in one place
              </p>
            </div>
          </div>

          {/* Member since badge */}
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Member since
            </p>
            <p className="text-xs font-semibold text-foreground">
              {new Date(user.memberSince).toLocaleDateString("en-UG", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* ── Role indicator pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {buyer && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-full px-3 py-1">
              <Package size={11} /> Buyer
            </span>
          )}
          {farmer && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1">
              <ShoppingBag size={11} /> Farmer
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[11px] font-medium bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-full px-3 py-1">
            <BookOpen size={11} /> Community Member
          </span>
        </div>

        {/* ── Buyer KPIs  */}
        {buyer && (
          <AnalyticsSection title="Buying overview" subtitle="Your spending and order activity">
            <BuyerKpis user={user} />
          </AnalyticsSection>
        )}

        {/* ── Farmer KPIs */}
        {farmer && (
          <AnalyticsSection title="Selling overview" subtitle="Your listings, sales and earnings">
            <FarmerKpis user={user} />
          </AnalyticsSection>
        )}

        <Separator />

        {/* ── Recent orders (buyer)  */}
        {buyer && (
          <AnalyticsSection
            title="Recent orders"
            subtitle="Your latest purchases"
            href="/profile"
            hrefLabel="View all orders"
          >
            <RecentOrdersPreview />
          </AnalyticsSection>
        )}

        {/* ── My listings (farmer) */}
        {farmer && (
          <AnalyticsSection
            title="My listings"
            subtitle="Edit or remove your active produce"
            href="/sell"
            hrefLabel="Add listing"
          >
            <MyListingsPreview />
          </AnalyticsSection>
        )}

        {/* ── Payouts (farmer)  */}
        {farmer && (
          <AnalyticsSection
            title="Recent payouts"
            subtitle="Earnings from confirmed orders"
            href="/profile"
            hrefLabel="Full earnings"
          >
            <RecentPayoutsPreview />
          </AnalyticsSection>
        )}

        <Separator />

        {/* ── Blog posts (everyone) */}
        <AnalyticsSection
          title="My blog posts"
          subtitle="Articles and insights you've published"
          href="/blog"
          hrefLabel="Browse community"
        >
          <MyBlogPostsPreview />
        </AnalyticsSection>

        <Separator />

        {/* ── Activity timeline */}
        <AnalyticsSection
          title="Recent activity"
          subtitle="A timeline of your latest actions on Soko"
        >
          <ActivityTimeline items={activityItems} />
        </AnalyticsSection>

        {/* ── Footer nudge  */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">Want to grow faster?</p>
            <p className="text-xs text-muted-foreground">
              {farmer
                ? "Add more listings and keep your stock up to date."
                : "Explore fresh produce from verified farmers near you."}
            </p>
          </div>
          <Link to={farmer ? "/sell" : "/marketplace"}>
            <Button size="sm" className="rounded-xl gap-1.5 h-9 text-xs shrink-0">
              {farmer ? (
                <>
                  <ShoppingBag size={12} /> Add Listing
                </>
              ) : (
                <>
                  <Package size={12} /> Shop Now
                </>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
