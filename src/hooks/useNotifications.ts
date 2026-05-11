import { useEffect } from "react";

import { useNotificationsStore } from "@/store/notification-store";

/**
 * Full notification hook — fetches, filters, and manages the WS connection.
 * WS connects on mount and cleanly disconnects on unmount.
 */
export function useNotifications() {
  const store = useNotificationsStore();

  /* Re-fetch when filter changes — dependency is honest */
  useEffect(() => {
    store.fetchNotifications(store.filter === "unread");
  }, [store.filter]);

  /* WS lifecycle — connect once, disconnect on unmount */
  useEffect(() => {
    store.connectWS();
    return () => store.disconnectWS();
  }, []);

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
 * Lightweight badge-only hook.
 * Fetches the count once — safe in nav/header without a full notification fetch.
 */
export function useUnreadCount() {
  const { unreadCount, fetchUnreadCount } = useNotificationsStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]); // ← stable Zustand reference, won't loop

  return unreadCount;
}
