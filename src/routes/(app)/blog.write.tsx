import { Input } from "@base-ui/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { uploadCoverImage } from "@/api/blog.api";
import { Separator } from "@/components/ui/separator";
import { AddSectionBar } from "@/components/write-blog-page/add-section-bar";
import { PostMeta } from "@/components/write-blog-page/post-meta";
import { PublishChecklist } from "@/components/write-blog-page/publish-checklist";
import { SectionEditor } from "@/components/write-blog-page/section-editor";
import { WriteHeader } from "@/components/write-blog-page/write-header";
import {
  useCreateDraft,
  usePublishPost,
  useUpdateDraft,
  useUploadBodyImage,
  useUploadCover,
} from "@/hooks/useWriteBlog";
import { useAuthStore } from "@/store/auth-store";
import { useWriteBlogStore } from "@/store/write-blog-store";

export const Route = createFileRoute("/(app)/blog/write")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const {
    draft,
    activeSectionIndex,
    isSavingDraft,
    lastSaved,
    setTitle,
    setExcerpt,
    setCategory,
    setTags,
    setCoverImage,
    removeCoverImage,
    addSection,
    updateSection,
    removeSection,
    moveSectionUp,
    moveSectionDown,
    setActiveSectionIndex,
    isReadyToPublish,
  } = useWriteBlogStore();

  // Track the server-side post id once the first draft is created
  const [postId, setPostId] = useState<string | undefined>();
  const token = useAuthStore((s) => s.token);

  // ── Mutations ────────────────────────────────────────────────────────────
  const { mutateAsync: createDraft, isPending: isCreating } = useCreateDraft();
  const { mutateAsync: updateDraft, isPending: isUpdating } = useUpdateDraft(postId ?? "");
  const { mutateAsync: uploadBody } = useUploadBodyImage(postId ?? "");
  const {
    mutate: publish,
    isPending: isPublishing,
    isError: publishError,
    error: publishErr,
  } = usePublishPost();

  const isSaving = isCreating || isUpdating || isSavingDraft;

  // ── Save draft ────────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!postId) {
      const post = await createDraft();
      setPostId(post.id);
    } else {
      await updateDraft();
    }
  };

  // ── Cover image picked ────────────────────────────────────────────────────
  // PostMeta calls setCoverImage(file, previewUrl) — we intercept by wrapping it.
  const handleCoverImageChange = async (file: File, previewUrl: string) => {
    setCoverImage(file, previewUrl);

    let id = postId;

    if (!id) {
      const post = await createDraft();
      id = post.id;
      setPostId(id);
    }

    await uploadCoverImage(id, file, token!);
  };

  // ── Body image picked ─────────────────────────────────────────────────────
  // Call this from your SectionEditor when the user picks an image for a section.
  // It uploads the file and writes the returned URL back into the section content.
  const handleBodyImagePick = async (file: File, sectionIndex: number) => {
    // Ensure a draft exists first
    let id = postId;
    if (!id) {
      const post = await createDraft();
      id = post.id;
      setPostId(id);
    }
    const { url } = await uploadBody({ file, order: sectionIndex });
    updateSection(sectionIndex, { content: url });
  };

  // ── Publish ───────────────────────────────────────────────────────────────
  const handlePublish = () => publish(postId);

  const hasSections = draft.sections.some((s) => s.content.trim().length > 0);

  return (
    <div className="min-h-screen bg-background pt-4 pb-24 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ── Page header ───────────────────────────────────────────── */}
        <WriteHeader
          isReadyToPublish={isReadyToPublish()}
          isSavingDraft={isSaving}
          isPublishing={isPublishing}
          lastSaved={lastSaved}
          publishError={publishError ? (publishErr as Error).message : null}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
        />

        <Separator />

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Main editor ─────────────────────────────────────────── */}
          <div className="w-full lg:flex-1 min-w-0 space-y-4">
            {/* Title */}
            <div className="bg-card border border-border/60 rounded-2xl px-4 sm:px-5 py-4">
              <Input
                value={draft.title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title…"
                className="border-none shadow-none bg-transparent text-xl sm:text-2xl md:text-3xl font-bold font-serif focus-visible:ring-0 h-auto px-0 py-1 placeholder:text-muted-foreground/40"
              />
            </div>

            {/* Meta */}
            <PostMeta
              category={draft.category}
              coverPreviewUrl={draft.coverPreviewUrl}
              tags={draft.tags}
              excerpt={draft.excerpt}
              onCategoryChange={setCategory}
              onCoverImageChange={handleCoverImageChange}
              onCoverImageRemove={removeCoverImage}
              onTagsChange={setTags}
              onExcerptChange={setExcerpt}
            />

            {/* Sections label */}
            <div className="flex items-center gap-2 px-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Article Body
              </p>
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-[10px] text-muted-foreground">
                {draft.sections.length} section{draft.sections.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Section list */}
            <div className="space-y-3">
              {draft.sections.map((section, i) => (
                <SectionEditor
                  key={i}
                  section={section}
                  index={i}
                  isActive={activeSectionIndex === i}
                  isFirst={i === 0}
                  isLast={i === draft.sections.length - 1}
                  onUpdate={(partial) => updateSection(i, partial)}
                  onRemove={() => removeSection(i)}
                  onMoveUp={() => moveSectionUp(i)}
                  onMoveDown={() => moveSectionDown(i)}
                  onFocus={() => setActiveSectionIndex(i)}
                  // Pass this down to your image section component
                  onBodyImagePick={(file) => handleBodyImagePick(file, i)}
                />
              ))}
            </div>

            <AddSectionBar onAdd={addSection} />

            {/* Mobile-only checklist */}
            <div className="lg:hidden">
              <PublishChecklist
                title={draft.title}
                excerpt={draft.excerpt}
                category={draft.category}
                hasCoverImage={!!draft.coverPreviewUrl}
                hasSections={hasSections}
              />
            </div>
          </div>

          {/* ── Sidebar (desktop only) ───────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4 w-72 shrink-0 sticky top-[5rem]">
            <PublishChecklist
              title={draft.title}
              excerpt={draft.excerpt}
              category={draft.category}
              hasCoverImage={!!draft.coverPreviewUrl}
              hasSections={hasSections}
            />

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-semibold text-primary uppercase tracking-widest">
                Writing Tips
              </p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {[
                  "Start with a clear, specific title",
                  "Add a concise excerpt — it shows on the blog list",
                  "Use headings to break up long content",
                  "Quotes from real farmers add credibility",
                  "Images keep readers engaged",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
