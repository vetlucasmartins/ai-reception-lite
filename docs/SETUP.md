# Setup Guide

## Prerequisites

- Node.js 20+
- npm, pnpm, yarn, or bun
- Supabase account for persistent storage
- OpenAI API key or another supported LLM provider key for live AI classification
- Optional n8n instance for hot-lead notifications

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser-safe Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for privileged operations |
| `NEXT_PUBLIC_DEFAULT_BUSINESS_ID` | Optional default business for `/contact` |
| `AI_RECEPTION_STORAGE` | `supabase` for real storage or `memory` for local demo/tests |
| `DEMO_AUTH_ENABLED` | Enables the local demo login when `true` |
| `OPENAI_API_KEY` | Server-only model provider key |
| `AI_PROVIDER` | Default provider, initially `openai` |
| `AI_MODEL` | Default model |
| `N8N_HOT_LEAD_WEBHOOK_URL` | Optional outbound n8n webhook URL |
| `N8N_WEBHOOK_SECRET` | Shared secret for webhook verification |

The example env file defaults to local demo mode. For that zero-credential
setup, only these values are required:

```bash
AI_RECEPTION_STORAGE=memory
DEMO_AUTH_ENABLED=true
```

For Supabase mode, set `AI_RECEPTION_STORAGE=supabase` and provide
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY`; also set `DEMO_AUTH_ENABLED=false`. Keep
`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and webhook secrets only in
server-side environment variables.

Demo auth and memory storage are disabled automatically when
`NODE_ENV=production`, even if `DEMO_AUTH_ENABLED=true` or
`AI_RECEPTION_STORAGE=memory` are present.

## Supabase Setup

1. Create a Supabase project.
2. Enable email authentication in Supabase Auth.
3. Open the SQL editor.
4. Run [supabase/schema.sql](../supabase/schema.sql).
5. Create a first user through the app or Supabase dashboard.
6. Insert or create a business profile for that user.

## Local Development Flow

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

### Local Demo Without Supabase

For a zero-credential local demo, set:

```bash
AI_RECEPTION_STORAGE=memory
DEMO_AUTH_ENABLED=true
```

Open:

```text
http://localhost:3000/contact
```

Use this dashboard login:

```text
demo@aireception.local / demo-password
```

This mode is for local development and automated tests. Production deployments
should use `AI_RECEPTION_STORAGE=supabase` and real Supabase credentials.

## Recommended Implementation Sequence

1. Scaffold Next.js with TypeScript and Tailwind.
2. Add Supabase client helpers for browser and server contexts.
3. Implement authentication screens.
4. Implement business setup.
5. Implement public lead form.
6. Persist raw leads and conversation messages.
7. Add AI classification service.
8. Add dashboard and lead detail pages.
9. Add task updates.
10. Add optional n8n webhook sender.
11. Add tests for validation, classification fallback, and dashboard access.

## Testing Expectations

At minimum:

- Unit tests for validation and classification fallback
- Integration tests for lead creation and RLS-safe queries
- E2E tests for public lead submission and dashboard review

Validation commands:

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm audit --audit-level=moderate
```

Known MVP limitations:

- Public lead rate limiting is in-memory and per server process. Use a durable
  store such as Redis or a platform rate limiter before high-traffic production
  use.
- The memory store is process-local and resets when the dev server restarts.
- The OpenAI provider runs synchronously during lead submission in the MVP; the
  fallback path keeps lead creation available if the provider fails.
- The bundled rate limiter trusts the deployment proxy's client IP headers. Put
  a durable edge/platform limiter in front of the public endpoint for production
  traffic.

## Production Checklist

- RLS enabled on all business-owned tables
- Service-role key never exposed to client code
- Public lead endpoint rate-limited
- Authenticated API routes return JSON `401` responses rather than redirecting
  unauthenticated API clients
- Error monitoring configured
- AI failures handled without losing the lead
- n8n webhook secret configured
- Demo data contains no real personal data
- README and setup docs updated after implementation changes
