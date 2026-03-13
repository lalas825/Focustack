"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// ─── TRANSLATIONS ──────────────────────────────────────
const translations = {
  en: {
    // Nav
    "nav.today": "Today",
    "nav.week": "Week",
    "nav.projects": "Projects",
    "nav.logs": "Log",

    // Header
    "header.signOut": "Sign out",

    // Timer
    "timer.focusSession": "FOCUS SESSION",
    "timer.pomodoro": "POMODORO",
    "timer.session": "Session",
    "timer.start": "Start",
    "timer.pause": "Pause",
    "timer.end": "End",
    "timer.reset": "Reset",
    "timer.running": "Running",
    "timer.paused": "Paused",
    "timer.ready": "Ready",

    // Today tab
    "today.todayIs": "TODAY:",
    "today.weekTarget": "wk",
    "today.switchProject": "Switch Project",

    // Friction modal
    "friction.title": "Switch project?",
    "friction.youHave": "You have",
    "friction.in": "in",
    "friction.rule": "The rule: one project per day. Are you sure?",
    "friction.cancel": "Cancel",
    "friction.confirm": "Yes, switch to",

    // End session modal
    "session.end": "End Session",
    "session.whatCompleted": "What did you complete today?",
    "session.completedPlaceholder": "e.g. Finished settings page, fixed timer bug...",
    "session.blockers": "Any blockers or pending items?",
    "session.blockersPlaceholder": "e.g. Need the API endpoint...",
    "session.cancel": "Cancel",
    "session.save": "Save Session",

    // Status messages
    "status.sentTelegram": "Sent to Telegram",
    "status.sendError": "Failed to send",
    "status.briefingSent": "Briefing sent",
    "status.error": "Error",
    "status.copiedClipboard": "Copied to clipboard (Telegram not configured)",
    "status.logCopied": "Log copied in Cowork format",

    // Week tab
    "week.hoursThisWeek": "HOURS THIS WEEK",
    "week.total": "Total",
    "week.weeklyPlan": "WEEKLY PLAN",
    "week.assignProjects": "Assign projects",
    "week.noProjects": "—",

    // Projects tab
    "projects.active": "ACTIVE",
    "projects.blocked": "BLOCKED",
    "projects.days": "Days",
    "projects.tasks": "Tasks",
    "project.newProject": "NEW PROJECT",
    "project.name": "Project name",
    "project.emoji": "Emoji",
    "project.color": "Color",
    "project.save": "Create",
    "project.cancel": "Cancel",

    // Task input
    "task.placeholder": "+ New task...",
    "task.addTask": "Add Task",
    "task.title": "Task title",
    "task.priority": "Priority",
    "task.priorityLow": "Low",
    "task.priorityMedium": "Medium",
    "task.priorityHigh": "High",
    "task.estimation": "Estimation",
    "task.minutes": "min",
    "task.hours": "hrs",
    "task.cancel": "Cancel",
    "task.save": "Save",

    // Dashboard KPIs
    "kpi.focus": "FOCUS",
    "kpi.focusDesc": "High priority",
    "kpi.productivity": "PRODUCTIVITY",
    "kpi.productivityDesc": "Hours completed",
    "kpi.velocity": "VELOCITY",
    "kpi.velocityDesc": "Done today",
    "kpi.noData": "No data yet",

    // Logs tab
    "logs.title": "SESSION LOG",
    "logs.copyLast": "Copy last",
    "logs.exportCsv": "Export CSV",
    "logs.empty": "No sessions recorded.",
    "logs.emptyHint": "Finish your first session to see the log.",
    "logs.tomorrow": "Tomorrow",

    // Cowork
    "cowork.title": "Cowork",
    "cowork.sendBriefing": "Send Briefing",
    "cowork.exportLog": "Export Log",
    "cowork.telegramNotConfigured": "Telegram not configured. See",
    "cowork.and": "and",

    // Login
    "login.subtitle": "One project per day. Deep focus.",
    "login.heading": "SIGN IN",
    "login.syncNote": "Your data syncs across devices",
    "login.google": "Continue with Google",

    // Waitlist
    "waitlist.subtitle": "Invite Only",
    "waitlist.title": "You're on the waitlist",
    "waitlist.message": "FocusStack is currently invite-only. We'll let you know when your access is ready.",
    "waitlist.backToLogin": "Back to login",

    // Footer
    "footer.tagline": "FOCUSTACK v2.0 · THE MACHINE THAT BUILDS THE MACHINE",

    // Error toasts
    "error.taskAdd": "Failed to save task",
    "error.taskToggle": "Failed to update task",
    "error.taskDelete": "Failed to delete task",
    "error.projectAdd": "Failed to save project",
    "error.projectDelete": "Failed to delete project",
    "error.scheduleSync": "Failed to update schedule",
    "error.logSync": "Failed to save session log",
    "error.hoursSyncFailed": "Hours sync failed — data safe locally",

    // Days (short)
    "days.0": "Sun",
    "days.1": "Mon",
    "days.2": "Tue",
    "days.3": "Wed",
    "days.4": "Thu",
    "days.5": "Fri",
    "days.6": "Sat",
  },

  es: {
    "nav.today": "Hoy",
    "nav.week": "Semana",
    "nav.projects": "Proyectos",
    "nav.logs": "Registro",

    "header.signOut": "Salir",

    "timer.focusSession": "SESION DE ENFOQUE",
    "timer.pomodoro": "POMODORO",
    "timer.session": "Sesion",
    "timer.start": "Iniciar",
    "timer.pause": "Pausa",
    "timer.end": "Terminar",
    "timer.reset": "Reset",
    "timer.running": "En progreso",
    "timer.paused": "Pausado",
    "timer.ready": "Listo",

    "today.todayIs": "HOY TOCA:",
    "today.weekTarget": "sem",
    "today.switchProject": "Cambiar Proyecto",

    "friction.title": "Cambiar de proyecto?",
    "friction.youHave": "Tienes",
    "friction.in": "en",
    "friction.rule": "La regla: un proyecto por dia. Estas seguro?",
    "friction.cancel": "Cancelar",
    "friction.confirm": "Si, cambiar a",

    "session.end": "Terminar Sesion",
    "session.whatCompleted": "Que completaste hoy?",
    "session.completedPlaceholder": "Ej: Termine la pagina de settings, arregle el bug del timer...",
    "session.blockers": "Algun blocker o pendiente?",
    "session.blockersPlaceholder": "Ej: Necesito el endpoint de la API...",
    "session.cancel": "Cancelar",
    "session.save": "Guardar Sesion",

    "status.sentTelegram": "Enviado a Telegram",
    "status.sendError": "Error al enviar",
    "status.briefingSent": "Briefing enviado",
    "status.error": "Error",
    "status.copiedClipboard": "Copiado al clipboard (Telegram no configurado)",
    "status.logCopied": "Log copiado en formato Cowork",

    "week.hoursThisWeek": "HORAS ESTA SEMANA",
    "week.total": "Total",
    "week.weeklyPlan": "PLAN SEMANAL",
    "week.assignProjects": "Asignar proyectos",
    "week.noProjects": "—",

    "projects.active": "ACTIVO",
    "projects.blocked": "BLOQUEADO",
    "projects.days": "Dias",
    "projects.tasks": "Tareas",
    "project.newProject": "NUEVO PROYECTO",
    "project.name": "Nombre del proyecto",
    "project.emoji": "Emoji",
    "project.color": "Color",
    "project.save": "Crear",
    "project.cancel": "Cancelar",

    "task.placeholder": "+ Nueva tarea...",
    "task.addTask": "Agregar Tarea",
    "task.title": "Titulo de la tarea",
    "task.priority": "Prioridad",
    "task.priorityLow": "Baja",
    "task.priorityMedium": "Media",
    "task.priorityHigh": "Alta",
    "task.estimation": "Estimacion",
    "task.minutes": "min",
    "task.hours": "hrs",
    "task.cancel": "Cancelar",
    "task.save": "Guardar",

    // Dashboard KPIs
    "kpi.focus": "ENFOQUE",
    "kpi.focusDesc": "Alta prioridad",
    "kpi.productivity": "PRODUCTIVIDAD",
    "kpi.productivityDesc": "Horas completadas",
    "kpi.velocity": "VELOCIDAD",
    "kpi.velocityDesc": "Hoy completadas",
    "kpi.noData": "Sin datos aun",

    "logs.title": "REGISTRO DE SESIONES",
    "logs.copyLast": "Copiar ultimo",
    "logs.exportCsv": "Exportar CSV",
    "logs.empty": "No hay sesiones registradas.",
    "logs.emptyHint": "Termina tu primera sesion para ver el registro.",
    "logs.tomorrow": "Manana",

    "cowork.title": "Cowork",
    "cowork.sendBriefing": "Enviar Briefing",
    "cowork.exportLog": "Exportar Log",
    "cowork.telegramNotConfigured": "Telegram no configurado. Ver",
    "cowork.and": "y",

    "login.subtitle": "Un proyecto por dia. Deep focus.",
    "login.heading": "INICIAR SESION",
    "login.syncNote": "Tus datos se sincronizan entre dispositivos",
    "login.google": "Continuar con Google",

    "waitlist.subtitle": "Solo con invitacion",
    "waitlist.title": "Estas en la lista de espera",
    "waitlist.message": "FocusStack es solo por invitacion. Te avisaremos cuando tu acceso este listo.",
    "waitlist.backToLogin": "Volver al login",

    "footer.tagline": "FOCUSTACK v2.0 · LA MAQUINA QUE CONSTRUYE LA MAQUINA",

    "error.taskAdd": "No se pudo guardar la tarea",
    "error.taskToggle": "No se pudo actualizar la tarea",
    "error.taskDelete": "No se pudo eliminar la tarea",
    "error.projectAdd": "No se pudo guardar el proyecto",
    "error.projectDelete": "No se pudo eliminar el proyecto",
    "error.scheduleSync": "No se pudo actualizar el horario",
    "error.logSync": "No se pudo guardar el registro",
    "error.hoursSyncFailed": "Error al sincronizar horas — datos guardados localmente",

    "days.0": "Dom",
    "days.1": "Lun",
    "days.2": "Mar",
    "days.3": "Mie",
    "days.4": "Jue",
    "days.5": "Vie",
    "days.6": "Sab",
  },
} as const;

// ─── TYPES ─────────────────────────────────────────────
export type Locale = "en" | "es";
export type TranslationKey = keyof (typeof translations)["en"];

// ─── CONTEXT ───────────────────────────────────────────
interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
  dateLocale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("focustack-locale") as Locale | null;
    if (saved && (saved === "en" || saved === "es")) {
      setLocaleState(saved);
      _setLocaleForSync(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    _setLocaleForSync(newLocale);
    localStorage.setItem("focustack-locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (key: TranslationKey): string => {
    return translations[locale][key] || translations.en[key] || key;
  };

  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dateLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}

// ─── MODULE-LEVEL ACCESSOR (for Zustand stores outside React) ───
let _currentLocale: Locale = "en";

export function _setLocaleForSync(locale: Locale) {
  _currentLocale = locale;
}

export function tSync(key: TranslationKey): string {
  return translations[_currentLocale]?.[key] ?? translations.en[key] ?? key;
}
