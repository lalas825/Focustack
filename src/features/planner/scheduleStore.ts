"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

type Schedule = Record<number, string[]>; // dayIndex (0-6) → projectId[]

interface ScheduleState {
  schedule: Schedule;
  loaded: boolean;
  toggleProject: (day: number, projectId: string) => void;
}

async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedule: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  loaded: false,

  toggleProject: (day, projectId) => {
    const current = get().schedule;
    const dayProjects = current[day] || [];
    const exists = dayProjects.includes(projectId);

    const updated: Schedule = {
      ...current,
      [day]: exists
        ? dayProjects.filter((id) => id !== projectId)
        : [...dayProjects, projectId],
    };
    set({ schedule: updated });

    // Background sync
    getUserId().then((userId) => {
      if (!userId) return;
      const supabase = createClient();
      if (exists) {
        supabase
          .from("daily_assignments")
          .delete()
          .eq("user_id", userId)
          .eq("day_of_week", day)
          .eq("project_id", projectId)
          .then(({ error }) => { if (error) console.error("assignment delete:", error); });
      } else {
        supabase
          .from("daily_assignments")
          .insert({ user_id: userId, day_of_week: day, project_id: projectId })
          .then(({ error }) => { if (error) console.error("assignment insert:", error); });
      }
    });
  },
}));
