"use client";

import { isTelegramConfigured } from "@/features/cowork/telegram";
import { Btn } from "@/shared/components/Btn";

interface CoworkActionsProps {
  onSendBriefing: () => void;
  onExportLog: () => void;
}

export function CoworkActions({ onSendBriefing, onExportLog }: CoworkActionsProps) {
  return (
    <div className="card">
      <div className="text-[11px] text-text-muted tracking-[2px] uppercase mb-3">
        Cowork
      </div>
      <div className="flex gap-2 flex-wrap">
        <Btn color="#00E5A0" onClick={onSendBriefing}>
          Enviar Briefing
        </Btn>
        <Btn color="#888" onClick={onExportLog}>
          Exportar Log
        </Btn>
      </div>
      {!isTelegramConfigured() && (
        <p className="text-[11px] text-text-dark mt-3">
          Telegram no configurado. Ver{" "}
          <code className="text-accent-jantile">.env.local</code> y{" "}
          <code className="text-accent-jantile">src/features/cowork/README.md</code>
        </p>
      )}
    </div>
  );
}
