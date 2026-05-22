import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";

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

    if (error) throw redirect({ to: "/auth/sign-in" });
    if (!access_token) throw redirect({ to: "/auth/sign-in" });

    try {
      await useAuthStore.getState().loginWithToken(access_token);
    } catch {
      throw redirect({ to: "/auth/sign-in" });
    }

    throw redirect({ to: "/home" });
  },

  component: () => (
    <div className="flex items-center justify-center h-screen">
      <p>Signing you in with Google...</p>
    </div>
  ),
});
