import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { BlogGrid } from "@/components/blog-page/blog-grid";
import { BlogPageHeader } from "@/components/blog-page/blog-page-header";
import { CategoryFilter } from "@/components/blog-page/category-filter";
import { FeaturedPost } from "@/components/blog-page/featured-post";
import { ResultsCount } from "@/components/blog-page/result-count";
import { TrendingStrip } from "@/components/blog-page/trending-strip";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useFeaturedPost, usePosts } from "@/hooks/useBlog";
import { useBlogStore } from "@/store/blog-store";

export const Route = createFileRoute("/(app)/blog/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [page, setPage] = useState(1);

  const { featuredPost, activeCategory, isLoading, setActiveCategory, filteredPosts } =
    useBlogStore();

  // Reset to page 1 when category changes
  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  // Fetch & sync into store — reruns when page or category changes
  const { data: postsData = [] } = usePosts(page);
  useFeaturedPost();

  const posts = filteredPosts();

  // The API returns exactly `limit` (20) items per page; if fewer come back we're on the last page
  const hasNextPage = postsData.length === 20;
  const hasPrevPage = page > 1;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        <BlogPageHeader />
        <FeaturedPost post={featuredPost} isLoading={isLoading} />
        <TrendingStrip />
        <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
        <ResultsCount count={posts.length} activeCategory={activeCategory} />
        <BlogGrid
          posts={posts}
          activeCategory={activeCategory}
          isLoading={isLoading}
          onResetCategory={() => setActiveCategory("All")}
        />

        {!isLoading && (hasPrevPage || hasNextPage) && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage((p) => p - 1)} disabled={!hasPrevPage} />
              </PaginationItem>

              {hasPrevPage && (
                <PaginationItem>
                  <PaginationLink onClick={() => setPage(page - 1)}>{page - 1}</PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink isActive>{page}</PaginationLink>
              </PaginationItem>

              {hasNextPage && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => setPage(page + 1)}>{page + 1}</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext onClick={() => setPage((p) => p + 1)} disabled={!hasNextPage} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
