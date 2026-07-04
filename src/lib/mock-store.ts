import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { seed, type SeedShape } from "@/mocks/seed";

interface Store extends SeedShape {
  reset: () => void;
  patch: <K extends keyof SeedShape>(key: K, updater: (items: SeedShape[K]) => SeedShape[K]) => void;
}

export const useDB = create<Store>()(
  persist(
    (set) => ({
      ...seed,
      reset: () => set({ ...seed }),
      patch: (key, updater) =>
        set((state) => ({ ...state, [key]: updater(state[key]) })),
    }),
    {
      name: "eduislam-mock-db-v1",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as unknown as Storage))),
    },
  ),
);

export function genId(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
