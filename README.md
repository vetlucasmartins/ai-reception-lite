# AI Reception Lite

AI Reception Lite is a portfolio-friendly mockup of an AI receptionist for small
businesses. It captures website leads, classifies them with a local heuristic
"AI" mock, creates follow-up tasks, and shows the workflow in a dashboard.

The project is intentionally self-contained for GitHub review: no Supabase,
OpenAI, n8n, paid APIs, or secrets are required.

## Stack

- Next.js App Router
- React Server Components for dashboard reads
- Local SQLite demo storage through Node's built-in `node:sqlite`
- Zod validation for public forms and server actions
- Playwright and Vitest tests
- Tailwind CSS

## Features

- Public lead capture form at `/contact`
- Demo login with an httpOnly cookie
- Seeded dashboard data so the app is visible immediately
- SQLite persistence in `.data/ai-reception-lite.sqlite`
- Local heuristic lead classification with safe fallback
- Lead detail page with conversations, classification, and follow-up tasks

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo login:

```text
demo@aireception.local / demo-password
```

The email/password are presentation-only. This is a mock portfolio app, not a
production authentication system.

## Environment

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_BUSINESS_ID=
AI_RECEPTION_DB_PATH=.data/ai-reception-lite.sqlite
DEMO_AUTH_ENABLED=true
```

Delete `.data/ai-reception-lite.sqlite` to reset the local demo database.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm audit --audit-level=moderate
```

## Documentation

- [Setup](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [AI Pipeline](docs/AI_PIPELINE.md)
- [Data Model](docs/DATA_MODEL.md)
- [Security](SECURITY.md)

## Security Posture

This app is safe-by-default for an open repository because it does not need real
credentials. Public input is validated, generated SQLite files are ignored, and
the demo auth flow is clearly scoped to portfolio use.

## Known Limits

- SQLite storage is local to the running machine or server instance.
- Demo auth is not real user authentication.
- The AI classification is a deterministic heuristic mock.
- Rate limiting is in-memory and suitable only for demo traffic.
