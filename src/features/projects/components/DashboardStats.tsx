"use client";

import { useTasksStore } from "@/features/projects/store";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { useTranslation } from "@/shared/lib/i18n";

export function DashboardStats() {
  const { t } = useTranslation();
  const tasks = useTasksStore((s) => s.tasks);

  // Compute KPIs inline from the tasks map (avoids object-returning selectors)
  const all = Object.values(tasks).flat();

  // KPI 1: Enfoque — high priority completion ratio
  const high = all.filter((t) => t.priority === "high");
  const highDone = high.filter((t) => t.done);
  const focusRate = high.length > 0 ? Math.round((highDone.length / high.length) * 100) : 0;

  // KPI 2: Productividad — estimated hours from completed tasks
  const completed = all.filter((t) => t.done);
  const totalMin = completed.reduce((sum, t) => sum + (t.estimationMinutes ?? 0), 0);
  const prodHours = Math.floor(totalMin / 60);
  const prodMins = totalMin % 60;

  // KPI 3: Velocidad — tasks completed in last 24h
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const velocity = all.filter((t) => t.done && t.createdAt >= cutoff).length;

  const hasData = high.length > 0 || totalMin > 0 || velocity > 0;

  if (!hasData) {
    return (
      <div className="card text-center py-6 mb-5">
        <p className="text-text-muted text-xs">{t("kpi.noData")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {/* KPI 1: Enfoque */}
      <div className="card">
        <p className="text-[10px] text-text-muted tracking-widest mb-1">
          {t("kpi.focus")}
        </p>
        <p className="text-2xl font-bold text-text-primary">
          {focusRate}%
        </p>
        <div className="mt-2">
          <ProgressBar value={highDone.length} max={Math.max(high.length, 1)} color="#FF6B6B" />
        </div>
        <p className="text-[10px] text-text-dark mt-1">
          {t("kpi.focusDesc")} · {highDone.length}/{high.length}
        </p>
      </div>

      {/* KPI 2: Productividad */}
      <div className="card">
        <p className="text-[10px] text-text-muted tracking-widest mb-1">
          {t("kpi.productivity")}
        </p>
        <p className="text-2xl font-bold text-text-primary">
          {prodHours > 0 ? `${prodHours}h ` : ""}{prodMins}m
        </p>
        <p className="text-[10px] text-text-dark mt-3">
          {t("kpi.productivityDesc")}
        </p>
      </div>

      {/* KPI 3: Velocidad */}
      <div className="card">
        <p className="text-[10px] text-text-muted tracking-widest mb-1">
          {t("kpi.velocity")}
        </p>
        <p className="text-2xl font-bold text-text-primary">
          {velocity}
        </p>
        <p className="text-[10px] text-text-dark mt-3">
          {t("kpi.velocityDesc")}
        </p>
      </div>
    </div>
  );
}
