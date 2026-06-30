# Setup

AI Reception Lite now runs as a local SQLite-backed mockup. It is designed to be
easy to clone, inspect, and run without external services.

## Requirements

- Node.js 22 or newer
- npm

The app uses Node's built-in `node:sqlite` module. No native SQLite package or
database server is required.

## Install

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Base URL used by local links and tests |
| `NEXT_PUBLIC_DEFAULT_BUSINESS_ID` | Optional public business id for `/contact` |
| `AI_RECEPTION_DB_PATH` | Local SQLite file path |
| `DEMO_AUTH_ENABLED` | Enables the mock login flow |

Default demo values:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_RECEPTION_DB_PATH=.data/ai-reception-lite.sqlite
DEMO_AUTH_ENABLED=true
```

## Demo Login

```text
demo@aireception.local / demo-password
```

The credentials only unlock the mock dashboard. They are not checked against a
real identity provider.

## Reset Local Data

The SQLite file is ignored by Git. Delete it to reset seeded data:

```bash
rm -f .data/ai-reception-lite.sqlite
```

The next request recreates the database with demo content.

## Validation Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm audit --audit-level=moderate
```

## Known Limits

- SQLite persistence is local and not intended for multi-user production use.
- Demo auth is a portfolio mock, not account security.
- AI classification is heuristic and deterministic.
- In-memory rate limiting is only for demo traffic.
