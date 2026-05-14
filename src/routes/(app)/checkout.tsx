import { useAuthStore } from "@/store/auth-store";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/checkout")({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated()) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
  component: () => <Outlet />,
});
