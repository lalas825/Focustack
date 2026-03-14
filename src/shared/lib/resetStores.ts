"use client";

import { createClient } from "@/lib/supabase/client";
import { useTasksStore } from "@/features/projects/store";
import { useHoursStore } from "@/features/planner/store";
import { useLogsStore } from "@/features/logs/store";
import { useCustomProjectsStore } from "@/features/projects/customProjectsStore";
import { useScheduleStore } from "@/features/planner/scheduleStore";
import { useTimerStore } from "@/features/timer/store";
import { getWeekStart } from "@/shared/lib/utils";

/**
 * Resets ALL Zustand stores to their initial state.
 * Call on SIGNED_OUT and before hydrating a new user's data.
 * Ensures zero residual data between user sessions.
 */
export function resetAllStores() {
  // Unsubscribe realtime channels
  createClient().removeChannel(
    createClient().channel("tasks-realtime")
  );

  useTasksStore.setState({ tasks: {}, userId: null });
  useHoursStore.setState({ hours: {}, weekStart: getWeekStart(), userId: null });
  useLogsStore.setState({ logs: [], userId: null });
  useCustomProjectsStore.setState({ projects: [], userId: null });
  useScheduleStore.setState({
    schedule: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
    loaded: false,
    userId: null,
  });
  useTimerStore.setState({
    seconds: 0,
    running: false,
    pomodoroMode: null,
    pomodoroRemaining: 0,
  });

  // Clear persisted timer data (localStorage) to prevent cross-user leak
  if (typeof window !== "undefined") {
    localStorage.removeItem("productivity-timer-storage");
  }
}
