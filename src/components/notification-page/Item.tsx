import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";

import type { NotificationOut } from "@/api/notification.api";
import { cn } from "@/lib/utils";

import { NotificationIcon } from "./Icon";

interface Props {
  notification: NotificationOut;
  onMarkRead: (id: string) => void;
}

function resolveRoute(entityType: string | null, entityId: string | null): string | null {
  if (!entityType) return null;
  if (entityType === "sell") return "/sell";
  if (!entityId) return null;
  switch (entityType) {
    case "listing":
      return `/marketplace/${entityId}`;
    case "profile":
      return `/farmers/${entityId}`;
    case "order":
      return `/profile`;
    case "message":
      return `/messages`;
    default:
      return null;
  }
}

export function NotificationItem({ notification, onMarkRead }: Props) {
  const { id, type, title, body, isRead, createdAt, entityType, entityId } = notification;
  const navigate = useNavigate();

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  function handleClick() {
    if (!isRead) onMarkRead(id);
    const route = resolveRoute(entityType, entityId);
    if (route) navigate({ to: route });
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors rounded-xl group",
        "hover:bg-accent/60",
        !isRead && "bg-primary/[0.03] dark:bg-primary/[0.06]"
      )}
    >
      {/* Icon */}
      <NotificationIcon type={type} size="md" />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-snug truncate",
              isRead ? "font-normal text-foreground" : "font-semibold text-foreground"
            )}
          >
            {title}
          </p>
          {/* Unread dot */}
          {!isRead && <span className="mt-1 size-2 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{body}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">{timeAgo}</p>
      </div>
    </button>
  );
}
