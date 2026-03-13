"use client";

import { create } from "zustand";
import type { HoursMap } from "@/shared/types";
import { PROJECTS } from "@/features/projects/data/projects";
import { getWeekStart } from "@/shared/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { syncToSupabaseNotifyOnly } from "@/shared/lib/supabase-sync";

function defaultHours(): HoursMap {
  const map: HoursMap = {};
  PROJECTS.forEach((p) => (map[p.id] = 0));
  return map;
}

interface HoursState {
  hours: HoursMap;
  weekStart: string;
  addSeconds: (projectId: string, seconds: number) => void;
}

async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const useHoursStore = create<HoursState>((set, get) => ({
  hours: defaultHours(),
  weekStart: getWeekStart(),

  addSeconds: (projectId, seconds) => {
    const currentWeek = getWeekStart();
    const state = get();

    // Auto-reset if new week
    if (state.weekStart !== currentWeek) {
      set({ hours: defaultHours(), weekStart: currentWeek });
    }

    const updated = { ...get().hours };
    updated[projectId] = (updated[projectId] || 0) + seconds;
    set({ hours: updated });

    // Notify-only — no rollback for accumulative timer ticks
    getUserId().then((userId) => {
      if (!userId) return;
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
    });
  },
}));
