"use client";

import { useState } from "react";
import { Pencil, Check, Trash2 } from "lucide-react";
import { useHoursStore } from "@/features/planner/store";
import { useTasksStore } from "@/features/projects/store";
import { useCustomProjectsStore } from "@/features/projects/customProjectsStore";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { useTranslation } from "@/shared/lib/i18n";
import { TaskInput } from "@/features/projects/components/TaskInput";
import { TaskList } from "@/features/projects/components/TaskList";
import { ProjectModal } from "@/features/projects/components/ProjectModal";
import { Modal } from "@/shared/components/Modal";
import type { Project } from "@/shared/types";

export function ProjectsTab() {
  const { t } = useTranslation();
  const { hours } = useHoursStore();
  const { tasks, addTask, toggleTask, deleteTask } = useTasksStore();
  const customProjects = useCustomProjectsStore((s) => s.projects);
  const addProject = useCustomProjectsStore((s) => s.addProject);
  const updateProject = useCustomProjectsStore((s) => s.updateProject);
  const completeProject = useCustomProjectsStore((s) => s.completeProject);
  const removeProject = useCustomProjectsStore((s) => s.removeProject);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Sort: active first, completed last
  const sorted = [...customProjects].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return 0;
  });

  return (
    <div className="space-y-3">
      {sorted.map((p) => {
        const isCompleted = p.status === "completed";
        const logged = (hours[p.id] || 0) / 3600;
        const projectTasks = tasks[p.id] || [];
        const doneTasks = projectTasks.filter((t) => t.done).length;

        return (
          <div
            key={p.id}
            className="card"
            style={{
              borderColor: isCompleted ? "#1a1a2e" : p.color + "18",
              opacity: isCompleted ? 0.4 : 1,
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
                    style={{ color: isCompleted ? "#888" : "#00E5A0" }}
                  >
                    {isCompleted ? t("project.completed") : t("projects.active")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Action buttons */}
                {!isCompleted && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditProject(p)}
                      className="p-1.5 rounded-lg text-text-dark hover:text-text-secondary hover:bg-bg-elevated transition-colors"
                      title={t("project.edit")}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => completeProject(p.id)}
                      className="p-1.5 rounded-lg text-text-dark hover:text-[#00E5A0] hover:bg-bg-elevated transition-colors"
                      title={t("project.complete")}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(p.id)}
                      className="p-1.5 rounded-lg text-text-dark hover:text-[#FF6B6B] hover:bg-bg-elevated transition-colors"
                      title={t("project.delete")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {/* Hours display */}
                {p.targetHours > 0 && (
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">{logged.toFixed(1)}h</div>
                    <div className="text-[10px] text-text-muted">/ {p.targetHours}h</div>
                  </div>
                )}
              </div>
            </div>

            {!isCompleted && (
              <>
                {p.targetHours > 0 && (
                  <ProgressBar value={logged} max={p.targetHours} color={p.color} className="mb-3" />
                )}
                <div className="text-[11px] text-text-muted mb-2">
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

      {/* Create modal */}
      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(p) => addProject(p.name, p.emoji, p.color)}
      />

      {/* Edit modal */}
      <ProjectModal
        open={!!editProject}
        onClose={() => setEditProject(null)}
        onSave={(p) => {
          if (editProject) {
            updateProject(editProject.id, {
              name: p.name,
              emoji: p.emoji,
              color: p.color,
              targetHours: p.targetHours,
              githubRepo: p.githubRepo,
            });
          }
        }}
        initialValues={editProject ? {
          name: editProject.name,
          emoji: editProject.emoji,
          color: editProject.color,
          targetHours: editProject.targetHours,
          githubRepo: editProject.githubRepo ?? "",
        } : undefined}
      />

      {/* Delete confirmation */}
      {deleteConfirm && (
        <Modal>
          <div className="text-center">
            <h3 className="text-[#FF6B6B] text-base font-semibold mb-3">
              {t("project.delete")}
            </h3>
            <p className="text-text-secondary text-sm mb-6">
              {t("project.confirmDelete")}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-xs text-secondary border border-bg-elevated hover:text-primary transition-colors"
              >
                {t("project.cancel")}
              </button>
              <button
                onClick={() => {
                  removeProject(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/40 hover:bg-[#FF6B6B]/30 transition-colors"
              >
                {t("project.confirmDeleteBtn")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
