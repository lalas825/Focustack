import type { SessionLog } from "@/shared/types";
import type { HoursMap } from "@/shared/types";
import { getAllProjects, getTodayProject, getTomorrowProject } from "@/features/projects/data/projects";
import { formatHours, getTodayES } from "@/shared/lib/utils";

// ─── TELEGRAM API ───────────────────────────────────
const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "";

export function isTelegramConfigured(): boolean {
  return BOT_TOKEN.length > 0 && CHAT_ID.length > 0;
}

export async function sendTelegram(message: string): Promise<boolean> {
  if (!isTelegramConfigured()) {
    console.warn("Telegram not configured. Set NEXT_PUBLIC_TELEGRAM_BOT_TOKEN and NEXT_PUBLIC_TELEGRAM_CHAT_ID in .env.local");
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );
    return res.ok;
  } catch (e) {
    console.error("Telegram send error:", e);
    return false;
  }
}

// ─── BRIEFING GENERATOR ─────────────────────────────
export function generateBriefing(
  hours: HoursMap,
  lastLog?: SessionLog,
  fieldyNotes?: string
): string {
  const project = getTodayProject();
  const date = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dayES = getTodayES();

  const fieldNotes = fieldyNotes?.trim()
    ? fieldyNotes.trim()
    : "Sin notas de campo hoy.";

  const whereLeft = lastLog
    ? `${lastLog.completed || "Sin registro de ultima sesion."}`
    : "Primera sesion — revisar GitHub para ultimo commit.";

  const allProjects = getAllProjects();
  const weekHours = allProjects.map(
    (p) => `${p.emoji} ${p.name}: ${formatHours(hours[p.id] || 0)}h / ${p.targetHours}h`
  ).join("\n");

  return `━━━━━━━━━━━━━━━━━━━━━━━━━
JUAN — BRIEFING ${dayES.toUpperCase()} ${date}
━━━━━━━━━━━━━━━━━━━━━━━━━

EN OBRA HOY:
${fieldNotes}

HOY EN CASA: ${project.emoji} ${project.name}
Tienes 6 horas (4pm-10pm)

DONDE LO DEJASTE:
${whereLeft}

ESTA SEMANA:
${weekHours}

Abre el timer y arranca con la primera tarea.
━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ─── END OF DAY MESSAGE ─────────────────────────────
export function generateEndOfDay(log: SessionLog): string {
  return `SESION TERMINADA — ${log.date}
Proyecto: ${log.projectName}
Tiempo: ${log.hoursLogged.toFixed(1)}h
Completado: ${log.completed || "—"}
Manana: ${log.tomorrowProject}`;
}

// ─── DAILY LOG EXPORT (Cowork format) ───────────────
export function exportDailyLogMd(log: SessionLog): string {
  return `## ${log.date} — ${log.projectName}
**Horas:** ${log.hoursLogged.toFixed(1)}h
**Completado:** ${log.completed || "—"}
**Blockers:** ${log.blockers || "—"}
**Manana toca:** ${log.tomorrowProject}
---`;
}
