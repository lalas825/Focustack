"use client";

import { createClient } from "@/lib/supabase/client";
import { useTasksStore } from "@/features/projects/store";
import { useHoursStore } from "@/features/planner/store";
import { useLogsStore } from "@/features/logs/store";
import type { Task, TasksMap, HoursMap, SessionLog } from "@/shared/types";
import { getWeekStart } from "@/shared/lib/utils";

export async function loadUserData(userId: string) {
  const supabase = createClient();
  const currentWeek = getWeekStart();

  // Migrate localStorage data on first login
  await migrateLocalStorage(userId, supabase);

  // Fetch all 3 tables in parallel
  const [tasksRes, hoursRes, logsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),

    supabase
      .from("weekly_hours")
      .select("*")
      .eq("user_id", userId)
      .eq("week_start", currentWeek),

    supabase
      .from("session_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  // Hydrate tasks store
  if (tasksRes.data) {
    const tasksMap: TasksMap = {};
    for (const row of tasksRes.data) {
      if (!tasksMap[row.project_id]) tasksMap[row.project_id] = [];
      tasksMap[row.project_id].push({
        id: row.id,
        text: row.text,
        done: row.done,
        createdAt: row.created_at,
      });
    }
    useTasksStore.setState({ tasks: { ...useTasksStore.getState().tasks, ...tasksMap } });
  }

  // Hydrate hours store
  if (hoursRes.data) {
    const hoursMap: HoursMap = {};
    for (const row of hoursRes.data) {
      hoursMap[row.project_id] = row.seconds;
    }
    useHoursStore.setState({ hours: { ...useHoursStore.getState().hours, ...hoursMap }, weekStart: currentWeek });
  }

  // Hydrate logs store
  if (logsRes.data) {
    const logs: SessionLog[] = logsRes.data.map((row) => ({
      date: row.date,
      day: row.day,
      projectId: row.project_id,
      projectName: row.project_name,
      hoursLogged: row.hours_logged,
      completed: row.completed,
      blockers: row.blockers,
      tomorrowProject: row.tomorrow_project,
    }));
    useLogsStore.setState({ logs });
  }
}

// One-time migration of localStorage data to Supabase
async function migrateLocalStorage(
  userId: string,
  supabase: ReturnType<typeof createClient>
) {
  if (typeof window === "undefined") return;

  // Check if user already has cloud data
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (count && count > 0) return;

  const localTasks = localStorage.getItem("productivity-projects-storage");
  const localHours = localStorage.getItem("productivity-hours-storage");
  const localLogs = localStorage.getItem("productivity-logs-storage");

  if (!localTasks && !localHours && !localLogs) return;

  // Migrate tasks
  if (localTasks) {
    try {
      const parsed = JSON.parse(localTasks);
      const tasksMap = parsed.state?.tasks as TasksMap | undefined;
      if (tasksMap) {
        const rows = Object.entries(tasksMap).flatMap(([projectId, tasks]) =>
          (tasks as Task[]).map((t) => ({
            id: t.id,
            user_id: userId,
            project_id: projectId,
            text: t.text,
            done: t.done,
            created_at: t.createdAt,
          }))
        );
        if (rows.length > 0) {
          await supabase.from("tasks").upsert(rows, { onConflict: "id" });
        }
      }
    } catch {}
  }

  // Migrate hours
  if (localHours) {
    try {
      const parsed = JSON.parse(localHours);
      const hoursMap = parsed.state?.hours as HoursMap | undefined;
      const weekStart = parsed.state?.weekStart as string | undefined;
      if (hoursMap && weekStart) {
        const rows = Object.entries(hoursMap)
          .filter(([, secs]) => secs > 0)
          .map(([projectId, secs]) => ({
            user_id: userId,
            project_id: projectId,
            week_start: weekStart,
            seconds: secs,
          }));
        if (rows.length > 0) {
          await supabase
            .from("weekly_hours")
            .upsert(rows, { onConflict: "user_id,project_id,week_start" });
        }
      }
    } catch {}
  }

  // Migrate logs
  if (localLogs) {
    try {
      const parsed = JSON.parse(localLogs);
      const logs = parsed.state?.logs as SessionLog[] | undefined;
      if (logs && logs.length > 0) {
        const rows = logs.map((log) => ({
          user_id: userId,
          date: log.date,
          day: log.day,
          project_id: log.projectId,
          project_name: log.projectName,
          hours_logged: log.hoursLogged,
          completed: log.completed,
          blockers: log.blockers,
          tomorrow_project: log.tomorrowProject,
        }));
        await supabase.from("session_logs").insert(rows);
      }
    } catch {}
  }

  // Clear old localStorage keys
  localStorage.removeItem("productivity-projects-storage");
  localStorage.removeItem("productivity-hours-storage");
  localStorage.removeItem("productivity-logs-storage");
}
