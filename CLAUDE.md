# 🏭 Productivity OS — Factory OS (CLAUDE.md)

> *"La máquina que construye la máquina."*
> Un proyecto por día. Deep focus. Ship it.

---

## 🎯 Qué es Este Proyecto

**Productivity OS** es el cockpit personal de Juan — un sistema de productividad para side hustlers que manejan múltiples proyectos después del trabajo. Construido con SaaS Factory Golden Path.

**Owner:** Juan — Construction supervisor, NYC. Works 4pm–10pm on side projects.

**Phase 1:** Personal use, localStorage, no auth. Deploy on Vercel.
**Phase 2:** Commercialize as FocusStack ($9-19/mo). Add Supabase auth + multi-user. BLOCKED until Jantile ships.

---

## 🔧 Golden Path Stack

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Estilos | Tailwind CSS 3.4 + shadcn/ui |
| State | Zustand |
| Validación | Zod |
| Backend | Phase 1: localStorage · Phase 2: Supabase |
| Deploy | Vercel (Account 1) |

---

## 📦 Feature-First Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (dark theme, IBM Plex Mono)
│   ├── page.tsx            # Main dashboard (redirects to /today)
│   ├── today/page.tsx      # Today tab
│   ├── week/page.tsx       # Week tab
│   ├── projects/page.tsx   # Projects tab
│   └── logs/page.tsx       # Session logs tab
│
├── features/
│   ├── timer/              # Focus timer + Pomodoro
│   │   ├── components/     # TimerDisplay, PomodoroControls
│   │   ├── hooks/          # useTimer, usePomodoro
│   │   └── store.ts        # Timer Zustand store
│   │
│   ├── projects/           # Project management + tasks
│   │   ├── components/     # ProjectCard, TaskList, TaskInput
│   │   ├── data/           # PROJECTS config, schedule
│   │   └── store.ts        # Projects & tasks Zustand store
│   │
│   ├── planner/            # Weekly planner + hours tracking
│   │   ├── components/     # WeekCalendar, HoursBar
│   │   └── store.ts        # Hours Zustand store
│   │
│   ├── logs/               # Daily log + export
│   │   ├── components/     # LogEntry, ExportButton
│   │   └── store.ts        # Logs Zustand store
│   │
│   └── cowork/             # Cowork briefing integration
│       ├── telegram.ts     # Telegram bot API helpers
│       ├── briefing.ts     # Briefing generator
│       └── README.md       # Setup instructions for Cowork + Telegram
│
└── shared/
    ├── components/ui/      # shadcn/ui components
    ├── hooks/              # useWeekReset, useLocalStorage
    ├── lib/                # utils, constants
    └── types/              # Shared TypeScript types
```

---

## 🎨 Design System

- **Background:** #0D0D1A
- **Surface:** #111124
- **Border:** #1a1a2e
- **Text primary:** #E0E0E0
- **Text secondary:** #888888
- **Text muted:** #555555
- **Font:** IBM Plex Mono (monospace)
- **Accent colors per project:**
  - Jantile: #00E5A0
  - Velora: #FF6B6B
  - HustleFlow: #FFD93D
  - FocusStack: #7B68EE
  - ReelAI: #FF69B4
  - MNQ Bot: #4ECDC4

---

## 📋 Features (Priority Order)

### Must Have — Phase 1
1. ✅ Focus Timer — session timer per project, friction modal on switch
2. ✅ Pomodoro Mode — 25/50 min blocks with alarm
3. ✅ Today Tab — today's project (auto from schedule), quick task input
4. ✅ Week Tab — weekly planner, one project per day, hours logged vs target
5. ✅ Projects Tab — task manager per project, progress bars
6. ✅ Logs Tab — session logs, daily log export in Cowork format
7. ✅ Weekly Reset — auto-resets hours every Monday
8. 🔲 Cowork Integration — Telegram bot for briefings

### Nice to Have — Phase 1.5
9. 🔲 Streak tracker per project
10. 🔲 Manual Telegram send button
11. 🔲 Fieldy notes paste area

---

## 🤖 Cowork Integration

Cowork is the automation engine. This web app is the cockpit.

### Telegram Bot Setup
1. Create bot via @BotFather → get BOT_TOKEN
2. Get CHAT_ID by messaging bot and hitting /start
3. Store in `.env.local`:
   ```
   NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_token
   NEXT_PUBLIC_TELEGRAM_CHAT_ID=your_chat_id
   ```
4. The app can send briefings and end-of-day summaries to Telegram

### Briefing Format (Spanish)
See `src/features/cowork/briefing.ts` for the exact format from the master CLAUDE.md.

---

## ⚠️ Rules

1. **One project per day.** The schedule is fixed. Never split time.
2. **Friction modal required** when switching projects mid-session.
3. **Spanish** for all user-facing text in the app.
4. **Blocked projects** show as disabled. Don't suggest working on them.
5. **Dark theme only.** No light mode. This is a focus tool.
6. **Mobile responsive.** Juan checks from phone at the job site.

---

## 🚫 Do NOT

- Add Supabase or auth in Phase 1
- Build features for blocked projects
- Use OAuth
- Add light theme
- Over-engineer — ship fast, iterate later
