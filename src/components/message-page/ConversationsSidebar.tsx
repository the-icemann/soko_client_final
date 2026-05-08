import { MessageSquarePlus, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessagesStore } from "@/store/useMessagesStore";

import { ConversationItem } from "./ConversationItem";

function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

export function ConversationsSidebar() {
  const { conversations, searchQuery, setSearchQuery, isLoadingConversations } = useMessagesStore();

  const filtered = conversations.filter(
    (c) =>
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.listingName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full border-r border-border bg-background">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold tracking-tight">Messages</h2>
          {conversations.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations…"
            className="pl-9 h-9 bg-muted/60 border-0 focus-visible:ring-1 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="p-2 flex flex-col gap-0.5">
          {isLoadingConversations ? (
            Array.from({ length: 5 }).map((_, i) => <ConversationSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
              <div className="size-12 rounded-2xl bg-muted flex items-center justify-center">
                <MessageSquarePlus className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {searchQuery ? "No results found" : "No conversations yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery
                    ? "Try a different name or listing"
                    : "Start a conversation by visiting a farmer's listing"}
                </p>
              </div>
            </div>
          ) : (
            filtered.map((c) => <ConversationItem key={c.id} conversation={c} />)
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
