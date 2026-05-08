import { ArrowRight, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { useSellStore } from "@/store/sell-store";
import { PRODUCT_CATEGORIES, UGANDA_DISTRICTS } from "@/types/sell";

interface ProductInfoStepProps {
  onNext: () => void;
}

export function ProductInfoStep({ onNext }: ProductInfoStepProps) {
  const { draft, setField, isStepValid } = useSellStore();
  const valid = isStepValid("info");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground font-serif">Product Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell buyers what you're selling and where it comes from.
        </p>
      </div>

      <div className="space-y-4">
        {/* Product name */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Product Name <span className="text-destructive">*</span>
          </Label>
          <Input
            value={draft.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Grade A Maize (Sun-dried)"
            className="rounded-xl h-11 text-sm border-border/60"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select value={draft.category} onValueChange={(v) => setField("category", v as any)}>
            <SelectTrigger className="rounded-xl h-11 text-sm border-border/60">
              <SelectValue placeholder="Select produce category" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              {PRODUCT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-foreground">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District + Village */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              District <span className="text-destructive">*</span>
            </Label>
            <Select value={draft.district} onValueChange={(v) => setField("district", v)}>
              <SelectTrigger className="rounded-xl h-11 text-sm border-border/60">
                <SelectValue placeholder="Select district" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {UGANDA_DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d} className="text-foreground">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Village / Area
            </Label>
            <Input
              value={draft.village}
              onChange={(e) => setField("village", e.target.value)}
              placeholder="e.g. Lacor, Gulu"
              className="rounded-xl h-11 text-sm border-border/60"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={draft.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Describe your produce — quality, how it was grown, storage conditions, certifications..."
            className="resize-none rounded-xl text-sm border-border/60 min-h-[110px]"
          />
          <p className="text-[10px] text-muted-foreground text-right">
            {draft.description.length} chars
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            Tags
            <span className="text-muted-foreground/50 font-normal normal-case tracking-normal">
              (comma-separated)
            </span>
          </Label>
          <Input
            value={draft.tags}
            onChange={(e) => setField("tags", e.target.value)}
            placeholder="Organic, Sun-dried, Certified, Bulk..."
            className="rounded-xl h-11 text-sm border-border/60"
          />
        </div>

        {/* Tip */}
        <div className="flex gap-2.5 bg-muted/40 border border-border/40 rounded-xl px-4 py-3">
          <Info size={14} className="text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Listings with detailed descriptions get{" "}
            <span className="text-foreground font-medium">3× more views</span> than those without.
            Include quality grade, storage method and any certifications.
          </p>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!valid}
        className="w-full h-11 font-semibold rounded-xl gap-2"
      >
        Continue to Pricing <ArrowRight size={15} />
      </Button>
    </div>
  );
}
