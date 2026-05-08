import { create } from "zustand";

import { UserRole } from "@/types/profile";

// ── State shape

interface SignUpStore {
  current: number;
  canProceed: boolean;
  role: UserRole | "";
  district: string;
  specialties: string[]; // max 3, only relevant for farmer / both
  intrests: string[];

  // Setters
  setCanProceed: (valid: boolean) => void;
  setRole: (role: UserRole) => void;
  setSpecialties: (specialties: string[]) => void;
  setDistrict: (district: string) => void;
  setIntrests: (intrests: string[]) => void;

  // Step navigation
  next: () => void;
  back: () => void;
  reset: () => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useSignUpStore = create<SignUpStore>((set, get) => ({
  current: 0,
  canProceed: false,
  role: "",
  district: "",
  specialties: [],
  intrests: [],

  setCanProceed: (valid) => set({ canProceed: valid }),
  setRole: (role) => set({ role, canProceed: !!role }),
  setSpecialties: (specialties) => set({ specialties: specialties.slice(0, 3) }), // enforce max 3
  setDistrict: (district) => set({ district }),
  setIntrests: (intrests) => set({ intrests: intrests.slice(0, 3) }),

  next: () => {
    const { current, canProceed } = get();
    if (!canProceed) return;
    set({ current: current + 1, canProceed: false });
  },
  back: () => {
    const { current } = get();
    if (current === 0) return;
    set({ current: current - 1, canProceed: true });
  },

  // Call this after a successful register()
  reset: () => set({ current: 0, canProceed: false, role: "", district: "", specialties: [] }),
}));
