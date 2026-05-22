import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { CartItem } from "@/types";

// ─── Single cart item row ─────────────────────────────────────────────────────

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem, toggleSelected } = useCartStore();

  return (
    <div className={cn("flex gap-3 py-3 transition-opacity", !item.isSelected && "opacity-50")}>
      {/* Select checkbox */}
      <input
        type="checkbox"
        checked={item.isSelected}
        onChange={() => toggleSelected(item.cartItemId)}
        className="mt-1 accent-primary shrink-0"
      />

      {/* Image */}
      <div className="size-14 rounded-xl overflow-hidden bg-muted shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
          {item.name}
        </p>
        <div className="flex items-center gap-1.5">
          <Avatar className="size-4">
            <AvatarFallback className="text-[8px] font-bold bg-primary text-primary-foreground">
              {item.farmer
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-muted-foreground truncate">{item.farmer}</span>
        </div>
        <p className="text-xs font-bold text-primary">
          UGX {item.unitPrice.toLocaleString()} / {item.unit}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            className="size-6 rounded-lg"
            onClick={() => updateQuantity(item.cartItemId, item.quantity - item.minimumOrder)}
            disabled={item.quantity <= item.minimumOrder}
          >
            <Minus size={10} />
          </Button>
          <span className="text-xs font-bold tabular-nums w-8 text-center">{item.quantity}</span>
          <Button
            size="icon"
            variant="outline"
            className="size-6 rounded-lg"
            onClick={() => updateQuantity(item.cartItemId, item.quantity + item.minimumOrder)}
            disabled={item.quantity >= item.availableQty}
          >
            <Plus size={10} />
          </Button>
          <span className="text-[10px] text-muted-foreground">{item.unit}s</span>
        </div>
      </div>

      {/* Subtotal + remove */}
      <div className="flex flex-col items-end justify-between shrink-0">
        <button
          onClick={() => removeItem(item.cartItemId)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 size={13} />
        </button>
        <p className="text-sm font-extrabold text-foreground tabular-nums">
          UGX {item.subtotal.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, getSummary, selectAll } = useCartStore();
  const summary = getSummary();

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent side="right" className="w-full sm:w-105 p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 font-serif text-lg">
              <ShoppingBag size={18} className="text-primary" />
              Your Cart
              {summary.itemCount > 0 && (
                <Badge className="text-[10px] h-5 px-1.5 rounded-full">{summary.itemCount}</Badge>
              )}
            </SheetTitle>
            <button onClick={closeDrawer} className="text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>
          </div>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-16">
              <ShoppingBag size={40} className="text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">Your cart is empty</p>
              <Link to="/marketplace" onClick={closeDrawer}>
                <Button size="sm" className="rounded-xl mt-1">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {items.map((item) => (
                <CartItemRow key={item.cartItemId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer summary */}
        {items.length > 0 && (
          <div className="border-t border-border/50 px-5 py-4 space-y-3 bg-background">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">UGX {summary.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold">UGX {summary.deliveryFee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-extrabold text-primary text-lg">
                  UGX {summary.total.toLocaleString()}
                </span>
              </div>
            </div>

            <Link to="/" onClick={closeDrawer} className="block">
              <Button className="w-full h-11 font-semibold rounded-xl gap-2 shadow-sm">
                Proceed to Checkout →
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
