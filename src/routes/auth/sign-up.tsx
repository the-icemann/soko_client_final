import { createFileRoute, redirect } from "@tanstack/react-router";

import AuthLayout from "@/components/auth/auth-layout";
import { panel } from "@/components/auth/sign-up-panel";
import { StepWrapper } from "@/components/auth/sign-up-steps/StepWrapper";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/auth/sign-up")({
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated()) throw redirect({ to: "/home" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AuthLayout panel={panel}>
      <StepWrapper />
    </AuthLayout>
  );
}
