import { create } from "zustand";
import { persist } from "zustand/middleware";

import { BlogCategory } from "./blog-store";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EditorSection =
  | { type: "paragraph"; content: string }
  | { type: "heading"; content: string }
  | { type: "quote"; content: string; attribution: string }
  | { type: "image"; content: string; caption: string };

export interface WriteBlogDraft {
  title: string;
  excerpt: string;
  category: BlogCategory | "";
  tags: string;
  sections: EditorSection[];
  // Cover image — kept separate from persist (File can't be serialised)
  coverFile: File | null; // the raw File object
  coverPreviewUrl: string; // object URL or plain URL string for preview
}

const EMPTY_DRAFT: WriteBlogDraft = {
  title: "",
  excerpt: "",
  category: "",
  tags: "",
  sections: [{ type: "paragraph", content: "" }],
  coverFile: null,
  coverPreviewUrl: "",
};

// ─── Store shape ──────────────────────────────────────────────────────────────

interface WriteBlogState {
  draft: WriteBlogDraft;
  activeSectionIndex: number;
  isSavingDraft: boolean;
  lastSaved: string | null;

  // Field setters
  setTitle: (title: string) => void;
  setExcerpt: (excerpt: string) => void;
  setCategory: (category: BlogCategory | "") => void;
  setTags: (tags: string) => void;

  // Cover image
  setCoverImage: (file: File, previewUrl: string) => void;
  removeCoverImage: () => void;

  // Section editors
  addSection: (type: EditorSection["type"]) => void;
  updateSection: (index: number, partial: Partial<EditorSection>) => void;
  removeSection: (index: number) => void;
  moveSectionUp: (index: number) => void;
  moveSectionDown: (index: number) => void;
  setActiveSectionIndex: (index: number) => void;

  // Draft lifecycle
  saveDraft: () => void;
  resetDraft: () => void;

  // Derived
  isReadyToPublish: () => boolean;

  // Builds a FormData object to POST directly to your backend
  buildFormData: () => FormData;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWriteBlogStore = create<WriteBlogState>()(
  persist(
    (set, get) => ({
      draft: EMPTY_DRAFT,
      activeSectionIndex: 0,
      isSavingDraft: false,
      lastSaved: null,

      // ── Field setters ─────────────────────────────────────────────────────
      setTitle: (title) => set((s) => ({ draft: { ...s.draft, title } })),
      setExcerpt: (excerpt) => set((s) => ({ draft: { ...s.draft, excerpt } })),
      setCategory: (category) => set((s) => ({ draft: { ...s.draft, category } })),
      setTags: (tags) => set((s) => ({ draft: { ...s.draft, tags } })),

      // ── Cover image ───────────────────────────────────────────────────────
      setCoverImage: (file, previewUrl) =>
        set((s) => ({
          draft: { ...s.draft, coverFile: file, coverPreviewUrl: previewUrl },
        })),

      removeCoverImage: () =>
        set((s) => ({
          draft: { ...s.draft, coverFile: null, coverPreviewUrl: "" },
        })),

      // ── Section management ────────────────────────────────────────────────
      addSection: (type) => {
        const blank: EditorSection =
          type === "quote"
            ? { type: "quote", content: "", attribution: "" }
            : type === "image"
              ? { type: "image", content: "", caption: "" }
              : ({ type, content: "" } as EditorSection);

        set((s) => ({
          draft: { ...s.draft, sections: [...s.draft.sections, blank] },
          activeSectionIndex: s.draft.sections.length,
        }));
      },

      updateSection: (index, partial) =>
        set((s) => ({
          draft: {
            ...s.draft,
            sections: s.draft.sections.map((sec, i) =>
              i === index ? ({ ...sec, ...partial } as EditorSection) : sec
            ),
          },
        })),

      removeSection: (index) =>
        set((s) => ({
          draft: {
            ...s.draft,
            sections: s.draft.sections.filter((_, i) => i !== index),
          },
          activeSectionIndex: Math.max(0, s.activeSectionIndex - 1),
        })),

      moveSectionUp: (index) => {
        if (index === 0) return;
        set((s) => {
          const sections = [...s.draft.sections];
          [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
          return { draft: { ...s.draft, sections }, activeSectionIndex: index - 1 };
        });
      },

      moveSectionDown: (index) => {
        const { draft } = get();
        if (index === draft.sections.length - 1) return;
        set((s) => {
          const sections = [...s.draft.sections];
          [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
          return { draft: { ...s.draft, sections }, activeSectionIndex: index + 1 };
        });
      },

      setActiveSectionIndex: (index) => set({ activeSectionIndex: index }),

      // ── Draft lifecycle ───────────────────────────────────────────────────
      saveDraft: () => {
        set({ isSavingDraft: true });
        setTimeout(() => {
          set({ isSavingDraft: false, lastSaved: new Date().toISOString() });
        }, 600);
      },

      resetDraft: () => set({ draft: EMPTY_DRAFT, activeSectionIndex: 0, lastSaved: null }),

      // ── Derived ───────────────────────────────────────────────────────────
      isReadyToPublish: () => {
        const { draft } = get();
        return (
          draft.title.trim().length > 5 &&
          draft.excerpt.trim().length > 10 &&
          draft.category !== "" &&
          draft.sections.some((s) => s.content.trim().length > 0)
        );
      },

      // ── Build FormData ────────────────────────────────────────────────────
      // Everything — text fields + the raw image file — goes in one payload.
      // Your backend receives multipart/form-data and generates the image URL.
      buildFormData: () => {
        const { draft } = get();
        const form = new FormData();

        form.append("title", draft.title.trim());
        form.append("excerpt", draft.excerpt.trim());
        form.append("category", draft.category);
        form.append("status", "published");

        // Tags as JSON array
        const tags = draft.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
        form.append("tags", JSON.stringify(tags));

        // Body sections as JSON
        form.append("body", JSON.stringify(draft.sections));

        // Cover image — attach File if the user picked one,
        // otherwise attach the URL string as a fallback field.
        if (draft.coverFile && draft.coverFile.size > 0) {
          form.append("coverImage", draft.coverFile); // ← raw File
        } else if (draft.coverPreviewUrl) {
          form.append("coverImageUrl", draft.coverPreviewUrl); // ← URL string
        }

        return form;
      },
    }),
    {
      name: "soko-write-blog-draft",
      // Exclude File and object URLs from persistence — they can't serialise
      partialize: (state) => ({
        draft: {
          ...state.draft,
          coverFile: null,
          coverPreviewUrl: "",
        },
      }),
    }
  )
);
