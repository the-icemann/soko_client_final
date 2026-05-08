import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { FarmerCard } from "@/components/product-detail-page/farmer-card";
import { ProductGallery } from "@/components/product-detail-page/product-gallery";
import { ProductInfo } from "@/components/product-detail-page/product-info";
import {
  OrderSummary,
  ProductActions,
  QuantitySelector,
} from "@/components/product-detail-page/product-purchase";
import { ProductTabs } from "@/components/product-detail-page/product-tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddToCart,
  useProduct,
  useReviews,
  useSubmitRating,
  useToggleReviewHelpful,
  useToggleWishlist,
} from "@/hooks/useProductDetail";
import { useCartStore } from "@/store/cart-store";
import { useProductDetailStore } from "@/store/product-detail-store";

export const Route = createFileRoute("/(app)/marketplace/$id")({
  component: RouteComponent,
});

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-3">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-16 h-16 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-9 w-3/4 rounded-lg" />
        <Skeleton className="h-5 w-40 rounded" />
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();

  // ── Server state ───────────────────────────────────────────────────────────
  const { data: product, isLoading, error } = useProduct(id);

  // Fetch reviews once we have the listing id (product.id is the UUID)
  const { data: reviews = [] } = useReviews(product ? String(product.id) : undefined);

  // ── Client UI state ────────────────────────────────────────────────────────
  const {
    activeImageIndex,
    quantity,
    activeTab,
    setActiveImageIndex,
    setActiveTab,
    increment,
    decrement,
    setQuantity,
  } = useProductDetailStore();

  // ── Cart ───────────────────────────────────────────────────────────────────
  const { addToCart } = useAddToCart();
  const { isInCart } = useCartStore();

  // ── Mutations ──────────────────────────────────────────────────────────────
  const submitRatingMutation = useSubmitRating(product ? String(product.id) : "");
  const toggleWishlistMutation = useToggleWishlist(product ? String(product.id) : "");
  const toggleHelpfulMutation = useToggleReviewHelpful(product ? String(product.id) : "");

  // ── Derived ────────────────────────────────────────────────────────────────
  const effectivePrice = (() => {
    if (!product) return 0;
    if (!product.priceTiers?.length) return product.price;
    const tier = [...product.priceTiers].reverse().find((t) => quantity >= t.minQty);
    return tier?.price ?? product.price;
  })();

  const subtotal = quantity * effectivePrice;
  const alreadyInCart = product ? isInCart(product.id) : false;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product?.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <AlertCircle className="size-10 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
          <Link to="/marketplace">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
              <ArrowLeft size={13} /> Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-4 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Marketplace
        </Link>

        {isLoading || !product ? (
          <ProductSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Gallery */}
              <div className="lg:sticky lg:top-20">
                <ProductGallery
                  product={product}
                  activeIndex={activeImageIndex}
                  onSelect={setActiveImageIndex}
                />
              </div>

              {/* Purchase panel */}
              <div className="space-y-5">
                <ProductInfo
                  product={product}
                  effectivePrice={effectivePrice}
                  quantity={quantity}
                />

                <FarmerCard product={product} />

                <QuantitySelector
                  quantity={quantity}
                  unit={product.unit}
                  available={product.qty}
                  minimumOrder={product.minimumOrder}
                  onIncrement={() => increment(50, product.qty)}
                  onDecrement={() => decrement(50, product.minimumOrder ?? 1)}
                  onChange={(qty) => setQuantity(qty, product.minimumOrder ?? 1)}
                />

                <OrderSummary
                  quantity={quantity}
                  unit={product.unit}
                  effectivePrice={effectivePrice}
                  subtotal={subtotal}
                  originalPrice={product.price}
                />

                <ProductActions
                  isWishlisted={product.isWishlisted ?? false}
                  isAddingToCart={false}
                  alreadyInCart={alreadyInCart}
                  onAddToCart={() => addToCart(product, quantity, effectivePrice)}
                  onToggleWishlist={() => toggleWishlistMutation.mutate()}
                  onShare={handleShare}
                />
              </div>
            </div>

            <Separator />

            {/*
              ProductTabs receives the real reviews from the server.
              The `allProducts` prop for "similar" tab still needs a listing
              — pass an empty array or wire up a useFarmerListings hook later.
            */}
            <ProductTabs
              product={{ ...product, reviews }}
              activeTab={activeTab}
              allProducts={[]}
              onTabChange={(t) => setActiveTab(t as "details" | "reviews" | "similar")}
              onReviewHelpful={(reviewId) => toggleHelpfulMutation.mutate(reviewId)}
              onSubmitRating={(r) => submitRatingMutation.mutate(r)}
            />
          </>
        )}
      </div>
    </div>
  );
}
