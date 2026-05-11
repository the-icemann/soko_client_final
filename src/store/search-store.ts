import { create } from "zustand";

interface SearchState {
  query: string;
  activeTab: string;
  setQuery: (q: string) => void;
  setActiveTab: (tab: string) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  activeTab: "farmers",

  setQuery: (query) => set({ query }),
  setActiveTab: (tab) => set({ activeTab: tab, query: "" }),
  reset: () => set({ query: "", activeTab: "farmers" }),
}));
