"use client";

import { create } from "zustand";
import type { SessionLog } from "@/shared/types";
import { createClient } from "@/lib/supabase/client";

interface LogsState {
  logs: SessionLog[];
  addLog: (log: SessionLog) => void;
}

async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],

  addLog: (log) => {
    const updated = [log, ...get().logs].slice(0, 100);
    set({ logs: updated });

    // Background sync
    getUserId().then((userId) => {
      if (!userId) return;
      createClient()
        .from("session_logs")
        .insert({
          user_id: userId,
          date: log.date,
          day: log.day,
          project_id: log.projectId,
          project_name: log.projectName,
          hours_logged: log.hoursLogged,
          completed: log.completed,
          blockers: log.blockers,
          tomorrow_project: log.tomorrowProject,
        })
        .then(({ error }) => { if (error) console.error("logs insert:", error); });
    });
  },
}));
