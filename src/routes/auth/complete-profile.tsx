import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Sprout } from "lucide-react";
import { useEffect } from "react";

import { api } from "@/api/api";
import { DetailsStep } from "@/components/auth/complete-profile/details-step";
import { ErrorBanner } from "@/components/auth/complete-profile/error-banner";
import { RoleStep } from "@/components/auth/complete-profile/role-step";
import { StepDots } from "@/components/auth/complete-profile/step-dots";
import { useCompleteProfile } from "@/components/auth/complete-profile/use-complete-profile";
import { Logo } from "@/components/landing-page/logo";
import { useAuthStore } from "@/store/auth-store";
import { useMessagesStore } from "@/store/useMessagesStore";
import { useSignUpStore } from "@/store/useSignUpStore";
import { AuthenticatedUser } from "@/types/profile";

export const Route = createFileRoute("/auth/complete-profile")({
  validateSearch: (search: Record<string, unknown>) => ({
    access_token: (search.access_token as string) || undefined,
  }),

  beforeLoad: async ({ search }) => {
    // Returning Google user — access_token delivered via query param after OAuth.
    // Hydrate the store now so the redirect to /home lands authenticated.
    if (search.access_token) {
      try {
        const user = await api.get<AuthenticatedUser>("users/me", search.access_token);
        useAuthStore.setState({ user, token: search.access_token });
        useMessagesStore.getState().connectWS();
      } catch {
        throw redirect({ to: "/auth/sign-in" });
      }
      throw redirect({ to: "/home" });
    }

    // Already authenticated — no need to be here
    const { user, token } = useAuthStore.getState();
    if (user && token) throw redirect({ to: "/home" });

    useSignUpStore.getState().reset();
  },

  component: RouteComponent,
});

function RouteComponent() {
  const {
    step,
    role,
    phone,
    isLoading,
    error,
    sessionExpired,
    step1Valid,
    setPhone,
    handleRoleSelect,
    handleNext,
    handleBack,
    handleSubmit,
    handleRetry,
  } = useCompleteProfile();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <StepDots current={step} total={2} />

        {error && (
          <ErrorBanner message={error} onRetry={sessionExpired ? handleRetry : undefined} />
        )}

        {step === 0 && <RoleStep role={role} onSelect={handleRoleSelect} onNext={handleNext} />}

        {step === 1 && role !== "" && (
          <DetailsStep
            role={role}
            phone={phone}
            isValid={step1Valid}
            isLoading={isLoading}
            onPhoneChange={setPhone}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          You can update all of this later in your profile settings.
        </p>
      </div>
    </div>
  );
}
