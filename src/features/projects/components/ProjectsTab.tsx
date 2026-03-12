"use client";

import { useState } from "react";
import { useHoursStore } from "@/features/planner/store";
import { useTasksStore } from "@/features/projects/store";
import { useCustomProjectsStore } from "@/features/projects/customProjectsStore";
import { PROJECTS } from "@/features/projects/data/projects";
import { DAYS } from "@/shared/lib/utils";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { useTranslation } from "@/shared/lib/i18n";
import { TaskInput } from "@/features/projects/components/TaskInput";
import { TaskList } from "@/features/projects/components/TaskList";
import { ProjectModal } from "@/features/projects/components/ProjectModal";

export function ProjectsTab() {
  const { t } = useTranslation();
  const { hours } = useHoursStore();
  const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
  const customProjects = useCustomProjectsStore((s) => s.projects);
  const addProject = useCustomProjectsStore((s) => s.addProject);
  const [modalOpen, setModalOpen] = useState(false);

  const allProjects = [...PROJECTS, ...customProjects];

  return (
    <div className="space-y-3">
      {allProjects.map((p) => {
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
              {isActive && p.targetHours > 0 && (
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{logged.toFixed(1)}h</div>
                  <div className="text-[10px] text-text-muted">/ {p.targetHours}h</div>
                </div>
              )}
            </div>

            {isActive && (
              <>
                {p.targetHours > 0 && (
                  <ProgressBar value={logged} max={p.targetHours} color={p.color} className="mb-3" />
                )}
                <div className="text-[11px] text-text-muted mb-2">
                  {p.days.length > 0 && (
                    <>
                      {t("projects.days")}:{" "}
                      {p.days.map((d) => t(`days.${DAYS.indexOf(d)}` as any)).join(", ")} ·{" "}
                    </>
                  )}
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

      {/* + New Project button */}
      <button
        onClick={() => setModalOpen(true)}
        className="card w-full text-center py-4 border-dashed border-bg-elevated hover:border-text-muted transition-colors cursor-pointer"
      >
        <span className="text-text-muted text-sm">+ {t("project.newProject")}</span>
      </button>

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(p) => addProject(p.name, p.emoji, p.color)}
      />
    </div>
  );
}
