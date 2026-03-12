"use client";

import { useState } from "react";
import { useTranslation } from "@/shared/lib/i18n";
import { TaskModal } from "./TaskModal";
import type { Priority } from "@/shared/types";

interface TaskInputProps {
  onAdd: (text: string, priority?: Priority, estimationMinutes?: number | null) => void;
  color: string;
}

export function TaskInput({ onAdd, color }: TaskInputProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="input-base w-full text-left text-secondary hover:text-primary transition-colors"
      >
        {t("task.placeholder")}
      </button>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(task) => onAdd(task.text, task.priority, task.estimationMinutes)}
        color={color}
      />
    </>
  );
}
