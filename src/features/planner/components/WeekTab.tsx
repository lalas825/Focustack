"use client";

import { useState } from "react";
import { useHoursStore } from "@/features/planner/store";
import { useScheduleStore } from "@/features/planner/scheduleStore";
import { PROJECTS, ACTIVE_PROJECTS } from "@/features/projects/data/projects";
import { useCustomProjectsStore } from "@/features/projects/customProjectsStore";
import { getToday, DAYS } from "@/shared/lib/utils";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { useTranslation } from "@/shared/lib/i18n";
import { DayPopover } from "./DayPopover";

const MAX_CHIPS = 3;

function getProjectById(id: string, customProjects: typeof PROJECTS) {
  return PROJECTS.find((p) => p.id === id) || customProjects.find((p) => p.id === id);
}

export function WeekTab() {
  const { t } = useTranslation();
  const { hours } = useHoursStore();
  const schedule = useScheduleStore((s) => s.schedule);
  const toggleProject = useScheduleStore((s) => s.toggleProject);
  const customProjects = useCustomProjectsStore((s) => s.projects);
  const [openDay, setOpenDay] = useState<number | null>(null);

  // Merge all active projects for hours display
  const allActive = [...ACTIVE_PROJECTS, ...customProjects];

  return (
    <div className="space-y-5">
      {/* Hours this week */}
      <div className="card">
        <h3 className="text-sm text-text-secondary font-medium mb-5">
          {t("week.hoursThisWeek")}
        </h3>
        {allActive.filter((p) => p.targetHours > 0).map((p) => {
          const logged = (hours[p.id] || 0) / 3600;
          return (
            <div key={p.id} className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm" style={{ color: p.color }}>
                  {p.emoji} {p.name}
                </span>
                <span
                  className="text-sm"
                  style={{ color: logged >= p.targetHours ? "#00E5A0" : "#888" }}
                >
                  {logged.toFixed(1)}h / {p.targetHours}h
                </span>
              </div>
              <ProgressBar value={logged} max={p.targetHours} color={p.color} />
            </div>
          );
        })}
        <div className="mt-5 pt-4 border-t border-bg-elevated flex justify-between">
          <span className="text-sm text-text-secondary">{t("week.total")}</span>
          <span className="text-sm text-white font-semibold">
            {(Object.values(hours).reduce((a, b) => a + b, 0) / 3600).toFixed(1)}h / 30h
          </span>
        </div>
      </div>

      {/* Weekly plan */}
      <div className="card">
        <h3 className="text-sm text-text-secondary font-medium mb-5">
          {t("week.weeklyPlan")}
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const dayProjects = (schedule[i] || [])
              .map((id) => getProjectById(id, customProjects))
              .filter(Boolean) as typeof PROJECTS;
            const isToday = day === getToday();
            const firstColor = dayProjects[0]?.color || "#555";
            const overflow = dayProjects.length > MAX_CHIPS ? dayProjects.length - MAX_CHIPS : 0;

            return (
              <div key={day} className="relative">
                <button
                  onClick={() => setOpenDay(openDay === i ? null : i)}
                  className="w-full rounded-xl p-3 text-center border cursor-pointer transition-colors hover:border-text-muted"
                  style={{
                    backgroundColor: isToday ? firstColor + "12" : "#0D0D1A",
                    borderColor: isToday ? firstColor + "35" : openDay === i ? "#555" : "#1a1a2e",
                  }}
                >
                  <div
                    className="text-[10px] tracking-[1px] uppercase mb-1.5"
                    style={{ color: isToday ? "#fff" : "#555", fontWeight: isToday ? 700 : 400 }}
                  >
                    {t(`days.${i}` as any)}
                  </div>

                  {dayProjects.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1">
                      {dayProjects.slice(0, MAX_CHIPS).map((p) => (
                        <span
                          key={p.id}
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: p.color + "20", color: p.color }}
                          title={p.name}
                        >
                          {p.emoji}
                        </span>
                      ))}
                      {overflow > 0 && (
                        <span className="text-[10px] text-text-muted self-center">
                          +{overflow}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-text-dark mt-2">
                      {t("week.noProjects")}
                    </div>
                  )}
                </button>

                {openDay === i && (
                  <DayPopover
                    dayIndex={i}
                    assigned={schedule[i] || []}
                    onToggle={(projectId) => toggleProject(i, projectId)}
                    onClose={() => setOpenDay(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
