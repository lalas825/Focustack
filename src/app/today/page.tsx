"use client";

import { useTimerStore } from "@/features/timer/store";
import { useTimerTick } from "@/features/timer/hooks/useTimerTick";
import { TimerDisplay } from "@/features/timer/components/TimerDisplay";
import { ProjectBadge } from "@/shared/components/ProjectBadge";
import { Btn } from "@/shared/components/Btn";

export default function TodayPage() {
  const { running, start, pause, reset, seconds, project } = useTimerStore();

  useTimerTick();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <ProjectBadge project={project} className="mb-10 px-4" />

      <TimerDisplay />

      <div className="flex gap-3 mt-8">
        {!running ? (
          <Btn color={project.color} onClick={start}>
            Iniciar
          </Btn>
        ) : (
          <Btn color="#FFD93D" onClick={pause}>
            Pausa
          </Btn>
        )}
        {seconds > 0 && (
          <Btn color="#FF6B6B" onClick={reset}>
            Reset
          </Btn>
        )}
      </div>
    </div>
  );
}
