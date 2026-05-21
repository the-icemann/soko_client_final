import { Link } from "@tanstack/react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { Post } from "@/types";

import { BlogCard } from "../common/blog-card";
import { Button } from "../ui/button";

export const LatestArticlesSection = ({
  blogs,
  isLoading,
}: {
  blogs: Post[];
  isLoading?: boolean;
}) => (
  <div>
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[13px] font-bold text-foreground">📝 Latest Articles</h3>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-[11px] font-semibold text-primary"
        asChild
      >
        <Link to="/blog">See all</Link>
      </Button>
    </div>

    {!isLoading && blogs.length === 0 ? (
      <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-10 text-center">
        <span className="text-3xl">📭</span>
        <p className="text-sm font-medium text-muted-foreground">No articles yet</p>
        <p className="text-xs text-muted-foreground">Be the first to share farming insights</p>
      </div>
    ) : (
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-44 shrink-0 rounded-xl" />
            ))
          : blogs.slice(0, 4).map((b) => <BlogCard key={b.slug} post={b} />)}
      </div>
    )}
  </div>
);
