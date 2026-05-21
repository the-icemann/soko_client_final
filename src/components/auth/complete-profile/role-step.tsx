/** Step 0 — user picks farmer / buyer / both */

import { MoveRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { UserRole } from "@/types/profile";

import { RoleCard } from "./role-card";

const ROLES: { value: UserRole; emoji: string; label: string; description: string }[] = [
  {
    value: "buyer",
    emoji: "🛒",
    label: "I'm a buyer",
    description: "Browse and purchase fresh produce directly from local farmers.",
  },
  {
    value: "farmer",
    emoji: "🌱",
    label: "I'm a farmer",
    description: "List my produce and sell directly to customers near me.",
  },
  {
    value: "both",
    emoji: "🤝",
    label: "Both",
    description: "I grow produce and also buy from other farmers.",
  },
];

interface Props {
  role: UserRole | "";
  onSelect: (r: UserRole) => void;
  onNext: () => void;
}

export function RoleStep({ role, onSelect, onNext }: Props) {
  return (
    <FieldGroup>
      <Field>
        <h3 className="font-bold text-2xl text-foreground">Almost there!</h3>
        <p className="text-sm text-muted-foreground mt-1">
          How will you be using Soko? You can always change this later.
        </p>
      </Field>

      <Field>
        <div className="flex flex-col gap-3">
          {ROLES.map((r) => (
            <RoleCard key={r.value} {...r} selected={role === r.value} onSelect={onSelect} />
          ))}
        </div>
      </Field>

      <Field>
        <Button type="button" className="w-full h-11 mt-2" disabled={role === ""} onClick={onNext}>
          Continue <MoveRight size={16} className="ml-1" />
        </Button>
      </Field>
    </FieldGroup>
  );
}
