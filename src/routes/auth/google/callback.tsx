import { createFileRoute, redirect } from "@tanstack/react-router";

import { useAuthStore } from "@/store/auth-store";
import { useMessagesStore } from "@/store/useMessagesStore";
import { AuthenticatedUser } from "@/types/profile";

type CallbackSearch = {
  access_token?: string;
  error?: string;
};

export const Route = createFileRoute("/auth/google/callback")({
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    access_token: search.access_token as string | undefined,
    error: search.error as string | undefined,
  }),

  beforeLoad: async ({ search }) => {
    const { access_token, error } = search;

    if (error) {
      throw redirect({ to: "/auth/sign-in" });
    }

    if (!access_token) {
      throw redirect({ to: "/auth/sign-in" });
    }

    const res = await fetch("/auth/me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!res.ok) {
      throw redirect({ to: "/auth/sign-in" });
    }

    const user: AuthenticatedUser = await res.json();

    useAuthStore.setState({ token: access_token, user });
    useMessagesStore.getState().connectWS();

    throw redirect({ to: "/home" });
  },

  component: () => (
    <div className="flex items-center justify-center h-screen">
      <p>Signing you in with Google...</p>
    </div>
  ),
});
