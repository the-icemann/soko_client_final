import { CheckCircle2, Edit2, Loader2, MapPin, Package, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCreateListing } from "@/hooks/use-sell-listing";
import { useSellStore } from "@/store/sell-store";
import { SellStep } from "@/types/sell";

interface PublishStepProps {
  onBack: () => void;
  onGoToStep: (step: SellStep) => void;
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
          {label}
        </p>
        <p className="text-sm text-foreground mt-0.5 leading-snug">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
      >
        <Edit2 size={11} /> Edit
      </button>
    </div>
  );
}

export function PublishStep({ onBack, onGoToStep }: PublishStepProps) {
  const { draft, isReadyToPublish } = useSellStore();
  const createListing = useCreateListing();

  const tags = draft.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground font-serif">Review & Publish</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Check everything looks right before your listing goes live.
        </p>
      </div>

      {/* Preview card */}
      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden">
        {/* Cover image */}
        {draft.photoPreviews[0] && (
          <div className="relative h-44 bg-muted overflow-hidden">
            <img src={draft.photoPreviews[0]} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
              <Badge className="text-[10px] font-semibold">{draft.category}</Badge>
              {draft.fresh && (
                <Badge variant="secondary" className="text-[10px]">
                  🟢 Fresh
                </Badge>
              )}
            </div>
            <div className="absolute top-3 right-3 text-[10px] text-white/70 bg-black/30 rounded-full px-2 py-0.5">
              {draft.photoPreviews.length} photo{draft.photoPreviews.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}

        <div className="p-5 space-y-1">
          {/* Product name + price */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-bold text-foreground font-serif leading-tight">
              {draft.name || "—"}
            </h3>
            <div className="text-right shrink-0">
              <p className="text-lg font-extrabold text-primary">
                UGX {Number(draft.price || 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">/{draft.unit}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={11} />
            {[draft.village, draft.district].filter(Boolean).join(", ") || "—"}
          </div>

          {/* Qty info */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package size={11} />
            {draft.totalQty || "—"} {draft.unit}s available · Min. {draft.minimumOrder} {draft.unit}
            s
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <Tag size={11} className="text-muted-foreground" />
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] rounded-full">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail review */}
      <div className="bg-card border border-border/60 rounded-2xl px-5 divide-y divide-border/40">
        <ReviewRow
          label="Product Name"
          value={draft.name || "—"}
          onEdit={() => onGoToStep("info")}
        />
        <ReviewRow
          label="Category"
          value={draft.category || "—"}
          onEdit={() => onGoToStep("info")}
        />
        <ReviewRow
          label="Location"
          value={[draft.village, draft.district].filter(Boolean).join(", ") || "—"}
          onEdit={() => onGoToStep("info")}
        />
        <ReviewRow
          label="Price"
          value={`UGX ${Number(draft.price || 0).toLocaleString()} / ${draft.unit}`}
          onEdit={() => onGoToStep("pricing")}
        />
        <ReviewRow
          label="Quantity & Minimum"
          value={`${draft.totalQty || "—"} ${draft.unit}s · Min ${draft.minimumOrder} ${draft.unit}s`}
          onEdit={() => onGoToStep("pricing")}
        />
        <ReviewRow
          label="Photos"
          value={`${draft.photoPreviews.length} photo${draft.photoPreviews.length !== 1 ? "s" : ""} uploaded`}
          onEdit={() => onGoToStep("photos")}
        />
      </div>

      <Separator />

      {/* Live notice */}
      <div className="flex gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your listing will go live immediately after publishing and be visible to buyers across
          Uganda. Payment will be sent to your registered mobile number upon order delivery.
        </p>
      </div>

      {/* Error */}
      {createListing.isError && (
        <p className="text-sm text-destructive text-center">
          {(createListing.error as Error).message}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-xl h-11 px-6">
          ← Back
        </Button>
        <Button
          onClick={() => createListing.mutate()}
          disabled={!isReadyToPublish() || createListing.isPending}
          className="flex-1 h-12 font-bold rounded-xl gap-2 shadow-sm text-base"
        >
          {createListing.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Publishing…
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              Publish Listing
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
