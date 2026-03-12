import { z } from "zod";

// ─── PROJECT ────────────────────────────────────────
export const ProjectStatus = z.enum(["active", "blocked"]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

export const DayName = z.enum([
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
]);
export type DayName = z.infer<typeof DayName>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  emoji: z.string(),
  color: z.string(),
  targetHours: z.number(),
  days: z.array(DayName),
  status: ProjectStatus,
});
export type Project = z.infer<typeof ProjectSchema>;

// ─── TASK ───────────────────────────────────────────
export const Priority = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof Priority>;

export const TaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
  createdAt: z.string(),
  priority: Priority.default("medium"),
  estimationMinutes: z.number().nullable().default(null),
});
export type Task = z.infer<typeof TaskSchema>;

// ─── SESSION LOG ────────────────────────────────────
export const SessionLogSchema = z.object({
  date: z.string(),
  day: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  hoursLogged: z.number(),
  completed: z.string(),
  blockers: z.string(),
  tomorrowProject: z.string(),
});
export type SessionLog = z.infer<typeof SessionLogSchema>;

// ─── HOURS MAP ──────────────────────────────────────
export type HoursMap = Record<string, number>; // projectId -> seconds
export type TasksMap = Record<string, Task[]>; // projectId -> tasks
