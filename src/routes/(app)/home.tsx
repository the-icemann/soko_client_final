import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { fetchPosts } from "@/api/blog.api";
import { fetchListings } from "@/api/listings.api";
import AiBanner from "@/components/Home-page/ai-banner";
import AIMatchedFarmersSection from "@/components/Home-page/ai-matched-farmers-section";
import PricePrediction from "@/components/Home-page/ai-price-predictions";
import Categories from "@/components/Home-page/categories";
import { FreshListingsSection } from "@/components/Home-page/fresh-listing-section";
import { LatestArticlesSection } from "@/components/Home-page/latest-articles-section";
import StickyHeader from "@/components/Home-page/sticky-header";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/(app)/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const token = useAuthStore((s) => s.token);

  const { data: freshListings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["home", "listings"],
    queryFn: () => fetchListings({ limit: 4 }, token),
    staleTime: 1000 * 60 * 2,
  });

  const { data: latestPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["home", "posts"],
    queryFn: () => fetchPosts({ limit: 4, page: 1 }, token),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="pb-24 min-h-screen bg-background ">
      <StickyHeader />

      <div className="flex flex-col gap-7 px-4 pt-5 no-scrollbar ">
        <AiBanner />

        <Categories />

        <PricePrediction />

        <AIMatchedFarmersSection />

        <FreshListingsSection products={freshListings} isLoading={listingsLoading} />

        <LatestArticlesSection blogs={latestPosts} isLoading={postsLoading} />
      </div>
    </div>
  );
}
