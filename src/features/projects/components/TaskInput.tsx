"use client";

import { useState } from "react";

interface TaskInputProps {
  onAdd: (text: string) => void;
  color: string;
}

export function TaskInput({ onAdd, color }: TaskInputProps) {
  const [text, setText] = useState("");
  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(text);
      setText("");
    }
  };
  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="+ Nueva tarea..."
        className="input-base flex-1"
      />
      <button
        onClick={handleSubmit}
        className="px-3 py-2 rounded-lg border text-sm"
        style={{
          borderColor: color + "30",
          backgroundColor: color + "10",
          color,
        }}
      >
        +
      </button>
    </div>
  );
}
