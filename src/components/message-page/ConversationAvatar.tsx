import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ParticipantOut } from "@/store/useMessagesStore";

interface Props {
  user: ParticipantOut;
  showOnline?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "size-8 text-[10px]",
  md: "size-10 text-xs",
  lg: "size-12 text-sm",
};

/** Deterministic hue from a string so every participant gets a consistent colour. */
function hueFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export function ConversationAvatar({ user, showOnline = false, size = "md" }: Props) {
  const hue = hueFromString(user.id);

  return (
    <div className="relative shrink-0">
      <Avatar className={SIZE[size]}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="object-cover" />
        ) : (
          <AvatarFallback
            className={cn("font-semibold", SIZE[size])}
            style={{
              background: `hsl(${hue} 55% 88%)`,
              color: `hsl(${hue} 55% 30%)`,
            }}
          >
            {user.initials}
          </AvatarFallback>
        )}
      </Avatar>
      {showOnline && (
        <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
      )}
    </div>
  );
}
