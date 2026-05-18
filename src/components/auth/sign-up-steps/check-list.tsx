import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

import { OnboardingChecklist } from "../OnboardingChecklist";

export function CheckList() {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();

  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate({ to: "/home" });
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleResend() {
    setResendState("sending");
    try {
      await api.post("/auth/resend-verification", {}, token); // TODO: confirm endpoint with your FastAPI
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <h3 className="font-bold text-2xl sm:text-3xl">You're all set! 🎉</h3>
        <p className="text-muted-foreground text-sm mt-2">
          Welcome to Soko. Start exploring the marketplace.
        </p>
      </div>

      <div className="flex flex-col items-center text-center gap-3 rounded-xl p-6 w-full">
        <div className="flex size-16 sm:size-20 items-center justify-center rounded-3xl text-4xl animate-[glowPulse_2s_ease-in-out_infinite]">
          🎊
        </div>
        <h4 className="font-bold text-lg sm:text-xl">Account Created!</h4>
        <p className="text-xs sm:text-sm">
          Welcome to Soko, <span className="font-semibold">{user?.name ?? "there"}</span>
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          We've sent a verification email to{" "}
          <span className="font-semibold text-foreground">
            {user?.email ?? "your email address"}
          </span>
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <OnboardingChecklist />

        <Button className="w-full h-11" onClick={() => navigate({ to: "/home" })}>
          Go to Home {countdown > 0 && `(${countdown})`}
        </Button>

        <Button
          className="w-full h-11"
          variant="ghost"
          disabled={resendState === "sending" || resendState === "sent"}
          onClick={handleResend}
        >
          {resendState === "sending" && "Sending…"}
          {resendState === "sent" && "Email sent ✓"}
          {resendState === "error" && "Failed — tap to retry"}
          {resendState === "idle" && "Resend verification email"}
        </Button>

        {resendState === "error" && (
          <p className="text-xs text-destructive">Couldn't resend the email. Please try again.</p>
        )}
      </div>
    </div>
  );
}
