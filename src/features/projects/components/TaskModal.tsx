"use client";

import { useState, useRef, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { useTranslation } from "@/shared/lib/i18n";
import type { Priority } from "@/shared/types";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: { text: string; priority: Priority; estimationMinutes: number | null }) => void;
  color: string; // project accent color
}

export function TaskModal({ open, onClose, onSave, color }: TaskModalProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimation, setEstimation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the title input when modal opens
  useEffect(() => {
    if (open) {
      setText("");
      setPriority("medium");
      setEstimation("");
      // Small delay to ensure the modal is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    const mins = estimation.trim() ? parseInt(estimation, 10) : null;
    onSave({
      text: text.trim(),
      priority,
      estimationMinutes: mins && !isNaN(mins) ? mins : null,
    });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const priorityOptions: { value: Priority; label: string; dot: string }[] = [
    { value: "low", label: t("task.priorityLow"), dot: "#888888" },
    { value: "medium", label: t("task.priorityMedium"), dot: "#FFD93D" },
    { value: "high", label: t("task.priorityHigh"), dot: "#FF6B6B" },
  ];

  return (
    <Modal>
      <div onKeyDown={handleKeyDown}>
        {/* Header */}
        <h2
          className="text-sm font-bold tracking-widest mb-5"
          style={{ color }}
        >
          {t("task.addTask")}
        </h2>

        {/* Title input */}
        <div className="mb-4">
          <label className="block text-xs text-secondary mb-1.5">
            {t("task.title")}
          </label>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("task.placeholder")}
            className="input-base w-full"
          />
        </div>

        {/* Priority selector */}
        <div className="mb-4">
          <label className="block text-xs text-secondary mb-1.5">
            {t("task.priority")}
          </label>
          <div className="flex gap-2">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors"
                style={{
                  borderColor:
                    priority === opt.value ? color + "60" : "#1a1a2e",
                  backgroundColor:
                    priority === opt.value ? color + "15" : "transparent",
                  color: priority === opt.value ? "#E0E0E0" : "#888888",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: opt.dot }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estimation input */}
        <div className="mb-6">
          <label className="block text-xs text-secondary mb-1.5">
            {t("task.estimation")} ({t("task.minutes")})
          </label>
          <input
            type="number"
            min="0"
            value={estimation}
            onChange={(e) => setEstimation(e.target.value)}
            placeholder="30"
            className="input-base w-24"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-secondary border border-bg-elevated hover:text-primary transition-colors"
          >
            {t("task.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-30"
            style={{
              backgroundColor: color + "20",
              color,
              borderColor: color + "40",
              borderWidth: "1px",
            }}
          >
            {t("task.save")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
