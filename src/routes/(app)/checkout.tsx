import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/(app)/checkout")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  component: () => <Outlet />,
});
