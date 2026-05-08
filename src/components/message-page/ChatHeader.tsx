import { ArrowLeft, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessagesStore } from "@/store/useMessagesStore";

import { ConversationAvatar } from "./ConversationAvatar";

export function ChatHeader() {
  const { activeConversationId, conversations, closeMobileConversation, isLoadingMessages } =
    useMessagesStore();

  const conversation = conversations.find((c) => c.id === activeConversationId);

  if (!activeConversationId) return null;

  if (isLoadingMessages && !conversation) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  if (!conversation) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10">
      {/* Back — mobile only */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0 -ml-1 size-9"
        onClick={closeMobileConversation}
        aria-label="Back to conversations"
      >
        <ArrowLeft className="size-4" />
      </Button>

      <ConversationAvatar user={conversation.participant} showOnline size="md" />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate leading-tight">
          {conversation.participant.name}
        </p>
        {conversation.listingName && (
          <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
            Re:{" "}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {conversation.listingName}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9" aria-label="More options">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>View listings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              Block user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
