"use client";

import { useTimerStore } from "@/features/timer/store";
import { formatTime } from "@/shared/lib/utils";

export function TimerDisplay() {
  const { seconds, running, project, pomodoroMode, pomodoroRemaining } = useTimerStore();

  const displayTime = pomodoroMode ? pomodoroRemaining : seconds;
  const label = pomodoroMode ? `POMODORO ${pomodoroMode} MIN` : "FOCUS SESSION";

  return (
    <div className="text-center">
      <div className="text-[11px] text-text-muted tracking-[3px] uppercase mb-2">
        {label}
      </div>

      <div
        className="text-6xl md:text-7xl font-bold leading-none my-4 tabular-nums"
        style={{
          color: project.color,
          textShadow: `0 0 40px ${project.color}30`,
        }}
      >
        {formatTime(displayTime)}
      </div>

      {pomodoroMode && (
        <div className="text-xs text-text-muted mb-3">
          Sesion: {formatTime(seconds)}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mt-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: running ? "#00E5A0" : "#555" }}
        />
        <span className="text-xs text-text-muted">
          {running ? "En progreso" : seconds > 0 ? "Pausado" : "Listo"}
        </span>
      </div>
    </div>
  );
}
