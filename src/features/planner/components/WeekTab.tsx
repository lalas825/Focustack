"use client";

import { useHoursStore } from "@/features/planner/store";
import { PROJECTS, ACTIVE_PROJECTS } from "@/features/projects/data/projects";
import { getToday, DAYS } from "@/shared/lib/utils";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { useTranslation } from "@/shared/lib/i18n";

export function WeekTab() {
  const { t } = useTranslation();
  const { hours } = useHoursStore();

  return (
    <div className="space-y-5">
      <div className="card">
        <h3 className="text-sm text-text-secondary font-medium mb-5">
          {t("week.hoursThisWeek")}
        </h3>
        {ACTIVE_PROJECTS.map((p) => {
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

      <div className="card">
        <h3 className="text-sm text-text-secondary font-medium mb-5">
          {t("week.weeklyPlan")}
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {DAYS.map((day, i) => {
            const proj = PROJECTS.find(
              (p) => p.days.includes(day as never) && p.status === "active"
            );
            const isToday = day === getToday();
            return (
              <div
                key={day}
                className="rounded-xl p-3 text-center border"
                style={{
                  backgroundColor: isToday ? (proj?.color || "#555") + "12" : "#0D0D1A",
                  borderColor: isToday ? (proj?.color || "#555") + "35" : "#1a1a2e",
                }}
              >
                <div
                  className="text-[10px] tracking-[1px] uppercase mb-1.5"
                  style={{ color: isToday ? "#fff" : "#555", fontWeight: isToday ? 700 : 400 }}
                >
                  {t(`days.${i}` as any)}
                </div>
                {proj ? (
                  <>
                    <div className="text-xl mb-1">{proj.emoji}</div>
                    <div className="text-[10px] font-medium" style={{ color: proj.color }}>
                      {proj.name.split(" ")[0]}
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-text-dark mt-2">—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
