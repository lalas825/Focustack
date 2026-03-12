import type { Project } from "@/shared/types";

export const PROJECTS: Project[] = [
  {
    id: "jantile",
    name: "Jantile Tracker",
    emoji: "🏗️",
    color: "#00E5A0",
    targetHours: 14,
    days: ["Monday", "Wednesday", "Friday", "Sunday"],
    status: "active",
  },
  {
    id: "velora",
    name: "Velora",
    emoji: "🎬",
    color: "#FF6B6B",
    targetHours: 10,
    days: ["Tuesday", "Thursday"],
    status: "active",
  },
  {
    id: "hustleflow",
    name: "HustleFlow",
    emoji: "⚡",
    color: "#FFD93D",
    targetHours: 6,
    days: ["Saturday"],
    status: "active",
  },
  {
    id: "focustack",
    name: "Focustack",
    emoji: "🧪",
    color: "#7B68EE",
    targetHours: 0,
    days: [],
    status: "active",
  },
  {
    id: "reelai",
    name: "ReelAI",
    emoji: "🔮",
    color: "#FF69B4",
    targetHours: 0,
    days: [],
    status: "active",
  },
  {
    id: "mnqbot",
    name: "MNQ Bot",
    emoji: "📈",
    color: "#4ECDC4",
    targetHours: 0,
    days: [],
    status: "active",
  },
];

export const ACTIVE_PROJECTS = PROJECTS.filter((p) => p.status === "active");

export function getTodayProject(): Project {
  const today = new Date().getDay();
  const dayName = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ][today] as Project["days"][number];
  return (
    PROJECTS.find((p) => p.days.includes(dayName) && p.status === "active") ??
    PROJECTS[0]
  );
}

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export function getTomorrowProject(): Project | undefined {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayName = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ][tomorrow.getDay()] as Project["days"][number];
  return PROJECTS.find((p) => p.days.includes(dayName) && p.status === "active");
}
