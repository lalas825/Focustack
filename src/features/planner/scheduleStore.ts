"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { syncToSupabase } from "@/shared/lib/supabase-sync";

type Schedule = Record<number, string[]>; // dayIndex (0-6) → projectId[]

interface ScheduleState {
  schedule: Schedule;
  loaded: boolean;
  userId: string | null;
  toggleProject: (day: number, projectId: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedule: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  loaded: false,
  userId: null,

  toggleProject: (day, projectId) => {
    const userId = get().userId;
    if (!userId) return;

    const current = get().schedule;
    const snapshot = { ...current };
    const dayProjects = current[day] || [];
    const exists = dayProjects.includes(projectId);

    const updated: Schedule = {
      ...current,
      [day]: exists
        ? dayProjects.filter((id) => id !== projectId)
        : [...dayProjects, projectId],
    };
    set({ schedule: updated });

    syncToSupabase({
      op: () => {
        const supabase = createClient();
        return exists
          ? supabase.from("daily_assignments").delete().eq("user_id", userId).eq("day_of_week", day).eq("project_id", projectId)
          : supabase.from("daily_assignments").insert({ user_id: userId, day_of_week: day, project_id: projectId });
      },
      rollbackState: snapshot,
      restore: (s) => set({ schedule: s }),
      errorKey: "error.scheduleSync",
    });
  },
}));
