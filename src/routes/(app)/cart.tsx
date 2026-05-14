import { Button } from "@base-ui/react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Badge, ShoppingBag } from "lucide-react";

import CartItemFull from "@/components/cart/cart-item-full";
import { OrderSummaryPanel } from "@/components/cart/order-summary-panel";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/(app)/cart")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { items, getSummary, selectAll, clearCart } = useCartStore();
  const summary = getSummary();
  const allSelected = items.every((i) => i.isSelected);
  return (
    <div className="min-h-screen bg-background pt-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            to="/marketplace"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-foreground font-serif">Shopping Cart</h1>
          {summary.itemCount > 0 && <Badge className="rounded-full">{summary.itemCount}</Badge>}
        </div>

        {items.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <ShoppingBag size={56} className="text-muted-foreground/20" />
            <p className="text-lg font-semibold text-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Browse the marketplace and add products from verified farmers.
            </p>
            <Link to="/marketplace">
              <Button className="rounded-xl mt-2">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* ── Items column ────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between bg-card border border-border/50 rounded-2xl px-4 py-2.5">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <Checkbox checked={allSelected} onCheckedChange={selectAll} />
                  Select all ({items.length})
                </label>
                <button
                  onClick={clearCart}
                  className="text-xs text-destructive hover:underline font-medium"
                >
                  Clear cart
                </button>
              </div>

              {/* Item list */}
              <div className="bg-card border border-border/60 rounded-2xl px-4 divide-y divide-border/40">
                {items.map((item) => (
                  <CartItemFull key={item.cartItemId} item={item} />
                ))}
              </div>
            </div>

            {/* ── Summary column ───────────────────────────────────────── */}
            <div className="w-full lg:w-80 shrink-0 space-y-3">
              <OrderSummaryPanel items={items} summary={summary} />
              <Button
                className="w-full h-11 font-semibold rounded-xl gap-2 shadow-sm"
                disabled={summary.selectedCount === 0}
                onClick={() => navigate({ to: "/checkout" })}
              >
                Checkout ({summary.selectedCount} items) →
              </Button>
              {summary.selectedCount === 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Select at least one item to checkout
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
