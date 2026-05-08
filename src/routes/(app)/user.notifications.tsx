import { createFileRoute } from "@tanstack/react-router";

import { NotificationEmptyState } from "@/components/notification-page/emptyState";
import { NotificationHeader } from "@/components/notification-page/Header";
import { NotificationItem } from "@/components/notification-page/Item";
import { NotificationSkeletonList } from "@/components/notification-page/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";

export const Route = createFileRoute("/(app)/user/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  const { notifications, unreadCount, isLoading, filter, setFilter, markRead, markAllRead } =
    useNotifications();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto w-full">
      <NotificationHeader
        unreadCount={unreadCount}
        filter={filter}
        onSetFilter={setFilter}
        onMarkAllRead={markAllRead}
        isLoading={isLoading}
      />

      <ScrollArea className="flex-1">
        <div className="px-2 sm:px-4 py-2">
          {isLoading && notifications.length === 0 ? (
            <NotificationSkeletonList count={7} />
          ) : notifications.length === 0 ? (
            <NotificationEmptyState filter={filter} />
          ) : (
            <div className="flex flex-col gap-0.5">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onMarkRead={(id) => markRead([id])} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
