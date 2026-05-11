import { Link } from "@tanstack/react-router";

import { Post } from "@/types";

import { BlogCard } from "../common/blog-card";
import { Button } from "../ui/button";

export const LatestArticlesSection = ({ blogs }: { blogs: Post[] }) => (
  <div>
    {/* Header */}
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[13px] font-bold text-foreground">📝 Latest Articles</h3>

      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 text-[11px] font-semibold text-primary"
        asChild
      >
        <Link to="/blog">See all</Link>
        {/* Sell all */}
      </Button>
    </div>

    {/* List */}
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {blogs.slice(0, 4).map((b) => (
        <BlogCard key={b.slug} post={b} />
      ))}
    </div>
  </div>
);
