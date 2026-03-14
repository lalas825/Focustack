"use client";

import { create } from "zustand";
import type { Task, TasksMap, Priority } from "@/shared/types";
import { createClient } from "@/lib/supabase/client";
import { syncToSupabase } from "@/shared/lib/supabase-sync";

interface TasksState {
  tasks: TasksMap;
  userId: string | null;
  addTask: (projectId: string, text: string, priority?: Priority, estimationMinutes?: number | null) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  refreshTasks: () => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: {},
  userId: null,

  addTask: (projectId, text, priority = "medium", estimationMinutes = null) => {
    if (!text.trim()) return;
    const userId = get().userId;
    if (!userId) return;

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newTask: Task = { id, text: text.trim(), done: false, createdAt, priority, estimationMinutes: estimationMinutes ?? null };

    const snapshot = get().tasks;
    const updated = { ...snapshot };
    updated[projectId] = [...(updated[projectId] || []), newTask];
    set({ tasks: updated });

    syncToSupabase({
      op: () => createClient().from("tasks").insert({ id, user_id: userId, project_id: projectId, text: newTask.text, done: false, created_at: createdAt, priority, estimation_minutes: estimationMinutes ?? null }),
      rollbackState: snapshot,
      restore: (s) => set({ tasks: s }),
      errorKey: "error.taskAdd",
    });
  },

  toggleTask: (projectId, taskId) => {
    const userId = get().userId;
    if (!userId) return;

    const snapshot = get().tasks;
    const updated = { ...snapshot };
    let newDone = false;
    updated[projectId] = (updated[projectId] || []).map((t) => {
      if (t.id === taskId) {
        newDone = !t.done;
        return { ...t, done: newDone };
      }
      return t;
    });
    set({ tasks: updated });

    syncToSupabase({
      op: () => createClient().from("tasks").update({ done: newDone }).eq("id", taskId).eq("user_id", userId),
      rollbackState: snapshot,
      restore: (s) => set({ tasks: s }),
      errorKey: "error.taskToggle",
    });
  },

  deleteTask: (projectId, taskId) => {
    const userId = get().userId;
    if (!userId) return;

    const snapshot = get().tasks;
    const updated = { ...snapshot };
    updated[projectId] = (updated[projectId] || []).filter((t) => t.id !== taskId);
    set({ tasks: updated });

    syncToSupabase({
      op: () => createClient().from("tasks").delete().eq("id", taskId).eq("user_id", userId),
      rollbackState: snapshot,
      restore: (s) => set({ tasks: s }),
      errorKey: "error.taskDelete",
    });
  },

  refreshTasks: async () => {
    const userId = get().userId;
    if (!userId) return;

    const { data } = await createClient()
      .from("tasks")
      .select("id, project_id, text, done, created_at, priority, estimation_minutes")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (!data) return;

    const tasksMap: TasksMap = {};
    for (const row of data) {
      const task: Task = {
        id: row.id,
        text: row.text,
        done: row.done,
        createdAt: row.created_at,
        priority: row.priority || "medium",
        estimationMinutes: row.estimation_minutes ?? null,
      };
      if (!tasksMap[row.project_id]) tasksMap[row.project_id] = [];
      tasksMap[row.project_id].push(task);
    }
    set({ tasks: tasksMap });
  },
}));

// ─── SELECTORS (derived KPIs) ──────────────────────
function allTasks(state: TasksState): Task[] {
  return Object.values(state.tasks).flat();
}

/** KPI 1 – Enfoque: high-priority completion ratio */
export const selectFocusRate = (state: TasksState) => {
  const all = allTasks(state);
  const high = all.filter((t) => t.priority === "high");
  const highDone = high.filter((t) => t.done);
  return { done: highDone.length, total: high.length, rate: high.length > 0 ? Math.round((highDone.length / high.length) * 100) : 0 };
};

/** KPI 2 – Productividad: estimated hours from completed tasks */
export const selectProductivityHours = (state: TasksState) => {
  const completed = allTasks(state).filter((t) => t.done);
  const totalMin = completed.reduce((sum, t) => sum + (t.estimationMinutes ?? 0), 0);
  return { hours: Math.floor(totalMin / 60), minutes: totalMin % 60, totalMinutes: totalMin };
};

/** KPI 3 – Velocidad: tasks completed in the last 24h */
export const selectVelocityToday = (state: TasksState) => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const recent = allTasks(state).filter((t) => t.done && t.createdAt >= cutoff);
  return recent.length;
};
