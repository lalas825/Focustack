"use client";

import { useTimerStore } from "@/features/timer/store";
import { formatTime } from "@/shared/lib/utils";
import { Btn } from "@/shared/components/Btn";

interface TimerCardProps {
  onEndSession: () => void;
}

export function TimerCard({ onEndSession }: TimerCardProps) {
  const { project, seconds, running, pomodoroMode, pomodoroRemaining, start, pause, startPomodoro } =
    useTimerStore();

  return (
    <div
      className="card text-center py-8"
      style={{ borderColor: project.color + "20" }}
    >
      <div className="text-[11px] text-text-muted tracking-[3px] uppercase mb-2">
        {pomodoroMode ? `POMODORO ${pomodoroMode} MIN` : "FOCUS SESSION"}
      </div>

      <div
        className="text-6xl md:text-7xl font-bold leading-none my-4 tabular-nums"
        style={{
          color: project.color,
          textShadow: `0 0 40px ${project.color}30`,
        }}
      >
        {pomodoroMode ? formatTime(pomodoroRemaining) : formatTime(seconds)}
      </div>

      {pomodoroMode && (
        <div className="text-xs text-text-muted mb-3">
          Sesion: {formatTime(seconds)}
        </div>
      )}

      <div className="flex gap-2 justify-center flex-wrap mt-5">
        {!running ? (
          <>
            <Btn color={project.color} onClick={start}>
              Iniciar
            </Btn>
            <Btn color="#666" onClick={() => startPomodoro(25)}>
              25m
            </Btn>
            <Btn color="#666" onClick={() => startPomodoro(50)}>
              50m
            </Btn>
          </>
        ) : (
          <Btn color="#FFD93D" onClick={pause}>
            Pausa
          </Btn>
        )}
        {(running || seconds > 0) && (
          <Btn color="#FF6B6B" onClick={onEndSession}>
            Terminar
          </Btn>
        )}
      </div>
    </div>
  );
}
