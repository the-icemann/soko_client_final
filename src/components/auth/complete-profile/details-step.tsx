/** Step 1 — phone, district, specialties / interests based on role */

import { MoveLeft } from "lucide-react";

import { DistrictSelect } from "@/components/auth/DistrictSelect";
import { IntrestPicker } from "@/components/auth/IntrestPicker";
import { SpecialtyPicker } from "@/components/auth/SpecialtyPicker";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/types/profile";

/** Heading copy keyed by role */
const COPY: Record<UserRole, { heading: string; subheading: string }> = {
  farmer: {
    heading: "Your farm details",
    subheading: "Help buyers find you and know what you grow.",
  },
  buyer: {
    heading: "Your preferences",
    subheading: "We'll show you the most relevant produce first.",
  },
  both: {
    heading: "A bit about you",
    subheading: "Help us connect you with the right farmers and buyers.",
  },
};

interface Props {
  role: UserRole;
  phone: string;
  isValid: boolean;
  isLoading: boolean;
  onPhoneChange: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function DetailsStep({
  role,
  phone,
  isValid,
  isLoading,
  onPhoneChange,
  onBack,
  onSubmit,
}: Props) {
  const { heading, subheading } = COPY[role];

  return (
    <FieldGroup>
      {/* Heading */}
      <Field>
        <h3 className="font-bold text-2xl text-foreground">{heading}</h3>
        <p className="text-sm text-muted-foreground mt-1">{subheading}</p>
      </Field>

      {/* Phone */}
      <Field>
        <FieldLabel htmlFor="cp-phone">
          Phone Number <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="cp-phone"
          type="tel"
          placeholder="7XX XXX XXX"
          className="h-11"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required
        />
        <FieldDescription>Used for order updates only. Never shared.</FieldDescription>
      </Field>

      {/* District — reads/writes useSignUpStore internally */}
      <DistrictSelect />

      {/* Pickers shown based on role */}
      {(role === "farmer" || role === "both") && <SpecialtyPicker />}
      {(role === "buyer" || role === "both") && <IntrestPicker />}

      {/* Submit */}
      <Field>
        <Button
          type="button"
          className="w-full h-11 mt-2"
          disabled={!isValid || isLoading}
          onClick={onSubmit}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Setting up your account…
            </span>
          ) : (
            "Finish setup"
          )}
        </Button>
      </Field>

      {/* Back */}
      <Field>
        <Button
          type="button"
          variant="ghost"
          className="w-full h-11"
          disabled={isLoading}
          onClick={onBack}
        >
          <MoveLeft size={16} className="mr-1" /> Back
        </Button>
      </Field>
    </FieldGroup>
  );
}
