/** Single selectable role option with radio indicator */

import { UserRole } from "@/types/profile";

interface Props {
  value: UserRole;
  selected: boolean;
  onSelect: (r: UserRole) => void;
  emoji: string;
  label: string;
  description: string;
}

export function RoleCard({ value, selected, onSelect, emoji, label, description }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={[
        "w-full text-left rounded-xl border-2 p-4",
        "flex items-start gap-4 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30",
      ].join(" ")}
    >
      <span className="text-xl mt-0.5 select-none">{emoji}</span>

      <span className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground leading-relaxed">{description}</span>
      </span>

      {/* Radio dot */}
      <span
        className={[
          "mt-1 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors",
          selected ? "border-primary" : "border-muted-foreground/30",
        ].join(" ")}
      >
        {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
      </span>
    </button>
  );
}
