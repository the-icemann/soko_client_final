import { format, isToday, isYesterday } from "date-fns";
import { Check, CheckCheck, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MessageOut } from "@/store/useMessagesStore";
import { useMessagesStore } from "@/store/useMessagesStore";

function formatTime(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return `Yesterday ${format(d, "HH:mm")}`;
  return format(d, "d MMM, HH:mm");
}

export function MessageBubble({ message }: { message: MessageOut }) {
  const { deleteMessage, activeConversationId } = useMessagesStore();
  const [hovered, setHovered] = useState(false);

  if (message.isDeleted) {
    return (
      <div className={cn("flex", message.isMine ? "justify-end" : "justify-start")}>
        <p className="text-xs text-muted-foreground italic px-3 py-1.5 rounded-2xl bg-muted/50 border border-dashed border-border">
          Message deleted
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-1.5 group",
        message.isMine ? "justify-end" : "justify-start"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Delete action — only visible on hover for own messages */}
      {message.isMine && (
        <div
          className={cn(
            "transition-opacity duration-150 pb-1",
            hovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-muted-foreground hover:text-destructive"
            onClick={() => activeConversationId && deleteMessage(activeConversationId, message.id)}
            aria-label="Delete message"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
          message.isMine
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-card text-foreground border border-border/60 rounded-bl-sm"
        )}
      >
        {/* Show sender name in group-like contexts if not mine */}
        {!message.isMine && (
          <p className="text-[10px] font-semibold mb-1 opacity-60 uppercase tracking-wide">
            {message.senderName}
          </p>
        )}

        <p className="whitespace-pre-wrap break-words">{message.body}</p>

        <div
          className={cn(
            "flex items-center gap-1 mt-1.5",
            message.isMine ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-[10px] leading-none",
              message.isMine ? "text-primary-foreground/60" : "text-muted-foreground"
            )}
          >
            {formatTime(message.createdAt)}
          </span>
          {message.isMine &&
            (message.status === "read" ? (
              <CheckCheck className="size-3 text-primary-foreground/70" />
            ) : (
              <Check className="size-3 text-primary-foreground/50" />
            ))}
        </div>
      </div>
    </div>
  );
}
