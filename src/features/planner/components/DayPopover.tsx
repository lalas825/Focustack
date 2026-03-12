"use client";

import { useEffect, useRef } from "react";
import { PROJECTS } from "@/features/projects/data/projects";
import { useCustomProjectsStore } from "@/features/projects/customProjectsStore";
import { useTranslation } from "@/shared/lib/i18n";

interface DayPopoverProps {
  dayIndex: number;
  assigned: string[];
  onToggle: (projectId: string) => void;
  onClose: () => void;
}

export function DayPopover({ dayIndex, assigned, onToggle, onClose }: DayPopoverProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const customProjects = useCustomProjectsStore((s) => s.projects);
  const allProjects = [...PROJECTS.filter((p) => p.status === "active"), ...customProjects];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-bg-surface border border-bg-elevated rounded-xl p-2 min-w-[180px] shadow-xl"
    >
      <p className="text-[10px] text-text-muted px-2 py-1 tracking-widest">
        {t("week.assignProjects")}
      </p>
      {allProjects.map((p) => {
        const isAssigned = assigned.includes(p.id);
        return (
          <button
            key={p.id}
            onClick={() => onToggle(p.id)}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs hover:bg-bg-elevated transition-colors"
          >
            <span className="text-sm">{p.emoji}</span>
            <span className="flex-1 text-left" style={{ color: p.color }}>
              {p.name}
            </span>
            <span className="text-[10px]" style={{ color: isAssigned ? "#00E5A0" : "#555" }}>
              {isAssigned ? "✓" : "+"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
