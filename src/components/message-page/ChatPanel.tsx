import { MessageSquareDashed } from "lucide-react";
import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useMessagesStore } from "@/store/useMessagesStore";

import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-1.5 justify-start">
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border/60 shadow-sm">
        <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">{name} is typing</p>
        <div className="flex gap-1 items-center h-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
              style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageSkeleton({ mine }: { mine: boolean }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <Skeleton className={`h-10 rounded-2xl ${mine ? "w-48" : "w-64"}`} />
    </div>
  );
}

export function ChatPanel() {
  const { activeConversationId, messages, conversations, isLoadingMessages, typingUsers } =
    useMessagesStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const activeMessages = activeConversationId ? (messages[activeConversationId] ?? []) : [];
  const conversation = conversations.find((c) => c.id === activeConversationId);

  const activeTypers = typingUsers.filter((t) => t.conversationId === activeConversationId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length, activeTypers.length]);

  /* ── No conversation selected ── */
  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8 bg-muted/20">
        <div className="size-20 rounded-3xl bg-background border border-border shadow-sm flex items-center justify-center">
          <MessageSquareDashed className="size-9 text-muted-foreground" />
        </div>
        <div className="max-w-xs">
          <p className="font-semibold text-base">Select a conversation</p>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Pick an existing conversation from the sidebar, or visit a listing to start a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ChatHeader />

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-2">
          {/* Loading skeletons */}
          {isLoadingMessages && activeMessages.length === 0 && (
            <>
              <MessageSkeleton mine={false} />
              <MessageSkeleton mine={true} />
              <MessageSkeleton mine={false} />
              <MessageSkeleton mine={true} />
              <MessageSkeleton mine={false} />
            </>
          )}

          {/* Empty conversation state */}
          {!isLoadingMessages && activeMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
                <MessageSquareDashed className="size-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Say hi to{" "}
                  <span className="font-medium">{conversation?.participant.name ?? "them"}</span>!
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {activeMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicators */}
          {activeTypers.map((t) => (
            <TypingIndicator key={t.senderId} name={t.senderId} />
          ))}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}
