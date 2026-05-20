import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api } from "@/api/api";
import {
  AuthenticatedUser,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  ThemePreference,
  UserSettings,
} from "@/types/profile";

import { useMessagesStore } from "./useMessagesStore";
//  Mock users (swap with real JWT/session)

const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  notificationsEmail: true,
  notificationsSms: true,
  notificationsPush: true,
  language: "en",
  currency: "UGX",
};

// Store

interface AuthStore {
  user: AuthenticatedUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  settings: UserSettings;

  //Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  handleGoogleLogin: () => void;

  //Helpers
  isFarmer: () => boolean;
  isBuyer: () => boolean;
  isBoth: () => boolean;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      settings: DEFAULT_SETTINGS,
      theme: "",

      //Login
      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { tokens } = await api.post<AuthTokens>("auth/login", payload);
          const user = await api.get<AuthenticatedUser>("users/me", tokens.access_token);

          set({ user, token: tokens.access_token, isLoading: false });
          useMessagesStore.getState().connectWS();
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
          throw err;
        }
      },

      //Register
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { tokens } = await api.post<AuthTokens>("auth/register", payload);
          const user = await api.get<AuthenticatedUser>("users/me", tokens.access_token);
          set({ user, token: tokens.access_token, isLoading: false });
          useMessagesStore.getState().connectWS();
        } catch (err) {
          set({ error: (err as Error).message, isLoading: false });
          throw err;
        }
      },

      //Logout
      logout: () => {
        useMessagesStore.getState().disconnectWS();
        set({ user: null, token: null, error: null });
      },

      //Google Auth
      handleGoogleLogin: () => {
        window.location.href = `${import.meta.env.VITE_API_URL}auth/google/login`;
      },

      //Settings Update
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      clearError: () => set({ error: null }),

      // Helpers
      isFarmer: () => {
        const role = get().user?.role;
        return role === "farmer" || role === "both";
      },

      isBuyer: () => {
        const role = get().user?.role;
        return role === "buyer" || role === "both";
      },

      isBoth: () => get().user?.role === "both",

      isAuthenticated: () => !!get().token && !!get().user,
    }),
    {
      name: "soko-auth",
      partialize: (s) => ({ user: s.user, settings: s.settings, token: s.token }),
    }
  )
);
