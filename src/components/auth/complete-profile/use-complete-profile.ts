/** All state and submit logic for the complete-profile flow */

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { api, ApiError } from "@/api/api";
import { useAuthStore } from "@/store/auth-store";
import { useSignUpStore } from "@/store/useSignUpStore";
import { AuthenticatedUser, UserRole } from "@/types/profile";

interface CompleteProfilePayload {
  role: UserRole;
  phone: string;
  district: string;
  specialties?: string[];
  interests?: string[];
}

export function useCompleteProfile() {
  const navigate = useNavigate();
  const { district, specialties, interests, setSpecialties, setIntrests, reset } = useSignUpStore();

  const [step, setStep] = useState<0 | 1>(0);
  const [role, setRoleState] = useState<UserRole | "">("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setExpired] = useState(false);

  /** Validation for step 1 details form */
  const step1Valid =
    phone.trim().length >= 9 &&
    district !== "" &&
    (role === "farmer" ? specialties.length > 0 : true) &&
    (role === "buyer" ? interests.length > 0 : true) &&
    (role === "both" ? specialties.length > 0 && interests.length > 0 : true);

  /** Clear picker state when role changes to avoid stale data */
  function handleRoleSelect(r: UserRole) {
    setRoleState(r);
    setError(null);
    setSpecialties([]);
    setIntrests([]);
  }

  function handleNext() {
    setError(null);
    setStep(1);
  }

  function handleBack() {
    setError(null);
    setStep(0);
  }

  async function handleSubmit() {
    if (!role || !step1Valid || isLoading) return;
    setIsLoading(true);
    setError(null);

    const payload: CompleteProfilePayload = {
      role: role as UserRole,
      phone: phone.trim(),
      district,
      ...(role === "farmer" || role === "both" ? { specialties } : {}),
      ...(role === "buyer" || role === "both" ? { interests: interests } : {}),
    };

    try {
      // setup_token HttpOnly cookie is sent automatically — no Bearer header needed
      await api.post("/auth/complete-profile", payload, null);

      // Real auth cookies are now set — hydrate the store
      const me = await api.get<AuthenticatedUser>("/users/me");
      useAuthStore.setState({ user: me, isLoading: false });

      reset();
      navigate({ to: "/marketplace" });
    } catch (err) {
      setIsLoading(false);

      if (err instanceof ApiError && err.status === 401) {
        setExpired(true);
        setError("Your setup session expired. Please sign in with Google again.");
      } else {
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      }
    }
  }

  function handleRetry() {
    window.location.href = `${import.meta.env.VITE_API_URL ?? ""}/auth/google/login`;
  }

  return {
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
  };
}
