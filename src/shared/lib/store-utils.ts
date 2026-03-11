"use client";

import { createJSONStorage } from "zustand/middleware";

/**
 * Returns standard persist config for Zustand stores.
 * Caller can spread and extend with `partialize` or other options.
 *
 * Usage:
 *   persist(creator, persistStore("my-key"))
 *   persist(creator, { ...persistStore("my-key"), partialize: ... })
 */
export function persistStore(name: string) {
  return {
    name,
    storage: createJSONStorage(() => localStorage),
  };
}
