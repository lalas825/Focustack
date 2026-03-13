"use client";

import { useState } from "react";
import { useTranslation } from "@/shared/lib/i18n";

interface TaskListProps {
  tasks: { id: string; text: string; done: boolean }[];
  projectId: string;
  color: string;
  onToggle: (pid: string, tid: string) => void;
  onDelete: (pid: string, tid: string) => void;
  limit?: number;
}

export function TaskList({ tasks, projectId, color, onToggle, onDelete, limit }: TaskListProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const all = [...pending, ...done];

  const hasMore = limit && all.length > limit;
  const show = expanded || !hasMore ? all : all.slice(0, limit);

  if (all.length === 0) return null;

  return (
    <div className="mt-3">
      {show.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2.5 py-2 border-b border-bg-elevated/30"
        >
          <button
            onClick={() => onToggle(projectId, task.id)}
            className="w-[18px] h-[18px] rounded flex-shrink-0 border-[1.5px] flex items-center justify-center text-[10px]"
            style={{
              borderColor: task.done ? color : "#333",
              backgroundColor: task.done ? color + "25" : "transparent",
              color,
            }}
          >
            {task.done ? "✓" : ""}
          </button>
          <span
            className={`flex-1 text-xs ${
              task.done ? "text-text-dark line-through" : "text-text-primary"
            }`}
          >
            {task.text}
          </span>
          <button
            onClick={() => onDelete(projectId, task.id)}
            className="text-text-dark hover:text-[#FF6B6B] text-xs px-1 transition-colors"
          >
            x
          </button>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-center py-2 text-[11px] transition-colors hover:text-text-secondary"
          style={{ color: expanded ? "#888" : color }}
        >
          {expanded
            ? t("project.collapse")
            : `${t("project.showAll")} (${all.length})`}
        </button>
      )}
    </div>
  );
}
