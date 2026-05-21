import { Link } from "@tanstack/react-router";

import { Post } from "@/types";

import { BlogCard } from "../common/blog-card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

interface LatestArticlesSectionProps {
  blogs: Post[];
  isLoading?: boolean;
}

export const LatestArticlesSection = ({ blogs, isLoading }: LatestArticlesSectionProps) => (
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

    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="shrink-0 w-52 space-y-2 mt-2">
              <Skeleton className="h-36 w-full rounded-xl" />
              <Skeleton className="h-3 w-5/6 rounded" />
              <Skeleton className="h-3 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))
        : blogs.slice(0, 4).map((b) => <BlogCard key={b.slug} post={b} />)}
    </div>
  </div>
);
