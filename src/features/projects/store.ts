"use client";

import { create } from "zustand";
import type { Task, TasksMap } from "@/shared/types";
import { PROJECTS } from "@/features/projects/data/projects";
import { createClient } from "@/lib/supabase/client";

function defaultTasks(): TasksMap {
  const map: TasksMap = {};
  PROJECTS.forEach((p) => (map[p.id] = []));
  return map;
}

interface TasksState {
  tasks: TasksMap;
  addTask: (projectId: string, text: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  deleteTask: (projectId: string, taskId: string) => void;
}

async function getUserId(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: defaultTasks(),

  addTask: (projectId, text) => {
    if (!text.trim()) return;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newTask: Task = { id, text: text.trim(), done: false, createdAt };

    const updated = { ...get().tasks };
    updated[projectId] = [...(updated[projectId] || []), newTask];
    set({ tasks: updated });

    // Background sync
    getUserId().then((userId) => {
      if (!userId) return;
      createClient()
        .from("tasks")
        .insert({ id, user_id: userId, project_id: projectId, text: newTask.text, done: false, created_at: createdAt })
        .then(({ error }) => { if (error) console.error("tasks insert:", error); });
    });
  },

  toggleTask: (projectId, taskId) => {
    const updated = { ...get().tasks };
    let newDone = false;
    updated[projectId] = (updated[projectId] || []).map((t) => {
      if (t.id === taskId) {
        newDone = !t.done;
        return { ...t, done: newDone };
      }
      return t;
    });
    set({ tasks: updated });

    getUserId().then((userId) => {
      if (!userId) return;
      createClient()
        .from("tasks")
        .update({ done: newDone })
        .eq("id", taskId)
        .eq("user_id", userId)
        .then(({ error }) => { if (error) console.error("tasks update:", error); });
    });
  },

  deleteTask: (projectId, taskId) => {
    const updated = { ...get().tasks };
    updated[projectId] = (updated[projectId] || []).filter((t) => t.id !== taskId);
    set({ tasks: updated });

    getUserId().then((userId) => {
      if (!userId) return;
      createClient()
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .eq("user_id", userId)
        .then(({ error }) => { if (error) console.error("tasks delete:", error); });
    });
  },
}));
