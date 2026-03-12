"use client";

import {
  useTasksStore,
  selectFocusRate,
  selectProductivityHours,
  selectVelocityToday,
} from "@/features/projects/store";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { useTranslation } from "@/shared/lib/i18n";

export function DashboardStats() {
  const { t } = useTranslation();
  const focus = useTasksStore(selectFocusRate);
  const productivity = useTasksStore(selectProductivityHours);
  const velocity = useTasksStore(selectVelocityToday);

  const hasData = focus.total > 0 || productivity.totalMinutes > 0 || velocity > 0;

  if (!hasData) {
    return (
      <div className="card text-center py-6 mb-5">
        <p className="text-text-muted text-xs">{t("kpi.noData")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {/* KPI 1: Enfoque — High priority completion */}
      <div className="card">
        <p className="text-[10px] text-text-muted tracking-widest mb-1">
          {t("kpi.focus")}
        </p>
        <p className="text-2xl font-bold text-text-primary">
          {focus.rate}%
        </p>
        <div className="mt-2">
          <ProgressBar value={focus.done} max={Math.max(focus.total, 1)} color="#FF6B6B" />
        </div>
        <p className="text-[10px] text-text-dark mt-1">
          {t("kpi.focusDesc")} · {focus.done}/{focus.total}
        </p>
      </div>

      {/* KPI 2: Productividad — Hours from completed tasks */}
      <div className="card">
        <p className="text-[10px] text-text-muted tracking-widest mb-1">
          {t("kpi.productivity")}
        </p>
        <p className="text-2xl font-bold text-text-primary">
          {productivity.hours > 0 && `${productivity.hours}h `}{productivity.minutes}m
        </p>
        <p className="text-[10px] text-text-dark mt-3">
          {t("kpi.productivityDesc")}
        </p>
      </div>

      {/* KPI 3: Velocidad — Tasks done in last 24h */}
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
