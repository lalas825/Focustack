"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project } from "@/shared/types";
import { EMPTY_PROJECT } from "@/features/projects/data/projects";
import { persistStore } from "@/shared/lib/store-utils";

interface TimerState {
  project: Project;
  seconds: number;
  running: boolean;
  pomodoroMode: number | null; // null | 25 | 50
  pomodoroRemaining: number;

  setProject: (p: Project) => void;
  tick: () => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  startPomodoro: (minutes: number) => void;
  tickPomodoro: () => boolean; // returns true if pomodoro completed
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      project: EMPTY_PROJECT,
      seconds: 0,
      running: false,
      pomodoroMode: null,
      pomodoroRemaining: 0,

      setProject: (p) => set({ project: p }),

      tick: () => set((s) => ({ seconds: s.seconds + 1 })),

      start: () => set({ running: true }),

      pause: () => set({ running: false }),

      reset: () =>
        set({
          seconds: 0,
          running: false,
          pomodoroMode: null,
          pomodoroRemaining: 0,
        }),

      startPomodoro: (minutes) =>
        set({
          pomodoroMode: minutes,
          pomodoroRemaining: minutes * 60,
          running: true,
        }),

      tickPomodoro: () => {
        const remaining = get().pomodoroRemaining;
        if (remaining <= 1) {
          set({ pomodoroRemaining: 0, running: false, pomodoroMode: null });
          return true;
        }
        set({ pomodoroRemaining: remaining - 1 });
        return false;
      },
    }),
    {
      ...persistStore("productivity-timer-storage"),
      // Always restore as paused — never auto-resume a running timer
      partialize: (state) => ({
        project: state.project,
        seconds: state.seconds,
        running: false,
        pomodoroMode: state.pomodoroMode,
        pomodoroRemaining: state.pomodoroRemaining,
      }),
    }
  )
);
