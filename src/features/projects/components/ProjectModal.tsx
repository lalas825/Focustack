"use client";

import { useState, useRef, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { useTranslation } from "@/shared/lib/i18n";

const COLOR_PRESETS = [
  "#00E5A0", "#FF6B6B", "#FFD93D", "#7B68EE", "#FF69B4", "#4ECDC4",
  "#F97316", "#06B6D4", "#A855F7", "#EF4444",
];

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (project: { name: string; emoji: string; color: string }) => void;
}

export function ProjectModal({ open, onClose, onSave }: ProjectModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [color, setColor] = useState("#7B68EE");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setEmoji("📁");
      setColor("#7B68EE");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), emoji, color });
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

  return (
    <Modal>
      <div onKeyDown={handleKeyDown}>
        <h2 className="text-sm font-bold tracking-widest mb-5" style={{ color }}>
          {t("project.newProject")}
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs text-secondary mb-1.5">
            {t("project.name")}
          </label>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Project"
            className="input-base w-full"
          />
        </div>

        {/* Emoji */}
        <div className="mb-4">
          <label className="block text-xs text-secondary mb-1.5">
            {t("project.emoji")}
          </label>
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            className="input-base w-16 text-center text-lg"
            maxLength={4}
          />
        </div>

        {/* Color */}
        <div className="mb-6">
          <label className="block text-xs text-secondary mb-1.5">
            {t("project.color")}
          </label>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-transform"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "#E0E0E0" : "transparent",
                  transform: color === c ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-secondary border border-bg-elevated hover:text-primary transition-colors"
          >
            {t("project.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-30"
            style={{
              backgroundColor: color + "20",
              color,
              borderColor: color + "40",
              borderWidth: "1px",
            }}
          >
            {t("project.save")}
          </button>
        </div>
      </div>
    </Modal>
  );
}
