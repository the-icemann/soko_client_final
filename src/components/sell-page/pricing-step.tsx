import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { useSellStore } from "@/store/sell-store";
import { PRODUCT_UNITS } from "@/types/sell";

interface PricingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PricingStep({ onNext, onBack }: PricingStepProps) {
  const { draft, setField, isStepValid } = useSellStore();

  const valid = isStepValid("pricing");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground font-serif">Pricing & Availability</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set competitive prices based on real market data.
        </p>
      </div>

      <div className="space-y-4">
        {/* Price + Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Price (UGX) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                UGX
              </span>
              <Input
                type="number"
                value={draft.price}
                onChange={(e) => setField("price", e.target.value)}
                placeholder="850"
                className="pl-11 rounded-xl h-11 text-sm border-border/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Unit <span className="text-destructive">*</span>
            </Label>
            <Select value={draft.unit} onValueChange={(v) => setField("unit", v as any)}>
              <SelectTrigger className="rounded-xl h-11 text-sm border-border/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {PRODUCT_UNITS.map((u) => (
                  <SelectItem key={u} value={u} className="text-foreground">
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Qty + Min order */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Total Quantity ({draft.unit}s) <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              value={draft.totalQty}
              onChange={(e) => setField("totalQty", e.target.value)}
              placeholder="5000"
              className="rounded-xl h-11 text-sm border-border/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Minimum Order ({draft.unit}s)
            </Label>
            <Input
              type="number"
              value={draft.minimumOrder}
              onChange={(e) => setField("minimumOrder", e.target.value)}
              placeholder="50"
              className="rounded-xl h-11 text-sm border-border/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Fresh toggle */}
        <div className="flex items-center justify-between bg-muted/40 border border-border/40 rounded-xl px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Mark as Fresh</p>
            <p className="text-xs text-muted-foreground">Freshly harvested, available now</p>
          </div>
          <Switch checked={draft.fresh} onCheckedChange={(v) => setField("fresh", v)} />
        </div>

        {/* Bulk pricing tiers */}
        <div className="border border-border/50 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setField("enableTiers", !draft.enableTiers)}
            className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">Bulk Pricing Tiers</p>
              <p className="text-xs text-muted-foreground">Offer discounts for larger orders</p>
            </div>
            {draft.enableTiers ? (
              <ChevronUp size={16} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={16} className="text-muted-foreground" />
            )}
          </button>

          {draft.enableTiers && (
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border/40 bg-muted/20">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                Tier 1 — Standard (your base price)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Tier 2 Min Qty ({draft.unit}s)
                  </Label>
                  <Input
                    type="number"
                    value={draft.tier2MinQty}
                    onChange={(e) => setField("tier2MinQty", e.target.value)}
                    placeholder="500"
                    className="rounded-xl h-9 text-sm border-border/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Tier 2 Price (UGX)
                  </Label>
                  <Input
                    type="number"
                    value={draft.tier2Price}
                    onChange={(e) => setField("tier2Price", e.target.value)}
                    placeholder="800"
                    className="rounded-xl h-9 text-sm border-border/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Tier 3 Min Qty ({draft.unit}s)
                  </Label>
                  <Input
                    type="number"
                    value={draft.tier3MinQty}
                    onChange={(e) => setField("tier3MinQty", e.target.value)}
                    placeholder="2000"
                    className="rounded-xl h-9 text-sm border-border/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Tier 3 Price (UGX)
                  </Label>
                  <Input
                    type="number"
                    value={draft.tier3Price}
                    onChange={(e) => setField("tier3Price", e.target.value)}
                    placeholder="750"
                    className="rounded-xl h-9 text-sm border-border/60 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-xl h-11 px-6">
          ← Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!valid}
          className="flex-1 h-11 font-semibold rounded-xl gap-2"
        >
          Continue to Photos <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}
