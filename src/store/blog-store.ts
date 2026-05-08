// Placeholder posts + DEFAULT_FEATURED removed.
// Real data arrives via useBlog.ts hooks (TanStack Query) which call setPosts /
// setFeaturedPost on success.

import { create } from "zustand";

import { Post } from "@/types";

export interface FeaturedPost {
  title: string;
  excerpt: string;
  author: string;
  authorInitials: string;
  date: string;
  readTime: string;
  likes: number;
  comments: number;
  category: BlogCategory;
  slug: string;
}

export type BlogCategory =
  | "All"
  | "Soil & Crops"
  | "Sustainability"
  | "Business"
  | "Irrigation"
  | "AgriTech"
  | "Climate"
  | "Other";

export const BLOG_CATEGORIES: BlogCategory[] = [
  "All",
  "Soil & Crops",
  "Sustainability",
  "Business",
  "Irrigation",
  "AgriTech",
  "Climate",
  "Other",
];

export const TRENDING_TOPICS = ["Climate Smart Farming", "Avocado Exports", "Vanilla Prices"];

// ─── Store shape ──────────────────────────────────────────────────────────────

interface BlogState {
  posts: Post[];
  featuredPost: FeaturedPost | null;
  activeCategory: BlogCategory;
  isLoading: boolean;
  error: string | null;

  filteredPosts: () => Post[];
  setActiveCategory: (category: BlogCategory) => void;
  setPosts: (posts: Post[]) => void;
  setFeaturedPost: (post: FeaturedPost) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBlogStore = create<BlogState>((set, get) => ({
  // Start empty — usePosts hook fills this on mount
  posts: [],
  featuredPost: null,
  activeCategory: "All",
  isLoading: false,
  error: null,

  filteredPosts: () => {
    const { posts, activeCategory } = get();
    if (activeCategory === "All") return posts;
    return posts.filter((p) => p.category === activeCategory);
  },

  setActiveCategory: (category) => set({ activeCategory: category }),
  setPosts: (posts) => set({ posts }),
  setFeaturedPost: (post) => set({ featuredPost: post }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
