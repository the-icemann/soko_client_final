import { create } from "zustand";

import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationsRead,
  NotificationOut,
} from "@/api/notification.api";
import { useAuthStore } from "@/store/auth-store";

// ── Store interface ───────────────────────────────────────────────────────────

interface NotificationsStore {
  // State
  notifications: NotificationOut[];
  unreadCount: number;
  isLoading: boolean;
  filter: "all" | "unread";
  ws: WebSocket | null;

  // Actions
  fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (ids: string[]) => Promise<void>;
  markAllRead: () => Promise<void>;
  setFilter: (f: "all" | "unread") => void;
  connectWS: () => void;
  disconnectWS: () => void;
  pushNotification: (n: NotificationOut) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  filter: "all",
  ws: null,

  // ── Fetch list ─────────────────────────────────────────────────────────────

  fetchNotifications: async (unreadOnly = false) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      const data = await fetchNotifications(token, { unread_only: unreadOnly });
      set({ notifications: data });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Unread badge count ─────────────────────────────────────────────────────

  fetchUnreadCount: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      const { unread } = await fetchUnreadCount(token);
      set({ unreadCount: unread });
    } catch {
      // silent — badge failure shouldn't break the UI
    }
  },

  // ── Mark specific notifications read ──────────────────────────────────────

  markRead: async (ids) => {
    const token = useAuthStore.getState().token;
    if (!token || ids.length === 0) return;
    // Optimistic update
    set((s) => ({
      notifications: s.notifications.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(
        0,
        s.unreadCount -
          ids.filter((id) => s.notifications.find((n) => n.id === id && !n.isRead)).length
      ),
    }));
    try {
      await markNotificationsRead(ids, token);
    } catch {
      // Revert on failure by re-fetching
      get().fetchNotifications(get().filter === "unread");
    }
  },

  // ── Mark all read ──────────────────────────────────────────────────────────

  markAllRead: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    try {
      await markAllNotificationsRead(token);
    } catch {
      get().fetchNotifications();
      get().fetchUnreadCount();
    }
  },

  // ── Filter toggle ──────────────────────────────────────────────────────────

  setFilter: (filter) => {
    set({ filter });
    get().fetchNotifications(filter === "unread");
  },

  // ── WebSocket ──────────────────────────────────────────────────────────────

  connectWS: () => {
    const { token, user } = useAuthStore.getState();
    if (!token || !user || get().ws) return;

    const socket = new WebSocket(`ws://localhost/notifications/ws/${user.id}?token=${token}`);

    socket.onopen = () => {
      // Keep-alive ping every 30s
      const ping = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) socket.send("ping");
        else clearInterval(ping);
      }, 30_000);
    };

    socket.onmessage = (e) => {
      if (e.data === "pong") return;
      try {
        const notification = JSON.parse(e.data) as NotificationOut;
        get().pushNotification(notification);
      } catch {
        // ignore malformed frames
      }
    };

    socket.onclose = () => set({ ws: null });
    set({ ws: socket });
  },

  disconnectWS: () => {
    get().ws?.close();
    set({ ws: null });
  },

  // ── Push a single notification (from WS or optimistic) ────────────────────

  pushNotification: (notification) => {
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + (notification.isRead ? 0 : 1),
    }));
  },
}));
