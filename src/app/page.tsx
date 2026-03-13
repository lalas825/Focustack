"use client";

import { useState, useEffect } from "react";
import { useTimerStore } from "@/features/timer/store";
import { useHoursStore } from "@/features/planner/store";
import { useTasksStore } from "@/features/projects/store";
import { useLogsStore } from "@/features/logs/store";
import { getTodayProject, getTomorrowProject } from "@/features/projects/data/projects";
import { useCustomProjectsStore } from "@/features/projects/customProjectsStore";
import { formatTime, formatHours, getTodayES, DAYS_ES } from "@/shared/lib/utils";
import {
  sendTelegram,
  isTelegramConfigured,
  generateBriefing,
  generateEndOfDay,
  exportDailyLogMd,
} from "@/features/cowork/telegram";
import type { SessionLog, Project } from "@/shared/types";
import { signOut } from "@/features/auth/services/signOut";
import { useTranslation } from "@/shared/lib/i18n";

import { useTimerTick } from "@/features/timer/hooks/useTimerTick";
import { TimerCard } from "@/features/timer/components/TimerCard";
import { WeekTab } from "@/features/planner/components/WeekTab";
import { ProjectsTab } from "@/features/projects/components/ProjectsTab";
import { LogsTab } from "@/features/logs/components/LogsTab";
import { CoworkActions } from "@/features/cowork/components/CoworkActions";
import { Btn } from "@/shared/components/Btn";
import { ProgressBar } from "@/shared/components/ProgressBar";
import { Modal } from "@/shared/components/Modal";
import { ProjectBadge } from "@/shared/components/ProjectBadge";
import { TaskInput } from "@/features/projects/components/TaskInput";
import { TaskList } from "@/features/projects/components/TaskList";
import { DashboardStats } from "@/features/projects/components/DashboardStats";

// ─── MAIN PAGE ──────────────────────────────────────
export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<"today" | "week" | "projects" | "logs">("today");

  const timer = useTimerStore();
  const hours = useHoursStore();
  const tasks = useTasksStore();
  const logs = useLogsStore();
  const { t, locale, setLocale, dateLocale } = useTranslation();
  const customProjects = useCustomProjectsStore((s) => s.projects);

  useEffect(() => setMounted(true), []);

  const [showFriction, setShowFriction] = useState(false);
  const [pendingProject, setPendingProject] = useState<Project | null>(null);
  const [showEndSession, setShowEndSession] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionBlockers, setSessionBlockers] = useState("");
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);

  // Timer tick + pomodoro completion
  useTimerTick((projectId, elapsedSeconds) => {
    hours.addSeconds(projectId, elapsedSeconds);
  });

  // ─── HANDLERS ───────────────────────────────────
  const handleSwitchProject = (p: Project) => {
    if (timer.running || timer.seconds > 0) {
      setPendingProject(p);
      setShowFriction(true);
    } else {
      timer.setProject(p);
    }
  };

  const confirmSwitch = () => {
    if (timer.seconds > 0) hours.addSeconds(timer.project.id, timer.seconds);
    timer.reset();
    timer.setProject(pendingProject!);
    setShowFriction(false);
    setPendingProject(null);
  };

  const handleEndSession = () => {
    if (timer.seconds > 0) hours.addSeconds(timer.project.id, timer.seconds);
    timer.pause();
    setShowEndSession(true);
  };

  const saveSession = async () => {
    const today = new Date();
    const tomorrow = getTomorrowProject();
    const log: SessionLog = {
      date: today.toISOString().split("T")[0],
      day: DAYS_ES[today.getDay()],
      projectId: timer.project.id,
      projectName: `${timer.project.emoji} ${timer.project.name}`,
      hoursLogged: (hours.hours[timer.project.id] || 0) / 3600,
      completed: sessionNotes,
      blockers: sessionBlockers,
      tomorrowProject: tomorrow ? `${tomorrow.emoji} ${tomorrow.name}` : "—",
    };
    logs.addLog(log);
    if (isTelegramConfigured()) {
      const msg = generateEndOfDay(log);
      const ok = await sendTelegram(msg);
      setTelegramStatus(ok ? t("status.sentTelegram") : t("status.sendError"));
      setTimeout(() => setTelegramStatus(null), 3000);
    }
    timer.reset();
    setShowEndSession(false);
    setSessionNotes("");
    setSessionBlockers("");
  };

  const handleSendBriefing = async () => {
    const lastLog = logs.logs[0];
    const msg = generateBriefing(hours.hours, lastLog);
    if (isTelegramConfigured()) {
      const ok = await sendTelegram(msg);
      setTelegramStatus(ok ? t("status.briefingSent") : t("status.error"));
    } else {
      await navigator.clipboard.writeText(msg);
      setTelegramStatus(t("status.copiedClipboard"));
    }
    setTimeout(() => setTelegramStatus(null), 3000);
  };

  const handleExportLog = () => {
    if (logs.logs.length === 0) return;
    const md = exportDailyLogMd(logs.logs[0]);
    navigator.clipboard.writeText(md);
    setTelegramStatus(t("status.logCopied"));
    setTimeout(() => setTelegramStatus(null), 3000);
  };

  const todayProject = getTodayProject();

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 py-5">
        {/* ─── HEADER ──────────────────────────── */}
        <header className="mb-8 pb-5 border-b border-bg-elevated">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">FOCUSTACK</h1>
              <p className="text-xs text-text-muted mt-1 tracking-[2px] uppercase">
                {getTodayES()} ·{" "}
                {new Date().toLocaleDateString(dateLocale, { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {telegramStatus && (
                <span className="text-xs px-3 py-1.5 rounded-lg bg-bg-surface border border-bg-elevated animate-pulse">
                  {telegramStatus}
                </span>
              )}
              <ProjectBadge project={timer.project} />
              <button
                onClick={() => setLocale(locale === "en" ? "es" : "en")}
                className="text-[10px] text-text-dark hover:text-text-secondary transition-colors px-2 py-1 rounded border border-bg-elevated"
              >
                {locale === "en" ? "ES" : "EN"}
              </button>
              <button
                onClick={signOut}
                className="text-[10px] text-text-dark hover:text-text-secondary transition-colors px-2 py-1 rounded border border-bg-elevated"
              >
                {t("header.signOut")}
              </button>
            </div>
          </div>
        </header>

        {/* ─── NAV ─────────────────────────────── */}
        <nav className="flex gap-0.5 mb-7 bg-bg-surface rounded-xl p-1">
          {([
            { id: "today", label: t("nav.today") },
            { id: "week", label: t("nav.week") },
            { id: "projects", label: t("nav.projects") },
            { id: "logs", label: t("nav.logs") },
          ] as const).map((navItem) => (
            <button
              key={navItem.id}
              onClick={() => setTab(navItem.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                tab === navItem.id ? "bg-bg-elevated text-white" : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {navItem.label}
            </button>
          ))}
        </nav>

        {/* ─── TAB CONTENT ─────────────────────── */}
        {tab === "today" && (
          <div className="space-y-5">
            <DashboardStats />
            <TimerCard onEndSession={handleEndSession} />

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm text-text-secondary font-medium">
                  {t("today.todayIs")} <span style={{ color: todayProject.color }}>{todayProject.name}</span>
                </h3>
                <span className="text-xs text-text-muted">
                  {formatHours(hours.hours[todayProject.id] || 0)}h / {todayProject.targetHours}h {t("today.weekTarget")}
                </span>
              </div>
              <ProgressBar
                value={(hours.hours[todayProject.id] || 0) / 3600}
                max={todayProject.targetHours}
                color={todayProject.color}
              />
              <div className="mt-4">
                <TaskInput onAdd={(text, priority, est) => tasks.addTask(todayProject.id, text, priority, est)} color={todayProject.color} />
              </div>
              <TaskList
                tasks={tasks.tasks[todayProject.id] || []}
                projectId={todayProject.id}
                color={todayProject.color}
                onToggle={tasks.toggleTask}
                onDelete={tasks.deleteTask}
              />
            </div>

            <CoworkActions onSendBriefing={handleSendBriefing} onExportLog={handleExportLog} />

            <div className="card">
              <div className="text-[11px] text-text-muted tracking-[2px] uppercase mb-3">
                {t("today.switchProject")}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {customProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchProject(p)}
                    className="px-3 py-1.5 rounded-md border text-xs font-medium transition-all"
                    style={{
                      borderColor: p.color + "30",
                      color: p.color,
                      backgroundColor: timer.project.id === p.id ? p.color + "18" : "transparent",
                      opacity: timer.project.id === p.id ? 1 : 0.6,
                    }}
                  >
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "week" && <WeekTab />}
        {tab === "projects" && <ProjectsTab />}
        {tab === "logs" && <LogsTab onExport={handleExportLog} />}

        {/* ─── FRICTION MODAL ──────────────────── */}
        {showFriction && pendingProject && (
          <Modal>
            <div className="text-center">
              <h3 className="text-[#FFD93D] text-base font-semibold mb-2">{t("friction.title")}</h3>
              <p className="text-text-secondary text-sm mb-1">
                {`${t("friction.youHave")} ${formatTime(timer.seconds)} ${t("friction.in")} ${timer.project.emoji} ${timer.project.name}.`}
              </p>
              <p className="text-[#FF6B6B] text-xs mb-6">{t("friction.rule")}</p>
              <div className="flex gap-2 justify-center">
                <Btn color="#555" onClick={() => { setShowFriction(false); setPendingProject(null); }}>
                  {t("friction.cancel")}
                </Btn>
                <Btn color="#FF6B6B" onClick={confirmSwitch}>
                  {t("friction.confirm")} {pendingProject.emoji}
                </Btn>
              </div>
            </div>
          </Modal>
        )}

        {/* ─── END SESSION MODAL ───────────────── */}
        {showEndSession && (
          <Modal>
            <h3 className="text-[#00E5A0] text-base font-semibold mb-5">
              {t("session.end")} — {timer.project.emoji} {timer.project.name}
            </h3>
            <div className="mb-4">
              <label className="text-xs text-text-secondary block mb-1.5">{t("session.whatCompleted")}</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder={t("session.completedPlaceholder")}
                className="input-base min-h-[60px] resize-y"
              />
            </div>
            <div className="mb-5">
              <label className="text-xs text-text-secondary block mb-1.5">{t("session.blockers")}</label>
              <textarea
                value={sessionBlockers}
                onChange={(e) => setSessionBlockers(e.target.value)}
                placeholder={t("session.blockersPlaceholder")}
                className="input-base min-h-[60px] resize-y"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Btn color="#555" onClick={() => { setShowEndSession(false); timer.reset(); }}>
                {t("session.cancel")}
              </Btn>
              <Btn color="#00E5A0" onClick={saveSession}>
                {t("session.save")}
              </Btn>
            </div>
          </Modal>
        )}

        {/* ─── FOOTER ──────────────────────────── */}
        <footer className="mt-10 pt-5 border-t border-bg-surface text-center">
          <p className="text-[10px] text-text-dark tracking-[1px]">
            {t("footer.tagline")}
          </p>
        </footer>
      </div>
    </div>
  );
}
