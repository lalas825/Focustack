"use client";

import { createClient } from "@/lib/supabase/client";
import { useTasksStore } from "@/features/projects/store";
import { useHoursStore } from "@/features/planner/store";
import { useLogsStore } from "@/features/logs/store";
import { useCustomProjectsStore } from "@/features/projects/customProjectsStore";
import { useScheduleStore } from "@/features/planner/scheduleStore";
import { PROJECTS } from "@/features/projects/data/projects";
import { DAYS } from "@/shared/lib/utils";
import type { Task, TasksMap, HoursMap, SessionLog, Project } from "@/shared/types";
import { getWeekStart } from "@/shared/lib/utils";

export async function loadUserData(userId: string) {
  const supabase = createClient();
  const currentWeek = getWeekStart();

  // Migrate localStorage data on first login
  await migrateLocalStorage(userId, supabase);

  // Fetch all 4 tables in parallel
  const [tasksRes, hoursRes, logsRes, projectsRes, assignmentsRes] = await Promise.all([
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

    supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),

    supabase
      .from("daily_assignments")
      .select("*")
      .eq("user_id", userId),
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
        priority: row.priority ?? "medium",
        estimationMinutes: row.estimation_minutes ?? null,
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

  // Hydrate custom projects store
  if (projectsRes.data) {
    const projects: Project[] = projectsRes.data.map((row) => ({
      id: row.id,
      name: row.name,
      emoji: row.emoji ?? "📁",
      color: row.color ?? "#7B68EE",
      targetHours: row.target_hours ?? 0,
      days: [],
      status: "active" as const,
    }));
    useCustomProjectsStore.setState({ projects });
  }

  // Hydrate schedule store (daily assignments)
  if (assignmentsRes.data && assignmentsRes.data.length > 0) {
    const schedule: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const row of assignmentsRes.data) {
      schedule[row.day_of_week].push(row.project_id);
    }
    useScheduleStore.setState({ schedule, loaded: true });
  } else {
    // First login: seed from hardcoded PROJECTS[].days
    const schedule: Record<number, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    const seedRows: { user_id: string; day_of_week: number; project_id: string }[] = [];

    for (const project of PROJECTS) {
      if (project.days.length === 0) continue;
      for (const dayName of project.days) {
        const dayIndex = DAYS.indexOf(dayName as typeof DAYS[number]);
        if (dayIndex === -1) continue;
        schedule[dayIndex].push(project.id);
        seedRows.push({ user_id: userId, day_of_week: dayIndex, project_id: project.id });
      }
    }

    useScheduleStore.setState({ schedule, loaded: true });

    // Background insert seed rows
    if (seedRows.length > 0) {
      supabase
        .from("daily_assignments")
        .insert(seedRows)
        .then(({ error }) => { if (error) console.error("seed assignments:", error); });
    }
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
