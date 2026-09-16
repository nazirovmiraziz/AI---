# SMART SCHOOL AI

Персональный AI-репетитор. Фронтенд — Next.js, бэкенд — Node API, база — Neon Postgres.

## Локально

```bash
npm install
cp .env.example .env.local
npm run dev
```

Сайт: http://localhost:3000

Бэкенд отдельно:

```bash
cd backend
npm install
npm run dev
```

## Деплой

1. **Neon** — создай проект, скопируй `DATABASE_URL`, выполни SQL из `backend/schema.sql`.
2. **Railway** — New Project → Deploy from GitHub → Root Directory: `backend`.
   Переменные: `DATABASE_URL`, `GEMINI_API_KEY`, `FRONTEND_URL` (адрес Vercel).
3. **Vercel** — Import GitHub repo (корень репозитория).
   Переменные: `API_URL` = `https://<твой-сервис>.up.railway.app`.
4. После деплоя подставь `FRONTEND_URL` на Railway.

Ключи AI держи только на Railway, не во фронтенде.
