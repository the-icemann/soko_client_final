import { api } from "@/api/api";

export interface NotificationOut {
  id: string;
  type: string;
  channel: string;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCountOut {
  unread: number;
}

// ── GET /notifications/me ─────────────────────────────────────────────────────

export interface FetchNotificationsParams {
  unread_only?: boolean;
  page?: number;
  limit?: number;
}

export function fetchNotifications(
  token: string,
  params: FetchNotificationsParams = {}
): Promise<NotificationOut[]> {
  const { unread_only = false, page = 1, limit = 20 } = params;
  const qs = new URLSearchParams({
    unread_only: String(unread_only),
    page: String(page),
    limit: String(limit),
  });
  return api.get<NotificationOut[]>(`notifications/me?${qs}`, token);
}

// ── GET /notifications/me/unread-count ───────────────────────────────────────

export function fetchUnreadCount(token: string): Promise<UnreadCountOut> {
  return api.get<UnreadCountOut>("notifications/me/unread-count", token);
}

// ── PUT /notifications/me/read ────────────────────────────────────────────────

export function markNotificationsRead(ids: string[], token: string): Promise<{ updated: number }> {
  return api.put<{ updated: number }>("notifications/me/read", { notification_ids: ids }, token);
}

// ── PUT /notifications/me/read-all ────────────────────────────────────────────

export function markAllNotificationsRead(token: string): Promise<{ updated: number }> {
  return api.put<{ updated: number }>("notifications/me/read-all", {}, token);
}
