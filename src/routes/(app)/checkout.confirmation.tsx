import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Home,
  MapPin,
  Package,
  ShoppingBag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrder, usePaymentStatus } from "@/hooks/useOrders";
import { useCartStore } from "@/store/cart-store";

export const Route = createFileRoute("/(app)/checkout/confirmation")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: (search.orderId as string) ?? "",
    status: (search.status as "success" | "pending" | "error") ?? "success",
  }),
});

function RouteComponent() {
  const { orderId, status } = Route.useSearch();
  const { placedOrderId, deliveryAddress, paymentMethod, resetCheckout } = useCartStore();

  const displayOrderId = orderId || placedOrderId || "";

  // When returning from PesaPal the Zustand state is empty — fetch from API
  const needsApiFetch = !deliveryAddress;
  const { data: orderData, isLoading: orderLoading } = useMyOrder(
    needsApiFetch ? displayOrderId : undefined
  );

  // Poll payment status while pending
  const { data: paymentStatusData } = usePaymentStatus(
    status === "pending" ? displayOrderId : undefined
  );

  const resolvedStatus =
    status === "pending" && paymentStatusData?.status
      ? paymentStatusData.status === "completed"
        ? "success"
        : paymentStatusData.status === "failed"
          ? "error"
          : "pending"
      : status;

  const addr = deliveryAddress ?? orderData?.deliveryAddress;
  const method = paymentMethod ?? orderData?.paymentMethod;

  const paymentLabel: Record<string, string> = {
    pesapal: "PesaPal",
    mobile_money: method?.provider ? `${method.provider} Mobile Money` : "Mobile Money",
    cash_on_delivery: "Cash on Delivery",
    bank_transfer: "Bank Transfer",
  };

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-background pt-4 pb-24 flex items-start justify-center">
        <div className="max-w-lg w-full mx-auto px-4 sm:px-6 space-y-4 pt-12">
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (resolvedStatus === "error") {
    return (
      <div className="min-h-screen bg-background pt-4 pb-24 flex items-start justify-center">
        <div className="max-w-lg w-full mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-4 py-8">
            <div className="relative mx-auto size-24">
              <div className="relative size-24 bg-destructive/10 rounded-full flex items-center justify-center border-2 border-destructive/30">
                <AlertCircle size={44} className="text-destructive" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-serif">Payment Failed</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Something went wrong with your payment. Your order has not been charged.
              </p>
            </div>
            {displayOrderId && (
              <div className="inline-flex items-center gap-2 bg-muted/50 border border-border/60 rounded-full px-4 py-2">
                <Package size={14} className="text-muted-foreground" />
                <span className="text-sm font-mono font-bold text-foreground">
                  {displayOrderId}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Link to="/checkout" className="flex-1">
              <Button variant="outline" className="w-full h-11 rounded-xl font-medium">
                Try Again
              </Button>
            </Link>
            <Link to="/marketplace" className="flex-1" onClick={resetCheckout}>
              <Button className="w-full h-11 rounded-xl font-semibold gap-2">
                <ShoppingBag size={15} /> Browse
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Pending state ────────────────────────────────────────────────────────────
  if (resolvedStatus === "pending") {
    return (
      <div className="min-h-screen bg-background pt-4 pb-24 flex items-start justify-center">
        <div className="max-w-lg w-full mx-auto px-4 sm:px-6 space-y-6">
          <div className="text-center space-y-4 py-8">
            <div className="relative mx-auto size-24">
              <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping opacity-40" />
              <div className="relative size-24 bg-amber-50 dark:bg-amber-950/30 rounded-full flex items-center justify-center border-2 border-amber-300 dark:border-amber-700">
                <Clock size={44} className="text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-serif">Processing Payment</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Your payment is being confirmed. This usually takes a few seconds.
              </p>
            </div>
            {displayOrderId && (
              <div className="inline-flex items-center gap-2 bg-muted/50 border border-border/60 rounded-full px-4 py-2">
                <Package size={14} className="text-primary" />
                <span className="text-sm font-mono font-bold text-foreground">
                  {displayOrderId}
                </span>
              </div>
            )}
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Do not close this page. You will be updated automatically once payment is confirmed.
            </p>
          </div>
          <Link to="/profile" className="block">
            <Button variant="outline" className="w-full h-11 rounded-xl">
              View My Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pt-4 pb-24 md:pb-12 flex items-start justify-center">
      <div className="max-w-lg w-full mx-auto px-4 sm:px-6 space-y-6">
        {/* Success hero */}
        <div className="text-center space-y-4 py-8">
          <div className="relative mx-auto size-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-30" />
            <div className="relative size-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/30">
              <CheckCircle2 size={44} className="text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">Order Confirmed!</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your order has been placed successfully.
            </p>
          </div>
          {displayOrderId && (
            <div className="inline-flex items-center gap-2 bg-muted/50 border border-border/60 rounded-full px-4 py-2">
              <Package size={14} className="text-primary" />
              <span className="text-sm font-mono font-bold text-foreground">{displayOrderId}</span>
            </div>
          )}
        </div>

        {/* Order details card */}
        <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
          <div className="bg-primary/5 border-b border-border/40 px-5 py-4 flex items-center gap-3">
            <div className="size-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Package size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estimated Delivery</p>
              <p className="text-sm font-bold text-foreground">
                {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-UG", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <Badge className="ml-auto text-[10px]">2–4 days</Badge>
          </div>

          <div className="px-5 py-4 space-y-4">
            {addr && (
              <div className="flex gap-3">
                <MapPin size={15} className="text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Delivery Address
                  </p>
                  <p className="text-sm font-medium text-foreground">{addr.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {[addr.village, addr.subCounty, addr.district].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">{addr.phone}</p>
                </div>
              </div>
            )}

            {addr && method && <Separator />}

            {method && (
              <div className="flex gap-3">
                <CreditCard size={15} className="text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    Payment
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {paymentLabel[method.type] ?? method.type}
                  </p>
                  {method.phoneNumber && (
                    <p className="text-xs text-muted-foreground">{method.phoneNumber}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Farmer payout note */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 space-y-1">
          <p className="text-sm font-semibold text-primary">Supporting Local Farmers</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Payment will be released directly to the farmer's registered mobile number once you
            confirm delivery. This ensures fair, transparent transactions.
          </p>
        </div>

        {/* What's next */}
        <div className="bg-card border border-border/60 rounded-2xl divide-y divide-border/40">
          {[
            { label: "Track your order", sub: "View order status and updates", href: "/profile" },
            { label: "Continue shopping", sub: "Browse more products", href: "/marketplace" },
          ].map(({ label, sub, href }) => (
            <Link
              key={href}
              to={href}
              onClick={label === "Continue shopping" ? resetCheckout : undefined}
              className="flex items-center gap-3 px-5 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
              <ChevronRight size={15} className="text-muted-foreground" />
            </Link>
          ))}
        </div>

        <div className="flex gap-3">
          <Link to="/home" className="flex-1" onClick={resetCheckout}>
            <Button variant="outline" className="w-full h-11 rounded-xl gap-2 font-medium">
              <Home size={15} /> Home
            </Button>
          </Link>
          <Link to="/marketplace" className="flex-1" onClick={resetCheckout}>
            <Button className="w-full h-11 rounded-xl gap-2 font-semibold">
              <ShoppingBag size={15} /> Shop More
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
