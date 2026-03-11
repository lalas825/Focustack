# PRP-001: FocusStack — Phase 1

## Overview
Personal productivity dashboard for managing 6 parallel side projects with deep focus methodology.

## User Story
As Juan (construction supervisor + side hustler), I want a single dashboard that tells me which project to work on today, tracks my time, manages my tasks, and integrates with my Cowork automation system, so I can maximize my 6 hours of daily side hustle time.

## Features

### 1. Focus Timer
- Free-form timer (start/pause/stop)
- Pomodoro mode (25 min / 50 min blocks)
- Visual timer display with project color coding
- Audio notification on Pomodoro completion
- Session time saved to weekly hours on end

### 2. Today Tab
- Auto-selects today's project from fixed schedule
- Shows weekly progress bar for current project
- Quick task input
- Task list (pending + completed)
- Project switch with friction modal

### 3. Week Tab
- Hours logged vs target per active project
- Total weekly hours
- Visual weekly calendar (Mon-Sun) with project assignments

### 4. Projects Tab
- All 6 projects listed
- Active projects: hours, progress bar, tasks, task input
- Blocked projects: grayed out, no interaction

### 5. Logs Tab
- Session history (date, project, hours, notes, blockers)
- Export last log in Cowork markdown format

### 6. Cowork Integration
- Send daily briefing to Telegram (manual button)
- Send end-of-day summary to Telegram on session end
- Export daily log in markdown format for Cowork to read

### 7. Weekly Reset
- Auto-reset hours to 0 every Monday
- Detect via comparing stored week_start with current

## Schedule (Fixed)
- Mon/Wed/Fri/Sun -> Jantile (14h target)
- Tue/Thu -> Velora (10h target)
- Sat -> HustleFlow (6h target)

## Technical Decisions
- localStorage only (Phase 1)
- No auth, no Supabase
- All state in Zustand stores
- Zod schemas for type safety
- IBM Plex Mono + dark theme (#0D0D1A)

## Acceptance Criteria
- [ ] Timer starts, pauses, resets correctly
- [ ] Pomodoro counts down and alerts on completion
- [ ] Friction modal appears when switching project mid-session
- [ ] End session saves log and sends to Telegram (if configured)
- [ ] Weekly hours reset on Monday
- [ ] Schedule correctly assigns project per day
- [ ] Blocked projects are non-interactive
- [ ] Mobile responsive
