# Cowork — Telegram Integration

## Setup (5 minutes)

### 1. Create Telegram Bot

1. Open Telegram -> search `@BotFather`
2. Send `/newbot`
3. Name: `Cowork Juan` (or whatever you want)
4. Username: `cowork_juan_bot` (must be unique)
5. BotFather gives you a **token** -> copy it

### 2. Get Your Chat ID

1. Open your new bot in Telegram -> send `/start`
2. Visit in browser:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
3. Find `"chat":{"id":XXXXXXX}` -> that's your Chat ID

### 3. Configure Environment

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Fill in:
```
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=123456:ABC-xyz
NEXT_PUBLIC_TELEGRAM_CHAT_ID=987654321
```

### 4. Test

Restart the dev server. Go to the app -> end a session -> the summary should appear in Telegram.

---

## What Gets Sent to Telegram

### Daily Briefing (manual trigger from app)
Sends a summary of today's project, weekly hours, and where you left off.

### End of Day
Sends a session summary with project, time, and notes.

---

## Future: Automated Briefings

Phase 2 will add a cron job (Vercel Cron or external) that:
1. Reads GitHub commits via GitHub API
2. Reads fieldy_notes from Supabase
3. Generates briefing at 3:30 PM ET
4. Sends to Telegram automatically

For now, use the "Enviar Briefing" button in the app.
