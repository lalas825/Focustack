"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/features/timer/store";

/**
 * Encapsulates the timer tick interval + pomodoro completion logic.
 * @param onPomodoroComplete - Called when a pomodoro finishes, receives (projectId, elapsedSeconds).
 */
export function useTimerTick(
  onPomodoroComplete?: (projectId: string, elapsedSeconds: number) => void
) {
  const timer = useTimerStore();
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(onPomodoroComplete);
  callbackRef.current = onPomodoroComplete;

  useEffect(() => {
    if (timer.running) {
      tickRef.current = setInterval(() => {
        const state = useTimerStore.getState();
        state.tick();

        if (state.pomodoroMode) {
          const done = state.tickPomodoro();
          if (done) {
            callbackRef.current?.(state.project.id, state.seconds + 1);
            state.reset();
            try {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              osc.frequency.value = 880;
              osc.connect(ctx.destination);
              osc.start();
              setTimeout(() => osc.stop(), 200);
            } catch {}
          }
        }
      }, 1000);
    } else if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [timer.running]);
}
