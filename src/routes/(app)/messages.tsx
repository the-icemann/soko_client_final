import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { ChatPanel } from "@/components/message-page/ChatPanel";
import { ConversationsSidebar } from "@/components/message-page/ConversationsSidebar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useMessagesStore } from "@/store/useMessagesStore";

export const Route = createFileRoute("/(app)/messages")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { isMobileConversationOpen, fetchConversations, connectWS, disconnectWS } =
    useMessagesStore();

  useEffect(() => {
    fetchConversations();
    connectWS();
    return () => disconnectWS();
  }, []);

  return (
    /*
     * h-[calc(100vh-VAR)] — replace VAR with your top-nav height (e.g. 4rem / 64px).
     * This gives the panel a fixed height so the inner ScrollAreas scroll properly
     * instead of the whole page growing to fit.
     */
    <div className="flex h-[calc(100dvh-8rem)] md:h-[calc(100dvh-4rem)] overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={cn(
          // Always visible on md+; on mobile it slides left when a chat is open
          "w-full md:w-80 lg:w-96 shrink-0 flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isMobileConversationOpen
            ? "-translate-x-full absolute inset-y-0 left-0 md:translate-x-0 md:relative md:inset-auto"
            : "translate-x-0 relative"
        )}
      >
        <ConversationsSidebar />
      </aside>

      {/* ── Chat panel ───────────────────────────────────────────── */}
      <main
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-0",
          // Hidden on mobile until a conversation is selected
          isMobileConversationOpen ? "flex" : "hidden md:flex"
        )}
      >
        <ChatPanel />
      </main>
    </div>
  );
}
