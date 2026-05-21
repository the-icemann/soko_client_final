import { createFileRoute } from "@tanstack/react-router";

import AiBanner from "@/components/Home-page/ai-banner";
import AIMatchedFarmersSection from "@/components/Home-page/ai-matched-farmers-section";
import PricePrediction from "@/components/Home-page/ai-price-predictions";
import Categories from "@/components/Home-page/categories";
import { FreshListingsSection } from "@/components/Home-page/fresh-listing-section";
import { LatestArticlesSection } from "@/components/Home-page/latest-articles-section";
import StickyHeader from "@/components/Home-page/sticky-header";
import { useRecentPosts } from "@/hooks/useBlog";
import { useRecentListings } from "@/hooks/useMarketplace";

export const Route = createFileRoute("/(app)/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: listings = [], isLoading: listingsLoading } = useRecentListings(4);
  const { data: posts = [], isLoading: postsLoading } = useRecentPosts(4);

  return (
    <div className="pb-24 min-h-screen bg-background ">
      <StickyHeader />

      <div className="flex flex-col gap-7 px-4 pt-5 no-scrollbar ">
        <AiBanner />
        <Categories />
        <PricePrediction />
        <AIMatchedFarmersSection />

        <FreshListingsSection products={listings} isLoading={listingsLoading} />
        <LatestArticlesSection blogs={posts} isLoading={postsLoading} />
      </div>
    </div>
  );
}
