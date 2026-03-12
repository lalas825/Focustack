"use client";

import { useHoursStore } from "@/features/planner/store";
import { useTasksStore } from "@/features/projects/store";
import { PROJECTS } from "@/features/projects/data/projects";
import { DAYS } from "@/shared/lib/utils";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { useTranslation } from "@/shared/lib/i18n";
import { TaskInput } from "@/features/projects/components/TaskInput";
import { TaskList } from "@/features/projects/components/TaskList";

export function ProjectsTab() {
  const { t } = useTranslation();
  const { hours } = useHoursStore();
  const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();

  return (
    <div className="space-y-3">
      {PROJECTS.map((p) => {
        const isActive = p.status === "active";
        const logged = (hours[p.id] || 0) / 3600;
        const projectTasks = tasks[p.id] || [];
        const doneTasks = projectTasks.filter((t) => t.done).length;

        return (
          <div
            key={p.id}
            className="card"
            style={{
              borderColor: isActive ? p.color + "18" : "#1a1a2e",
              opacity: isActive ? 1 : 0.35,
            }}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{p.emoji}</span>
                <div>
                  <h3 className="text-[15px] font-semibold" style={{ color: p.color }}>
                    {p.name}
                  </h3>
                  <span
                    className="text-[10px] tracking-[1px] uppercase"
                    style={{ color: isActive ? "#00E5A0" : "#FF6B6B" }}
                  >
                    {isActive ? t("projects.active") : t("projects.blocked")}
                  </span>
                </div>
              </div>
              {isActive && (
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{logged.toFixed(1)}h</div>
                  <div className="text-[10px] text-text-muted">/ {p.targetHours}h</div>
                </div>
              )}
            </div>

            {isActive && (
              <>
                <ProgressBar value={logged} max={p.targetHours} color={p.color} className="mb-3" />
                <div className="text-[11px] text-text-muted mb-2">
                  {t("projects.days")}:{" "}
                  {p.days.map((d) => t(`days.${DAYS.indexOf(d)}` as any)).join(", ")} ·
                  {t("projects.tasks")}: {doneTasks}/{projectTasks.length}
                </div>
                <TaskInput onAdd={(text, priority, est) => addTask(p.id, text, priority, est)} color={p.color} />
                <TaskList
                  tasks={projectTasks}
                  projectId={p.id}
                  color={p.color}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  limit={5}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
