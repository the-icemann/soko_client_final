import { createFileRoute, redirect } from "@tanstack/react-router";
import { Sprout } from "lucide-react";

import { DetailsStep } from "@/components/auth/complete-profile/details-step";
import { ErrorBanner } from "@/components/auth/complete-profile/error-banner";
import { RoleStep } from "@/components/auth/complete-profile/role-step";
import { StepDots } from "@/components/auth/complete-profile/step-dots";
import { useCompleteProfile } from "@/components/auth/complete-profile/use-complete-profile";
import { Logo } from "@/components/landing-page/logo";
import { useAuthStore } from "@/store/auth-store";
import { useSignUpStore } from "@/store/useSignUpStore";

export const Route = createFileRoute("/auth/complete-profile")({
  beforeLoad: () => {
    const { user, token } = useAuthStore.getState();

    /* Already authenticated — redirect before anything renders */
    if (user && token) {
      throw redirect({ to: "/marketplace" });
    }

    /* Wipe stale signup store data from any previous session */
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
