"use client";

import { create } from "zustand";
import type { HoursMap } from "@/shared/types";
import { getWeekStart } from "@/shared/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { syncToSupabaseNotifyOnly } from "@/shared/lib/supabase-sync";

interface HoursState {
  hours: HoursMap;
  weekStart: string;
  userId: string | null;
  addSeconds: (projectId: string, seconds: number) => void;
}

export const useHoursStore = create<HoursState>((set, get) => ({
  hours: {},
  weekStart: getWeekStart(),
  userId: null,

  addSeconds: (projectId, seconds) => {
    const userId = get().userId;
    if (!userId) return;

    const currentWeek = getWeekStart();
    const state = get();

    if (state.weekStart !== currentWeek) {
      set({ hours: {}, weekStart: currentWeek });
    }

    const updated = { ...get().hours };
    updated[projectId] = (updated[projectId] || 0) + seconds;
    set({ hours: updated });

    syncToSupabaseNotifyOnly({
      op: () => createClient().from("weekly_hours").upsert(
        {
          user_id: userId,
          project_id: projectId,
          week_start: currentWeek,
          seconds: updated[projectId],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,project_id,week_start" }
      ),
      errorKey: "error.hoursSyncFailed",
    });
  },
}));
