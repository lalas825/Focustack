"use client";

import { create } from "zustand";
import type { Project } from "@/shared/types";
import { createClient } from "@/lib/supabase/client";
import { syncToSupabase } from "@/shared/lib/supabase-sync";

interface CustomProjectsState {
  projects: Project[];
  userId: string | null;
  addProject: (name: string, emoji: string, color: string) => void;
  updateProject: (id: string, fields: { name?: string; emoji?: string; color?: string; targetHours?: number; githubRepo?: string }) => void;
  completeProject: (id: string) => void;
  removeProject: (id: string) => void;
}

export const useCustomProjectsStore = create<CustomProjectsState>((set, get) => ({
  projects: [],
  userId: null,

  addProject: (name, emoji, color) => {
    const userId = get().userId;
    if (!userId) return;

    const id = crypto.randomUUID();
    const newProject: Project = {
      id,
      name,
      emoji,
      color,
      targetHours: 0,
      days: [],
      status: "active",
    };

    const snapshot = [...get().projects];
    set({ projects: [...snapshot, newProject] });

    syncToSupabase({
      op: () => createClient().from("user_projects").insert({ id, user_id: userId, name, emoji, color }),
      rollbackState: snapshot,
      restore: (s) => set({ projects: s }),
      errorKey: "error.projectAdd",
    });
  },

  updateProject: (id, fields) => {
    const userId = get().userId;
    if (!userId) return;

    const snapshot = [...get().projects];
    set({
      projects: snapshot.map((p) =>
        p.id === id ? { ...p, ...fields } : p
      ),
    });

    const dbFields: Record<string, unknown> = {};
    if (fields.name !== undefined) dbFields.name = fields.name;
    if (fields.emoji !== undefined) dbFields.emoji = fields.emoji;
    if (fields.color !== undefined) dbFields.color = fields.color;
    if (fields.targetHours !== undefined) dbFields.target_hours = fields.targetHours;
    if (fields.githubRepo !== undefined) dbFields.github_repo = fields.githubRepo || null;

    syncToSupabase({
      op: () => createClient().from("user_projects").update(dbFields).eq("id", id).eq("user_id", userId),
      rollbackState: snapshot,
      restore: (s) => set({ projects: s }),
      errorKey: "error.projectUpdate",
    });
  },

  completeProject: (id) => {
    const userId = get().userId;
    if (!userId) return;

    const snapshot = [...get().projects];
    set({
      projects: snapshot.map((p) =>
        p.id === id ? { ...p, status: "completed" as const } : p
      ),
    });

    syncToSupabase({
      op: () => createClient().from("user_projects").update({ status: "completed" }).eq("id", id).eq("user_id", userId),
      rollbackState: snapshot,
      restore: (s) => set({ projects: s }),
      errorKey: "error.projectComplete",
    });
  },

  removeProject: (id) => {
    const userId = get().userId;
    if (!userId) return;

    const snapshot = [...get().projects];
    set({ projects: snapshot.filter((p) => p.id !== id) });

    syncToSupabase({
      op: () => createClient().from("user_projects").delete().eq("id", id).eq("user_id", userId),
      rollbackState: snapshot,
      restore: (s) => set({ projects: s }),
      errorKey: "error.projectDelete",
    });
  },
}));
