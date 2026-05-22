import { ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";

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
import { useCartStore } from "@/store/cart-store";
import { DeliveryAddress } from "@/types";

const UGANDA_DISTRICTS = [
  "Kampala",
  "Wakiso",
  "Mukono",
  "Jinja",
  "Mbale",
  "Gulu",
  "Lira",
  "Mbarara",
  "Masaka",
  "Kabale",
  "Fort Portal",
  "Soroti",
  "Arua",
  "Hoima",
  "Tororo",
  "Iganga",
  "Busia",
  "Moroto",
  "Kotido",
  "Other",
];

interface DeliveryAddressFormProps {
  onNext: () => void;
  onBack: () => void;
}

export function DeliveryAddressForm({ onNext, onBack }: DeliveryAddressFormProps) {
  const { deliveryAddress, setDeliveryAddress } = useCartStore();

  const [form, setForm] = useState<DeliveryAddress>({
    fullName: deliveryAddress?.fullName ?? "",
    phone: deliveryAddress?.phone ?? "",
    district: deliveryAddress?.district ?? "",
    subCounty: deliveryAddress?.subCounty ?? "",
    village: deliveryAddress?.village ?? "",
    landmark: deliveryAddress?.landmark ?? "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryAddress, string>>>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^(\+256|0)[0-9]{9}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Enter a valid Ugandan phone number";
    if (!form.district) e.district = "District is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setDeliveryAddress(form);
    onNext();
  };

  const field = (
    key: keyof DeliveryAddress,
    label: string,
    placeholder: string,
    required = false
  ) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground flex items-center gap-1">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        value={form[key] ?? ""}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`rounded-xl h-10 text-sm ${errors[key] ? "border-destructive" : "border-border/60"}`}
      />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={16} className="text-primary" />
        <h2 className="text-lg font-bold text-foreground font-serif">Delivery Details</h2>
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("fullName", "Full Name", "John Ssemakula", true)}
          {field("phone", "Phone Number", "+256 700 000 000", true)}
        </div>

        {/* District dropdown */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            District <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.district}
            onValueChange={(v) => setForm((f) => ({ ...f, district: v }))}
          >
            <SelectTrigger
              className={`rounded-xl h-10 text-sm ${errors.district ? "border-destructive" : "border-border/60"}`}
            >
              <SelectValue placeholder="Select your district" />
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground">
              {UGANDA_DISTRICTS.map((d) => (
                <SelectItem key={d} value={d} className="text-card-foreground">
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("subCounty", "Sub-County / Division", "Rubaga Division")}
          {field("village", "Village / Estate", "Namirembe")}
        </div>

        {field("landmark", "Landmark / Directions", "Near Owino market, blue gate")}

        {/* Delivery note */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <p className="text-xs text-primary font-medium">
            🚚 Estimated delivery: 2–4 business days · UGX 15,000 flat fee
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="rounded-xl h-11 px-6">
          ← Back
        </Button>
        <Button onClick={handleSubmit} className="flex-1 h-11 font-semibold rounded-xl gap-2">
          Continue to Payment <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  );
}
