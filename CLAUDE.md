# FocusStack (CLAUDE.md)

> Un proyecto por dia. Deep focus. Ship it.

---

## Que es Este Proyecto

**FocusStack** es un sistema de productividad para side hustlers que manejan multiples proyectos despues del trabajo. Un cockpit personal con timer, tareas, planificacion semanal y un bot de Telegram bidireccional.

**Owner:** Juan -- Construction supervisor, NYC. Works 4pm-10pm on side projects.

**Production:** https://focustack.vercel.app
**GitHub:** https://github.com/lalas825/Focustack

---

## Stack

| Capa | Tecnologia |
|------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Estilos | Tailwind CSS 3.4 |
| State | Zustand |
| Validacion | Zod |
| Backend | Supabase (Database + Auth + RLS) |
| Bot | Telegram (bidireccional, webhook-based) |
| Deploy | Vercel |

---

## Feature-First Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout (dark theme, IBM Plex Mono)
│   ├── page.tsx                # Main dashboard (redirects to /today)
│   ├── today/page.tsx          # Today tab
│   ├── week/page.tsx           # Week tab
│   ├── projects/page.tsx       # Projects tab
│   ├── logs/page.tsx           # Session logs tab
│   ├── login/page.tsx          # Login page
│   ├── auth/callback/route.ts  # Supabase auth callback
│   └── api/
│       └── telegram/
│           ├── webhook/route.ts   # Telegram bot webhook handler
│           └── setup/route.ts     # One-time webhook registration
│
├── features/
│   ├── timer/                  # Focus timer + Pomodoro
│   │   ├── components/         # TimerDisplay, PomodoroControls
│   │   ├── hooks/              # useTimer, usePomodoro
│   │   └── store.ts            # Timer Zustand store (localStorage persist)
│   │
│   ├── projects/               # Project management + tasks
│   │   ├── components/         # ProjectModal, TaskList, TaskInput, ProjectsTab
│   │   ├── store.ts            # Tasks Zustand store
│   │   └── customProjectsStore.ts  # Projects CRUD store
│   │
│   ├── planner/                # Weekly planner + hours tracking
│   │   ├── components/         # WeekCalendar, HoursBar
│   │   ├── store.ts            # Hours store
│   │   └── scheduleStore.ts    # Weekly schedule store
│   │
│   ├── logs/                   # Daily log + export
│   │   ├── components/         # LogEntry, ExportButton
│   │   └── store.ts            # Logs Zustand store
│   │
│   ├── auth/                   # Authentication
│   │   ├── components/
│   │   └── services/
│   │       └── loadUserData.ts # Hydrates all stores from Supabase
│   │
│   └── cowork/                 # Telegram bot integration
│       ├── telegram.ts         # Telegram bot API helpers
│       └── briefing.ts         # Briefing generator
│
├── lib/
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       ├── server.ts           # Server Supabase client
│       └── admin.ts            # Service role client (bypasses RLS)
│
├── shared/
│   ├── components/             # shadcn/ui + shared UI
│   ├── hooks/                  # useWeekReset, useLocalStorage
│   ├── lib/
│   │   ├── i18n.ts
│   │   ├── supabase-sync.ts    # Optimistic update helper with rollback
│   │   └── resetStores.ts
│   └── types/
│       └── index.ts            # Project, Task, SessionLog, etc.
│
└── middleware.ts               # Auth gate (server-side)
```

---

## Design System

- **Background:** #0D0D1A
- **Surface:** #111124
- **Border:** #1a1a2e
- **Text primary:** #E0E0E0
- **Text secondary:** #888888
- **Text muted:** #555555
- **Font:** IBM Plex Mono (monospace)
- **Accent colors (defaults, user-customizable):**
  - Jantile: #00E5A0
  - Velora: #FF6B6B
  - HustleFlow: #FFD93D
  - FocusStack: #7B68EE
  - ReelAI: #FF69B4
  - AlgoICT: #4ECDC4

---

## Features

1. Focus Timer -- session timer per project, friction modal on switch
2. Pomodoro Mode -- 25/50 min blocks with alarm
3. Today Tab -- today's project (auto from schedule), quick task input
4. Week Tab -- weekly planner, one project per day, hours logged vs target
5. Projects Tab -- task manager per project, progress bars, edit/delete/complete actions
6. Logs Tab -- session logs, daily log export
7. Weekly Reset -- auto-resets hours every Monday
8. Supabase Auth -- email/password, middleware-gated routes, RLS
9. Cowork Integration -- Telegram bot (bidirectional, webhook-based)

---

## Telegram Bot Commands (Claude Cowork)

| Command | Action |
|---------|--------|
| `/task [Project]: text` | Add task (no project = today's project) |
| `/tasks` | View pending tasks for today's project |
| `/done [N]` | Mark task #N as completed |
| `/projects` | List active projects |
| `/bulk Project\n- task1\n- task2` | Batch create tasks |
| `/review [Project]` | Auto-complete tasks matched against GitHub commits (48h) |
| `/start` | Welcome message |

---

## Supabase Tables

| Table | Key Columns |
|-------|-------------|
| `user_projects` | id, user_id, name, emoji, color, target_hours, days, status, github_repo |
| `tasks` | id, user_id, project_id, text, done, created_at, priority, estimation_minutes |
| `hours` | id, user_id, project_id, seconds, week_start |
| `session_logs` | id, user_id, date, day, project_id, project_name, hours_logged, completed, blockers, tomorrow_project |
| `daily_assignments` | id, user_id, day_of_week, project_id |

---

## Environment Variables

```bash
# Client-side
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=...
NEXT_PUBLIC_TELEGRAM_CHAT_ID=...

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ALLOWED_CHAT_ID=...
TELEGRAM_USER_ID=...
GITHUB_TOKEN=...              # GitHub PAT for /review command
```

---

## Auth Flow

1. Middleware (server-side) gates all routes except `/login` and `/auth/callback`
2. Client uses `onAuthStateChange` -> `setTimeout` -> `loadUserData`
3. `loadUserData` fetches tasks/hours/logs and hydrates Zustand stores
4. Timer store stays on localStorage persist (never touched by Supabase)

---

## Critical Patterns

### Supabase onAuthStateChange Deadlock
**Never await Supabase API calls inside onAuthStateChange callback.** The Supabase JS client holds an internal lock during the callback. Using the same client (singleton from `createBrowserClient`) for API calls causes a deadlock.

Fix: `setTimeout(() => loadUserData(userId), 0)` to break out of the lock.

Also: `getUser()` and `getSession()` hang on the client for the same reason -- use `onAuthStateChange` as the sole auth mechanism.

### Never use getUser() in Zustand store actions
Store `userId` in state, set during `loadUserData()`. Do not call `getUser()` from store actions.

### Hydration Mismatch Guard
Pages using `new Date()` or `getTodayProject()` need a mounted guard:
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

### Optimistic Updates
Use `supabase-sync.ts` helper for optimistic updates with automatic rollback on failure.

---

## Rules

1. **One project per day.** The schedule is fixed. Never split time.
2. **Friction modal required** when switching projects mid-session.
3. **Spanish** for all user-facing text in the app.
4. **Dark theme only.** No light mode. This is a focus tool.
5. **Mobile responsive.** Juan checks from phone at the job site.

---

## Do NOT

- Add light theme
- Over-engineer -- ship fast, iterate later
- Await Supabase calls inside `onAuthStateChange`
- Call `getUser()` from Zustand store actions
