import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ConversationOut } from "@/store/useMessagesStore";
import { useMessagesStore } from "@/store/useMessagesStore";

import { ConversationAvatar } from "./ConversationAvatar";

export function ConversationItem({ conversation }: { conversation: ConversationOut }) {
  const { activeConversationId, setActiveConversation } = useMessagesStore();
  const isActive = activeConversationId === conversation.id;

  const timeAgo = conversation.lastMessageAt
    ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
    : null;

  return (
    <button
      onClick={() => setActiveConversation(conversation.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 text-left transition-all rounded-xl",
        "hover:bg-accent/70",
        isActive && "bg-accent shadow-sm"
      )}
    >
      <ConversationAvatar user={conversation.participant} showOnline size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold truncate">{conversation.participant.name}</span>
          {timeAgo && <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo}</span>}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {conversation.lastMessage ?? <span className="italic opacity-60">No messages yet</span>}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge className="shrink-0 size-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </Badge>
          )}
        </div>

        {conversation.listingName && (
          <span className="inline-flex items-center mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
            {conversation.listingName}
          </span>
        )}
      </div>
    </button>
  );
}
