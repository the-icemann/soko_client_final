import { create } from "zustand";

import { api } from "@/api/api";
import { useAuthStore } from "@/store/auth-store";

// ── Types matching backend exactly ────────────────────────────────────────────

export interface MessageOut {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  body: string; // "" when isDeleted
  status: "sent" | "read";
  isDeleted: boolean;
  isMine: boolean; // pre-computed by backend — use this directly
  createdAt: string;
}

export interface ParticipantOut {
  id: string;
  name: string;
  initials: string;
  avatar: string | null;
}

export interface ConversationOut {
  id: string;
  participant: ParticipantOut;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  listingId: string | null;
  listingName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetailOut {
  conversation: ConversationOut;
  messages: MessageOut[];
}

export interface StartConversationOut {
  conversation: ConversationOut;
  message: MessageOut;
  isNew: boolean;
}

// ── Typing state ──────────────────────────────────────────────────────────────

interface TypingState {
  conversationId: string;
  senderId: string;
}

// ── Store interface ───────────────────────────────────────────────────────────

interface MessagesStore {
  // State
  conversations: ConversationOut[];
  messages: Record<string, MessageOut[]>;
  activeConversationId: string | null;
  searchQuery: string;
  isMobileConversationOpen: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  typingUsers: TypingState[];
  ws: WebSocket | null;

  // Actions
  connectWS: () => void;
  disconnectWS: () => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (id: string) => void;
  sendMessage: (text: string) => Promise<void>;
  deleteMessage: (conversationId: string, messageId: string) => Promise<void>;
  startConversation: (
    farmerId: string,
    firstMessage: string,
    listingId?: string
  ) => Promise<string>;
  markAsRead: (conversationId: string, messageId: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  closeMobileConversation: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  conversations: [],
  messages: {},
  activeConversationId: null,
  searchQuery: "",
  isMobileConversationOpen: false,
  isLoadingConversations: false,
  isLoadingMessages: false,
  typingUsers: [],
  ws: null,

  // ── WebSocket ──────────────────────────────────────────────────────────────

  connectWS: () => {
    const { token, user } = useAuthStore.getState();
    if (!token || !user) return;

    const socket = new WebSocket(`ws://localhost/message/ws/${user.id}?token=${token}`);

    socket.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);
      const { messages, conversations, activeConversationId } = get();

      switch (event) {
        case "new_message": {
          const msg = data as MessageOut;
          // Append to message list
          set({
            messages: {
              ...messages,
              [msg.conversationId]: [...(messages[msg.conversationId] ?? []), msg],
            },
            // Update conversation preview
            conversations: conversations.map((c) =>
              c.id === msg.conversationId
                ? {
                    ...c,
                    lastMessage: msg.body,
                    lastMessageAt: msg.createdAt,
                    unreadCount:
                      activeConversationId === msg.conversationId
                        ? c.unreadCount
                        : c.unreadCount + 1,
                  }
                : c
            ),
          });
          // Auto mark as read if conversation is open
          if (activeConversationId === msg.conversationId) {
            get().markAsRead(msg.conversationId, msg.id);
          }
          break;
        }

        case "message_read": {
          const { messageId, conversationId } = data;
          set({
            messages: {
              ...messages,
              [conversationId]: (messages[conversationId] ?? []).map((m) =>
                m.id === messageId ? { ...m, status: "read" } : m
              ),
            },
          });
          break;
        }

        case "message_deleted": {
          const { messageId, conversationId } = data;
          set({
            messages: {
              ...messages,
              [conversationId]: (messages[conversationId] ?? []).map((m) =>
                m.id === messageId ? { ...m, isDeleted: true, body: "" } : m
              ),
            },
          });
          break;
        }

        case "typing": {
          const { conversationId, senderId } = data;
          set((s) => ({
            typingUsers: [
              ...s.typingUsers.filter((t) => t.senderId !== senderId),
              { conversationId, senderId },
            ],
          }));
          break;
        }

        case "stop_typing": {
          const { senderId } = data;
          set((s) => ({
            typingUsers: s.typingUsers.filter((t) => t.senderId !== senderId),
          }));
          break;
        }
      }
    };

    socket.onclose = () => set({ ws: null });
    set({ ws: socket });
  },

  disconnectWS: () => {
    get().ws?.close();
    set({ ws: null });
  },

  // ── REST actions ───────────────────────────────────────────────────────────

  fetchConversations: async () => {
    const token = useAuthStore.getState().token;
    set({ isLoadingConversations: true });
    try {
      const conversations = await api.get<ConversationOut[]>("/message/conversations", token);
      set({ conversations });
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  fetchMessages: async (conversationId) => {
    const token = useAuthStore.getState().token;
    set({ isLoadingMessages: true });
    try {
      const detail = await api.get<ConversationDetailOut>(
        `/message/conversations/${conversationId}`,
        token
      );
      set((s) => ({
        messages: { ...s.messages, [conversationId]: detail.messages },
        conversations: s.conversations.map((c) =>
          c.id === conversationId ? detail.conversation : c
        ),
      }));
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id, isMobileConversationOpen: true });
    if (!get().messages[id]) {
      get().fetchMessages(id);
    }
  },

  sendMessage: async (text) => {
    const { activeConversationId } = get();
    const token = useAuthStore.getState().token;
    if (!activeConversationId || !text.trim()) return;

    const msg = await api.post<MessageOut>(
      `/message/${activeConversationId}/messages`,
      { body: text.trim() },
      token
    );

    // Optimistically add own message (backend also pushes via WS to recipient)
    set((s) => ({
      messages: {
        ...s.messages,
        [activeConversationId]: [...(s.messages[activeConversationId] ?? []), msg],
      },
      conversations: s.conversations.map((c) =>
        c.id === activeConversationId
          ? { ...c, lastMessage: msg.body, lastMessageAt: msg.createdAt }
          : c
      ),
    }));
  },

  deleteMessage: async (conversationId, messageId) => {
    const token = useAuthStore.getState().token;
    await api.delete(`/message/${conversationId}/messages/${messageId}`, token);
    // Soft-delete locally (backend also broadcasts via WS)
    set((s) => ({
      messages: {
        ...s.messages,
        [conversationId]: (s.messages[conversationId] ?? []).map((m) =>
          m.id === messageId ? { ...m, isDeleted: true, body: "" } : m
        ),
      },
    }));
  },

  startConversation: async (farmerId, firstMessage, listingId) => {
    const token = useAuthStore.getState().token;
    const result = await api.post<StartConversationOut>(
      "/message/conversations",
      { farmer_id: farmerId, first_message: firstMessage, listing_id: listingId ?? null },
      token
    );
    set((s) => ({
      conversations: result.isNew ? [result.conversation, ...s.conversations] : s.conversations,
      messages: {
        ...s.messages,
        [result.conversation.id]: [result.message],
      },
    }));
    return result.conversation.id;
  },

  markAsRead: async (conversationId, messageId) => {
    const token = useAuthStore.getState().token;
    await api.post(`/message/${conversationId}/messages/${messageId}/read`, {}, token);
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  closeMobileConversation: () => set({ isMobileConversationOpen: false }),
}));
