import { useNotificationsStore } from "@/store/notification-store";
import { useEffect } from "react";

export function useNotifications() {
  const store = useNotificationsStore();

  useEffect(() => {
    store.fetchNotifications(store.filter === "unread");
    store.fetchUnreadCount();
    store.connectWS();

    return () => store.disconnectWS();
  }, [store]);

  const unread = store.notifications.filter((n) => !n.isRead);

  return {
    notifications: store.filter === "unread" ? unread : store.notifications,
    unreadCount: store.unreadCount,
    isLoading: store.isLoading,
    filter: store.filter,
    setFilter: store.setFilter,
    markRead: store.markRead,
    markAllRead: store.markAllRead,
  };
}

export function useUnreadCount() {
  return useNotificationsStore((s) => s.unreadCount);
}