import { FileText, Layers, Tag } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BLOG_CATEGORIES, BlogCategory } from "@/store/blog-store";

import { CoverImageUploader } from "./cover-image-uploader";

interface PostMetaProps {
  category: BlogCategory | "";
  coverPreviewUrl: string;
  tags: string;
  excerpt: string;
  onCategoryChange: (v: BlogCategory | "") => void;
  onCoverImageChange: (file: File, previewUrl: string) => void;
  onCoverImageRemove: () => void;
  onTagsChange: (v: string) => void;
  onExcerptChange: (v: string) => void;
}

export function PostMeta({
  category,
  coverPreviewUrl,
  tags,
  excerpt,
  onCategoryChange,
  onCoverImageChange,
  onCoverImageRemove,
  onTagsChange,
  onExcerptChange,
}: PostMetaProps) {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
        Article Details
      </p>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Layers size={11} /> Category
        </Label>
        <Select value={category} onValueChange={(v) => onCategoryChange(v as BlogCategory)}>
          <SelectTrigger className="rounded-xl h-10 text-sm bg-muted/50 border-border/50">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-background">
            {BLOG_CATEGORIES.filter((c) => c !== "All").map((cat) => (
              <SelectItem key={cat} value={cat} className="text-foreground">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cover image */}
      <CoverImageUploader
        previewUrl={coverPreviewUrl}
        onFileChange={onCoverImageChange}
        onRemove={onCoverImageRemove}
      />

      {/* Excerpt */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <FileText size={11} /> Excerpt
          <span className="text-muted-foreground/50 font-normal">(shown in blog list)</span>
        </Label>
        <Textarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="A short summary of what this article covers…"
          className="resize-none rounded-xl text-sm bg-muted/50 border-border/50 min-h-[72px]"
          maxLength={200}
        />
        <p className="text-[10px] text-muted-foreground text-right">{excerpt.length}/200</p>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Tag size={11} /> Tags
          <span className="text-muted-foreground/50 font-normal">(comma-separated)</span>
        </Label>
        <Input
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="Uganda, Climate, Maize, Irrigation…"
          className="rounded-xl h-10 text-sm bg-muted/50 border-border/50"
        />
      </div>
    </div>
  );
}
