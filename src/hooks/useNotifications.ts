import { useEffect } from "react";

import { useNotificationsStore } from "@/store/notification-store";

/**
 * Drop-in hook for any component that needs notification data.
 * Fetches on mount and connects the WebSocket if not already open.
 */
export function useNotifications() {
  const store = useNotificationsStore();

  useEffect(() => {
    store.fetchNotifications(store.filter === "unread");
    store.fetchUnreadCount();
    store.connectWS();
    return () => store.disconnectWS();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const unread = store.notifications.filter((n) => !n.isRead);
  const displayed = store.filter === "unread" ? unread : store.notifications;

  return {
    notifications: displayed,
    unreadCount: store.unreadCount,
    isLoading: store.isLoading,
    filter: store.filter,
    setFilter: store.setFilter,
    markRead: store.markRead,
    markAllRead: store.markAllRead,
  };
}

/**
 * Lightweight hook — only the unread badge count.
 * Safe to use in nav/header components without triggering a full fetch.
 */
export function useUnreadCount() {
  const { unreadCount, fetchUnreadCount } = useNotificationsStore();

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return unreadCount;
}
