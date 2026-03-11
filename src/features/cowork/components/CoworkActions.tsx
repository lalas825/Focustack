"use client";

import { isTelegramConfigured } from "@/features/cowork/telegram";
import { Btn } from "@/shared/components/Btn";
import { useTranslation } from "@/shared/lib/i18n";

interface CoworkActionsProps {
  onSendBriefing: () => void;
  onExportLog: () => void;
}

export function CoworkActions({ onSendBriefing, onExportLog }: CoworkActionsProps) {
  const { t } = useTranslation();
  return (
    <div className="card">
      <div className="text-[11px] text-text-muted tracking-[2px] uppercase mb-3">
        {t("cowork.title")}
      </div>
      <div className="flex gap-2 flex-wrap">
        <Btn color="#00E5A0" onClick={onSendBriefing}>
          {t("cowork.sendBriefing")}
        </Btn>
        <Btn color="#888" onClick={onExportLog}>
          {t("cowork.exportLog")}
        </Btn>
      </div>
      {!isTelegramConfigured() && (
        <p className="text-[11px] text-text-dark mt-3">
          {t("cowork.telegramNotConfigured")}{" "}
          <code className="text-accent-jantile">.env.local</code> {t("cowork.and")}{" "}
          <code className="text-accent-jantile">src/features/cowork/README.md</code>
        </p>
      )}
    </div>
  );
}
