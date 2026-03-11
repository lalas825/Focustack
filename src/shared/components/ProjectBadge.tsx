"use client";

import type { Project } from "@/shared/types";

interface ProjectBadgeProps {
  project: Project;
  className?: string;
}

export function ProjectBadge({ project, className = "" }: ProjectBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-sm font-semibold ${className}`}
      style={{
        backgroundColor: project.color + "12",
        borderColor: project.color + "30",
        color: project.color,
      }}
    >
      <span>{project.emoji}</span>
      <span>{project.name}</span>
    </div>
  );
}
