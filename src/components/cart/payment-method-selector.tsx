import { Banknote, CheckCircle2, CreditCard, Loader2, Smartphone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePlaceOrder } from "@/hooks/use-checkout";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { PaymentMethod, PaymentMethodType } from "@/types";

// ─── Option card ──────────────────────────────────────────────────────────────

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

function OptionCard({ selected, onClick, icon, title, description, badge }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <div
        className={cn(
          "size-11 rounded-xl flex items-center justify-center shrink-0 transition-colors",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {badge && (
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div
        className={cn(
          "size-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
          selected ? "border-primary bg-primary" : "border-border"
        )}
      >
        {selected && (
          <CheckCircle2 size={12} className="text-primary-foreground fill-primary-foreground" />
        )}
      </div>
    </button>
  );
}

// ─── Payment method selector ──────────────────────────────────────────────────

interface PaymentMethodSelectorProps {
  onBack: () => void;
}

export function PaymentMethodSelector({ onBack }: PaymentMethodSelectorProps) {
  const { setPaymentMethod, getSummary, deliveryAddress } = useCartStore();
  const summary = getSummary();
  const placeOrder = usePlaceOrder();

  const [selectedType, setSelectedType] = useState<PaymentMethodType | null>(null);
  const [provider, setProvider] = useState<"MTN" | "Airtel">("MTN");
  const [phoneNumber, setPhoneNumber] = useState(deliveryAddress?.phone ?? "");
  const [phoneError, setPhoneError] = useState("");

  const validatePhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required";
    if (!/^(\+256|0)[0-9]{9}$/.test(phone.replace(/\s/g, "")))
      return "Enter a valid Ugandan number e.g. +256 700 000 000";
    return "";
  };

  const handleConfirm = () => {
    if (!selectedType) return;

    if (selectedType === "mobile_money") {
      const err = validatePhone(phoneNumber);
      if (err) {
        setPhoneError(err);
        return;
      }
    }

    const method: PaymentMethod = {
      type: selectedType,
      ...(selectedType === "mobile_money" && { provider, phoneNumber }),
    };

    setPaymentMethod(method);
    placeOrder.mutate();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard size={16} className="text-primary" />
        <h2 className="text-lg font-bold text-foreground font-serif">Payment Method</h2>
      </div>

      <div className="space-y-3">
        {/* PesaPal */}
        <OptionCard
          selected={selectedType === "pesapal"}
          onClick={() => setSelectedType("pesapal")}
          icon={<CreditCard size={20} />}
          title="PesaPal"
          description="Pay securely via card, mobile money or bank"
          badge="Recommended"
        />

        {/* MTN Mobile Money */}
        <OptionCard
          selected={selectedType === "mobile_money" && provider === "MTN"}
          onClick={() => {
            setSelectedType("mobile_money");
            setProvider("MTN");
          }}
          icon={<Smartphone size={20} />}
          title="MTN Mobile Money"
          description="Receive a USSD prompt on your MTN line"
          badge="Instant"
        />

        {/* Airtel Money */}
        <OptionCard
          selected={selectedType === "mobile_money" && provider === "Airtel"}
          onClick={() => {
            setSelectedType("mobile_money");
            setProvider("Airtel");
          }}
          icon={<Smartphone size={20} />}
          title="Airtel Money"
          description="Receive a USSD prompt on your Airtel line"
        />

        {/* Cash on Delivery */}
        <OptionCard
          selected={selectedType === "cash_on_delivery"}
          onClick={() => setSelectedType("cash_on_delivery")}
          icon={<Banknote size={20} />}
          title="Cash on Delivery"
          description="Pay when your order arrives"
        />
      </div>

      {/* Phone number for mobile money */}
      {selectedType === "mobile_money" && (
        <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {provider} Payment Details
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {provider} Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setPhoneError("");
              }}
              placeholder="+256 700 000 000"
              className={cn(
                "rounded-xl h-10 text-sm",
                phoneError ? "border-destructive" : "border-border/60"
              )}
            />
            {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-2">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              💡 You will receive a USSD prompt on this number. Ensure it has sufficient balance.
            </p>
          </div>
          {/* Farmer receives note */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
            <p className="text-xs text-primary">
              🌱 Payment is sent directly to the farmer's registered mobile number after delivery
              confirmation.
            </p>
          </div>
        </div>
      )}

      {/* Total reminder */}
      <div className="bg-muted/40 border border-border/50 rounded-2xl px-4 py-3 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Amount to pay</span>
        <span className="text-lg font-extrabold text-primary">
          UGX {summary.total.toLocaleString()}
        </span>
      </div>

      {/* Error from mutation */}
      {placeOrder.isError && (
        <p className="text-sm text-destructive text-center">
          {(placeOrder.error as Error).message}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={placeOrder.isPending}
          className="rounded-xl h-11 px-6"
        >
          ← Back
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedType || placeOrder.isPending}
          className="flex-1 h-11 font-semibold rounded-xl gap-2 shadow-sm"
        >
          {placeOrder.isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Placing Order…
            </>
          ) : (
            `Confirm & Pay UGX ${summary.total.toLocaleString()}`
          )}
        </Button>
      </div>
    </div>
  );
}
