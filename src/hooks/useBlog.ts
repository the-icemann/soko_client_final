import { useQuery } from "@tanstack/react-query";

import { fetchPosts } from "@/api/blog.api";
import { useAuthStore } from "@/store/auth-store";
import { BlogCategory, useBlogStore } from "@/store/blog-store";
import { Post } from "@/types";

// ── Query keys ────────────────────────────────────────────────────────────────

export const blogKeys = {
  all: () => ["posts"] as const,
  list: (category: string, page: number) => ["posts", "list", category, page] as const,
  recent: (limit: number) => ["posts", "recent", limit] as const,
  search: (term: string) => ["posts", "search", term] as const,
  featured: () => ["posts", "featured"] as const,
};

// ── usePosts — main list (filtered by activeCategory) ─────────────────────────

/**
 * Fetches the post list for the blog landing page.
 * Syncs results into blog-store so existing components that read from
 * the store continue to work without changes.
 */
export function usePosts(page = 1) {
  const token = useAuthStore((s) => s.token);
  const activeCategory = useBlogStore((s) => s.activeCategory);
  const setPosts = useBlogStore((s) => s.setPosts);
  const setLoading = useBlogStore((s) => s.setLoading);
  const setError = useBlogStore((s) => s.setError);

  const category = activeCategory === "All" ? undefined : activeCategory;

  return useQuery({
    queryKey: blogKeys.list(activeCategory, page),
    queryFn: async () => {
      setLoading(true);
      try {
        const posts = await fetchPosts({ category, page, limit: 20 }, token);
        setPosts(posts);
        setError(null);
        return posts;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 1000 * 60 * 2, // 2 min — post lists don't change that often
    placeholderData: (prev) => prev,
  });
}

// ── usePostSearch ─────────────────────────────────────────────────────────────

/**
 * Searches posts by title / excerpt / tags.
 * Only fires when `term` has ≥ 2 characters.
 */
export function usePostSearch(term: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: blogKeys.search(term),
    queryFn: () => fetchPosts({ search: term, limit: 10 }, token),
    enabled: term.trim().length >= 2,
    staleTime: 1000 * 30,
  });
}

// ── useFeaturedPost ───────────────────────────────────────────────────────────

/**
 * Fetches the first/most recent published post to use as the hero.
 * Syncs into blog-store.featuredPost automatically.
 */
export function useFeaturedPost() {
  const token = useAuthStore((s) => s.token);
  const setFeaturedPost = useBlogStore((s) => s.setFeaturedPost);

  return useQuery({
    queryKey: blogKeys.featured(),
    queryFn: async () => {
      const posts = await fetchPosts({ page: 1, limit: 1 }, token);
      const first = posts[0] as Post | undefined;
      if (first) {
        setFeaturedPost({
          title: first.title,
          excerpt: first.excerpt ?? "",
          author: first.author,
          authorInitials: first.authorInitials ?? first.author.slice(0, 2).toUpperCase(),
          date: first.publishedAt
            ? new Date(first.publishedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
          readTime: first.readTime ?? "",
          likes: first.likes ?? 0,
          comments: typeof first.comments === "number" ? first.comments : 0,
          category: first.category as BlogCategory,
          slug: first.slug,
        });
      }
      return first ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ── useRecentPosts — home page preview (no blog-store side-effects) ───────────
export function useRecentPosts(limit = 4) {
  const token = useAuthStore((s) => s.token);

  return useQuery<Post[]>({
    queryKey: blogKeys.recent(limit),
    queryFn: () => fetchPosts({ limit }, token),
    staleTime: 1000 * 60 * 2,
  });
}
