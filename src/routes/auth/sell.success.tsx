import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight, Eye, PlusCircle, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useSellStore } from "@/store/sell-store";

export const Route = createFileRoute("/auth/sell/success")({
  component: RouteComponent,
  validateSearch: (s: Record<string, unknown>) => ({
    listingId: (s.listingId as string) ?? "",
    slug: (s.slug as string) ?? "",
  }),
});

function RouteComponent() {
  const { listingId, slug } = Route.useSearch();
  const { resetDraft } = useSellStore();

  return (
    <div className="min-h-screen bg-background flex items-start justify-center pt-12 pb-24 px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Hero */}
        <div className="space-y-4">
          <div className="relative mx-auto size-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25" />
            <div className="relative size-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
              <CheckCircle2 size={44} className="text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">Listing Published! 🎉</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your product is now live and visible to buyers across Uganda.
            </p>
          </div>
          {slug && (
            <div className="inline-flex items-center gap-2 bg-muted/50 border border-border/60 rounded-full px-4 py-2">
              <ShoppingBag size={13} className="text-primary" />
              <span className="text-sm font-mono font-bold text-foreground">#{slug}</span>
            </div>
          )}
        </div>

        {/* Farmer payout note */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 text-left space-y-1">
          <p className="text-sm font-semibold text-primary">💰 How you get paid</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When a buyer places an order and confirms delivery, payment is automatically sent to
            your registered mobile number — no chasing required.
          </p>
        </div>

        {/* Action links */}
        <div className="bg-card border border-border/60 rounded-2xl divide-y divide-border/40 text-left">
          {[
            {
              icon: <Eye size={15} className="text-primary" />,
              label: "View your listing",
              sub: "See how buyers see your product",
              href: slug ? `/marketplace/${slug}` : "/marketplace",
              onClick: undefined,
            },
            {
              icon: <PlusCircle size={15} className="text-primary" />,
              label: "List another product",
              sub: "Add more produce to your profile",
              href: "/sell",
              onClick: resetDraft,
            },
          ].map(({ icon, label, sub, href, onClick }) => (
            <Link
              key={href}
              to={href}
              onClick={onClick}
              className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>

        <div className="flex gap-3">
          <Link to="/home" className="flex-1">
            <Button variant="outline" className="w-full h-11 rounded-xl font-medium">
              Go Home
            </Button>
          </Link>
          <Link to="/marketplace" className="flex-1">
            <Button className="w-full h-11 rounded-xl font-semibold">Browse Market</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
