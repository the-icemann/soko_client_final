import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import {
  createPost,
  publishPost as publishPostApi,
  updatePost,
  uploadBodyImage,
  uploadCoverImage,
} from "@/api/blog.api";
import { useAuthStore } from "@/store/auth-store";
import { useWriteBlogStore } from "@/store/write-blog-store";

function useToken() {
  return useAuthStore((s) => s.token);
}

// ─── Create draft ─────────────────────────────────────────────────────────────

export function useCreateDraft() {
  const token = useToken();
  const { draft } = useWriteBlogStore();

  return useMutation({
    mutationFn: () =>
      createPost(
        {
          title: draft.title.trim() || "Untitled",
          excerpt: draft.excerpt.trim() || "",
          category: draft.category || "General",
          tags: draft.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          body: draft.sections,
          //status:   "draft",
        },
        token!
      ),
  });
}

// ─── Update draft ─────────────────────────────────────────────────────────────

export function useUpdateDraft(postId: string) {
  const token = useToken();
  const { draft } = useWriteBlogStore();

  return useMutation({
    mutationFn: () =>
      updatePost(
        postId,
        {
          title: draft.title.trim(),
          excerpt: draft.excerpt.trim(),
          category: draft.category || "General",
          tags: draft.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          body: draft.sections,
        },
        token!
      ),
  });
}

// ─── Upload cover image ───────────────────────────────────────────────────────

export function useUploadCover(postId: string) {
  const token = useToken();

  return useMutation({
    mutationFn: (file: File) => uploadCoverImage(postId, file, token!),
  });
}

// ─── Upload body image ────────────────────────────────────────────────────────

export function useUploadBodyImage(postId: string) {
  const token = useToken();

  return useMutation({
    mutationFn: ({ file, order }: { file: File; order: number }) =>
      uploadBodyImage(postId, file, order, token!),
  });
}

// ─── Publish ──────────────────────────────────────────────────────────────────
// Flow: ensure draft exists → update with latest content → publish

export function usePublishPost() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const token = useToken();
  const { draft, resetDraft } = useWriteBlogStore();

  return useMutation({
    mutationFn: async (postId: string | undefined) => {
      let id = postId;

      // 1. Create draft if it doesn't exist yet
      if (!id) {
        const created = await createPost(
          {
            title: draft.title.trim() || "Untitled",
            excerpt: draft.excerpt.trim() || "",
            category: draft.category || "General",
            tags: draft.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            body: draft.sections,
            // status:   "draft",
          },
          token!
        );
        id = created.id;
      } else {
        // 2. Sync latest content
        await updatePost(
          id,
          {
            title: draft.title.trim(),
            excerpt: draft.excerpt.trim(),
            category: draft.category || "General",
            tags: draft.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            body: draft.sections,
          },
          token!
        );
      }

      // 3. Upload cover if a File is attached (not yet uploaded)
      if (draft.coverFile && draft.coverFile.size > 0) {
        await uploadCoverImage(id, draft.coverFile, token!);
      }

      // 4. Publish
      return publishPostApi(id, token!);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      resetDraft();
      navigate({ to: "/blog/$slug", params: { slug: data.slug } });
    },
  });
}
