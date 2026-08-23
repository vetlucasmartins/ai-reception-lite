# AI Reception Lite

AI Reception Lite is a self-contained portfolio mockup of an AI receptionist for
small businesses. It captures public enquiries, classifies lead intent with a
local heuristic "AI" mock, creates follow-up tasks, and presents the result in a
clean dashboard.

The goal of this repository is simple: let someone clone it, run it, understand
the product idea, and review the implementation without needing Supabase,
OpenAI, n8n, paid APIs, or secrets.

## What It Demonstrates

- A public lead capture flow at `/contact`
- Demo login for reviewing the private dashboard
- Lead temperature, status, summary, and suggested next action
- Lead detail pages with conversation history and mock AI classification
- Business settings for services, tone of voice, and opening hours
- Local SQLite persistence through Node's built-in `node:sqlite`
- Validation, tests, and documentation suitable for an open-source portfolio

## Product Story

Small businesses often receive website enquiries but lose momentum because the
next follow-up is unclear. AI Reception Lite turns a raw contact request into a
small, reviewable workflow:

1. A visitor submits a service request.
2. The app stores the lead locally.
3. A deterministic mock classifier assigns temperature and next action.
4. The dashboard makes hot leads and follow-up tasks easy to scan.
5. The lead detail page explains what happened and what to do next.

This is intentionally a portfolio-grade MVP, not a production CRM.

## Tech Stack

| Area | Choice |
| --- | --- |
| Framework | Next.js App Router |
| UI | React, Tailwind CSS, lucide-react |
| Data | Local SQLite via Node `node:sqlite` |
| Validation | Zod |
| Tests | Vitest, Playwright |
| Auth | Demo-only httpOnly cookie |
| AI | Deterministic local heuristic mock |

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

The credentials are presentation-only. This app does not implement production
authentication.

## Demo Routes

| Route | Purpose |
| --- | --- |
| `/contact` | Public lead capture form |
| `/login` | Demo dashboard login |
| `/dashboard` | Lead pipeline, filters, and summary cards |
| `/leads/[id]` | Lead detail, conversation, classification, and tasks |
| `/settings` | Business profile and public form link |

## Environment

The default environment is local and secret-free:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_BUSINESS_ID=
AI_RECEPTION_DB_PATH=.data/ai-reception-lite.sqlite
DEMO_AUTH_ENABLED=true
```

Delete `.data/ai-reception-lite.sqlite` to reset the seeded demo database.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

`npm run test:e2e` starts the Next.js dev server and runs the public
lead-to-dashboard Playwright flow on desktop and mobile projects.

## Repository Guide

- [Setup](docs/SETUP.md)
- [Product Spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [AI Pipeline](docs/AI_PIPELINE.md)
- [Data Model](docs/DATA_MODEL.md)
- [Security](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## Security Posture

This repository is designed to be safe to publish:

- no real API keys or service-role credentials
- no external workflow secrets
- ignored local SQLite files
- Zod validation at public input boundaries
- generic API error responses
- demo auth clearly scoped to portfolio use

See [SECURITY.md](SECURITY.md) for the full security notes.

## Known Limits

- SQLite storage is local to the running machine or server instance.
- Demo auth is not real account security.
- The classifier is deterministic and local, not an LLM integration.
- Rate limiting is in-memory and suitable only for demo traffic.
- The app should not be used for real customer data without replacing the demo
  auth, persistence, authorization, and AI layers.

## Built by LookADev

This is a working prototype of an **AI receptionist for small businesses**, built by [LookADev](https://lookadev.com), a software & AI automation studio.

Small shops lose enquiries every day because nobody follows up the moment a raw contact lands. This demo turns a website enquiry into a qualified lead, a first task, and a clear next action, without a human touching it.

If your business has the same gap, we build the production version around your stack, your calendar, and your WhatsApp: lead capture, triage, and automated follow-up, delivered fast.

**[Start a project → lookadev.com](https://lookadev.com)** · **Email: lucas@lookadev.com**

## License

MIT
