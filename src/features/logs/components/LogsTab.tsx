"use client";

import { useLogsStore } from "@/features/logs/store";
import { PROJECTS } from "@/features/projects/data/projects";
import { Btn } from "@/shared/components/Btn";
import { useTranslation } from "@/shared/lib/i18n";

interface LogsTabProps {
  onExport: () => void;
}

export function LogsTab({ onExport }: LogsTabProps) {
  const { t } = useTranslation();
  const { logs } = useLogsStore();

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm text-text-secondary font-medium">{t("logs.title")}</h3>
        {logs.length > 0 && (
          <Btn color="#00E5A0" onClick={onExport}>
            {t("logs.copyLast")}
          </Btn>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-text-muted text-sm">{t("logs.empty")}</p>
          <p className="text-text-dark text-xs mt-1">
            {t("logs.emptyHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => {
            const proj = PROJECTS.find((p) => p.id === log.projectId);
            return (
              <div
                key={i}
                className="bg-bg-surface rounded-xl p-4 border-l-[3px]"
                style={{ borderColor: proj?.color || "#555" }}
              >
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: proj?.color }}>
                    {log.projectName}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {log.date} · {log.day} · {log.hoursLogged.toFixed(1)}h
                  </span>
                </div>
                {log.completed && (
                  <div className="text-xs text-text-secondary mb-1">{log.completed}</div>
                )}
                {log.blockers && (
                  <div className="text-xs text-red-400/60">{log.blockers}</div>
                )}
                <div className="text-[11px] text-text-dark mt-2">
                  {t("logs.tomorrow")}: {log.tomorrowProject}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
