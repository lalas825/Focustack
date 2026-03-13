"use client";

import { create } from "zustand";
import type { SessionLog } from "@/shared/types";
import { createClient } from "@/lib/supabase/client";
import { syncToSupabase } from "@/shared/lib/supabase-sync";

interface LogsState {
  logs: SessionLog[];
  userId: string | null;
  addLog: (log: SessionLog) => void;
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: [],
  userId: null,

  addLog: (log) => {
    const userId = get().userId;
    if (!userId) return;

    const snapshot = [...get().logs];
    const updated = [log, ...snapshot].slice(0, 100);
    set({ logs: updated });

    syncToSupabase({
      op: () => createClient().from("session_logs").insert({
        user_id: userId,
        date: log.date,
        day: log.day,
        project_id: log.projectId,
        project_name: log.projectName,
        hours_logged: log.hoursLogged,
        completed: log.completed,
        blockers: log.blockers,
        tomorrow_project: log.tomorrowProject,
      }),
      rollbackState: snapshot,
      restore: (s) => set({ logs: s }),
      errorKey: "error.logSync",
    });
  },
}));
