# FocusStack

Productivity OS for side hustlers. One project per day. Deep focus. Ship it.

**Live:** https://focustack.vercel.app

---

## What It Does

FocusStack is a personal cockpit for managing multiple side projects after work. It enforces a simple rule: one project per day, no context switching.

- **Focus Timer** with Pomodoro mode (25/50 min blocks)
- **Today view** showing the assigned project and its tasks
- **Week planner** with hours logged vs. target per project
- **Projects tab** for managing tasks, progress, and project settings
- **Session logs** with daily export
- **Telegram bot** (bidirectional) for adding tasks, marking done, and reviewing progress from your phone

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 3.4 |
| State | Zustand |
| Validation | Zod |
| Backend | Supabase (Postgres + Auth + RLS) |
| Bot | Telegram webhook (Next.js API routes) |
| Deploy | Vercel |

---

## Features

- Focus timer with friction modal on project switch
- Pomodoro mode (25/50 min) with alarm
- Auto-scheduled daily project from weekly planner
- Task management with quick input, priorities, and time estimates
- Project CRUD with emoji picker and custom colors
- Weekly hours tracking with auto-reset on Mondays
- Session log export
- Email/password auth with middleware-gated routes
- Telegram bot with commands: `/task`, `/tasks`, `/done`, `/projects`, `/bulk`, `/review`

---

## Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/task [Project]: text` | Add a task (omit project for today's) |
| `/tasks` | List pending tasks for today's project |
| `/done [N]` | Mark task #N as completed |
| `/projects` | List active projects |
| `/bulk Project\n- task1\n- task2` | Batch create tasks |
| `/review [Project]` | Auto-complete tasks matched against GitHub commits (48h) |
| `/start` | Welcome message |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Telegram bot
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token
NEXT_PUBLIC_TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ALLOWED_CHAT_ID=your_chat_id
TELEGRAM_USER_ID=your_supabase_user_id

# GitHub (for /review command)
GITHUB_TOKEN=your_github_pat
```

### 3. Set up Supabase

The app requires these tables (with RLS enabled):

- `user_projects` -- project definitions per user
- `tasks` -- tasks linked to projects
- `hours` -- tracked time per project per week
- `session_logs` -- daily session summaries
- `daily_assignments` -- weekly schedule (day -> project)

### 4. Run locally

```bash
npm run dev
```

### 5. Register the Telegram webhook

After deploying (or using ngrok for local dev), hit:

```
GET /api/telegram/setup
```

This registers your Vercel URL as the Telegram webhook endpoint.

---

## Deploy

Deployed on Vercel. Push to `main` triggers auto-deploy.

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under project settings.

---

## Project Structure

```
src/
├── app/                        # Next.js App Router pages + API routes
├── features/
│   ├── timer/                  # Focus timer + Pomodoro
│   ├── projects/               # Project & task management
│   ├── planner/                # Weekly planner + hours tracking
│   ├── logs/                   # Session logs
│   ├── auth/                   # Authentication + data loading
│   └── cowork/                 # Telegram bot integration
├── lib/supabase/               # Supabase clients (browser, server, admin)
├── shared/                     # UI components, hooks, types, utilities
└── middleware.ts               # Auth gate
```

See `CLAUDE.md` for the full architecture reference.

---

## License

Private project.
