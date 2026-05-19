import { api } from "@/api/api";
import {
  Comment,
  CreateCommentPayload,
  CreatePostPayload,
  ImageUploadOut,
  LikeResponse,
  Post,
  PostListParams,
  PublishedPostOut,
  UpdatePostPayload,
} from "@/types/blogs";

// ── Posts ─────────────────────────────────────────────────────────────────────

/** GET /posts  — paginated, filtered list */
export function fetchPosts(params: PostListParams = {}, token?: string | null) {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.tag) qs.set("tag", params.tag);
  if (params.search) qs.set("search", params.search);
  if (params.authorId) qs.set("author_id", params.authorId);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));

  const query = qs.toString();
  return api.get<Post[]>(`posts/${query ? `?${query}` : ""}`, token);
}

/** GET /posts/{slug}  — single post with full body */
export function fetchPost(slug: string, token?: string | null) {
  return api.get<Post>(`posts/${slug}`, token);
}

/** GET /posts/me/posts  — author's own posts (drafts + published) */
export function fetchMyPosts(token: string, page = 1, limit = 20) {
  return api.get<Post[]>(`posts/me/posts?page=${page}&limit=${limit}`, token);
}

/** POST /posts  — create a new draft */
export function createPost(payload: CreatePostPayload, token: string) {
  return api.post<Post>("posts/", payload, token);
}

/** PUT /posts/{postId}  — update a draft or published post */
export function updatePost(postId: string, payload: UpdatePostPayload, token: string) {
  return api.put<Post>(`posts/${postId}`, payload, token);
}

/** POST /posts/{postId}/publish  — publish a draft */
export function publishPost(postId: string, token: string) {
  return api.post<PublishedPostOut>(`posts/${postId}/publish`, {}, token);
}

/** DELETE /posts/{postId} */
export function deletePost(postId: string, token: string) {
  return api.delete<void>(`posts/${postId}`, token);
}

// ── Image uploads ─────────────────────────────────────────────────────────────

/**
 * POST /posts/{postId}/cover
 * Uploads the cover image and returns { url, public_id }.
 * Backend saves the URL to post.image automatically.
 */
export async function uploadCoverImage(
  postId: string,
  file: File,
  token: string
): Promise<ImageUploadOut> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${import.meta.env.VITE_API_URL ?? "/"}posts/${postId}/cover`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Cover upload failed");
  }
  return res.json();
}

/**
 * POST /posts/{postId}/body-image?order={order}
 * Returns { url, public_id } — url goes into a PostSection { type: "image", content: url }.
 */
export async function uploadBodyImage(
  postId: string,
  file: File,
  order: number,
  token: string
): Promise<ImageUploadOut> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(
    `${import.meta.env.VITE_API_URL ?? "/"}posts/${postId}/body-image?order=${order}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Body image upload failed");
  }
  return res.json();
}

// ── Likes ─────────────────────────────────────────────────────────────────────

/** POST /posts/{postId}/like  — toggle like, returns { liked, likes } */
export function togglePostLikeApi(postId: string, token: string) {
  return api.post<LikeResponse>(`posts/${postId}/like`, {}, token);
}

// ── Comments ──────────────────────────────────────────────────────────────────

/** GET /posts/{postId}/comments */
export function fetchComments(postId: string, token?: string | null, page = 1, limit = 20) {
  return api.get<Comment[]>(`posts/${postId}/comments?page=${page}&limit=${limit}`, token);
}

/** POST /posts/{postId}/comments */
export function addCommentApi(postId: string, payload: CreateCommentPayload, token: string) {
  return api.post<Comment>(`posts/${postId}/comments`, payload, token);
}

/** DELETE /posts/{postId}/comments/{commentId} */
export function deleteCommentApi(postId: string, commentId: string, token: string) {
  return api.delete<void>(`posts/${postId}/comments/${commentId}`, token);
}

/** POST /posts/{postId}/comments/{commentId}/like */
export function toggleCommentLikeApi(postId: string, commentId: string, token: string) {
  return api.post<LikeResponse>(`posts/${postId}/comments/${commentId}/like`, {}, token);
}
