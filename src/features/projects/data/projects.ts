import { useScheduleStore } from "@/features/planner/scheduleStore";
import { useCustomProjectsStore } from "@/features/projects/customProjectsStore";
import type { Project } from "@/shared/types";

/** Placeholder shown when no projects exist yet */
export const EMPTY_PROJECT: Project = {
  id: "",
  name: "No Project",
  emoji: "📁",
  color: "#555",
  targetHours: 0,
  days: [],
  status: "active",
};

/** All user projects from Supabase (via customProjectsStore) */
export function getAllProjects(): Project[] {
  return useCustomProjectsStore.getState().projects;
}

export function getProjectById(id: string): Project | undefined {
  return getAllProjects().find((p) => p.id === id);
}

export function getTodayProjects(): Project[] {
  const schedule = useScheduleStore.getState().schedule;
  const todayIndex = new Date().getDay();
  const projectIds = schedule[todayIndex] || [];
  return projectIds
    .map((id) => getProjectById(id))
    .filter(Boolean) as Project[];
}

export function getTodayProject(): Project {
  const today = getTodayProjects();
  if (today.length > 0) return today[0];
  const all = getAllProjects();
  return all[0] ?? EMPTY_PROJECT;
}

export function getTomorrowProject(): Project | undefined {
  const schedule = useScheduleStore.getState().schedule;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowIndex = tomorrow.getDay();
  const projectIds = schedule[tomorrowIndex] || [];
  if (projectIds.length === 0) return undefined;
  return getProjectById(projectIds[0]);
}
