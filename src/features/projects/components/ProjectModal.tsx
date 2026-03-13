"use client";

import { useState, useRef, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { useTranslation } from "@/shared/lib/i18n";

const COLOR_PRESETS = [
  "#00E5A0", "#FF6B6B", "#FFD93D", "#7B68EE", "#FF69B4", "#4ECDC4",
  "#F97316", "#06B6D4", "#A855F7", "#EF4444",
];

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "Work", emojis: ["💼", "🏗️", "📊", "📈", "🛠️", "⚙️", "🔧", "📋", "📝", "💡"] },
  { label: "Tech", emojis: ["💻", "🖥️", "📱", "🤖", "🧪", "🔮", "⚡", "🚀", "🎮", "🌐"] },
  { label: "Creative", emojis: ["🎨", "🎬", "📸", "🎵", "✏️", "📐", "🎭", "🖌️", "📖", "🎯"] },
  { label: "Finance", emojis: ["💰", "💵", "📉", "🏦", "💎", "🪙", "💳", "🧾", "📦", "🏪"] },
  { label: "Health", emojis: ["🏋️", "🧘", "🍎", "❤️", "🧠", "🌱", "☀️", "🏃", "💪", "🌿"] },
  { label: "Other", emojis: ["📁", "⭐", "🔥", "🎉", "🏆", "👑", "🦾", "🌍", "🐝", "🦅"] },
];

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (project: { name: string; emoji: string; color: string; targetHours: number; githubRepo?: string }) => void;
  initialValues?: { name: string; emoji: string; color: string; targetHours: number; githubRepo?: string };
}

export function ProjectModal({ open, onClose, onSave, initialValues }: ProjectModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [color, setColor] = useState("#7B68EE");
  const [targetHours, setTargetHours] = useState(0);
  const [githubRepo, setGithubRepo] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initialValues;

  useEffect(() => {
    if (open) {
      setName(initialValues?.name ?? "");
      setEmoji(initialValues?.emoji ?? "📁");
      setColor(initialValues?.color ?? "#7B68EE");
      setTargetHours(initialValues?.targetHours ?? 0);
      setGithubRepo(initialValues?.githubRepo ?? "");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, initialValues]);

  if (!open) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), emoji, color, targetHours, githubRepo: githubRepo.trim() || undefined });
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
          {isEdit ? t("project.editProject") : t("project.newProject")}
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

        {/* Emoji picker */}
        <div className="mb-4">
          <label className="block text-xs text-secondary mb-1.5">
            {t("project.emoji")}
          </label>
          <div className="bg-bg-surface rounded-xl border border-bg-elevated p-2 max-h-[200px] overflow-y-auto">
            {EMOJI_GROUPS.map((group) => (
              <div key={group.label} className="mb-2 last:mb-0">
                <div className="text-[9px] text-text-dark tracking-widest uppercase px-1 mb-1">
                  {group.label}
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {group.emojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className="w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all hover:bg-bg-elevated"
                      style={{
                        backgroundColor: emoji === e ? color + "25" : "transparent",
                        outline: emoji === e ? `2px solid ${color}` : "none",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="mb-4">
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

        {/* Target Hours */}
        <div className="mb-4">
          <label className="block text-xs text-secondary mb-1.5">
            {t("project.targetHours")}
          </label>
          <input
            type="number"
            min={0}
            max={168}
            value={targetHours || ""}
            onChange={(e) => setTargetHours(Number(e.target.value) || 0)}
            placeholder="0"
            className="input-base w-24 text-center"
          />
        </div>

        {/* GitHub Repo */}
        <div className="mb-6">
          <label className="block text-xs text-secondary mb-1.5">
            GitHub Repo
          </label>
          <input
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            placeholder="owner/repo"
            className="input-base w-full text-xs"
          />
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
