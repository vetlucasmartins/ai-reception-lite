# AI Reception Lite

AI Reception Lite is an open-source AI front-desk for small businesses. It captures, qualifies, and summarizes incoming leads, helping teams respond faster and prioritize high-intent opportunities.

The project is designed for local service businesses such as clinics, real estate agencies, consulting firms, gyms, salons, schools, and independent service providers that receive leads through websites, WhatsApp, Instagram, and other fragmented channels.

## Why This Exists

Small businesses lose revenue when inbound messages are answered too late, follow-ups are forgotten, or lead details stay scattered across chats and spreadsheets. AI Reception Lite turns each incoming message into structured commercial context:

- Lead temperature: `hot`, `warm`, or `cold`
- Intent, urgency, budget, requested service, and funnel stage
- Conversation summary
- Suggested next action
- Follow-up task for the team
- Simulated AI response for the lead

## Core Features

- Supabase Auth for user accounts
- Public contact form that simulates an embeddable website widget
- Dashboard with searchable lead list
- AI-powered lead classification
- Automatic conversation summary
- Suggested commercial next action
- Business configuration page for services, tone of voice, and opening hours
- Conversation history per lead
- Follow-up task creation
- Optional n8n workflow export for hot-lead notifications by email or Slack

## Recommended Stack

- **App:** Next.js, TypeScript, Tailwind CSS
- **Database and auth:** Supabase
- **AI:** OpenAI by default, with a provider abstraction for other LLMs
- **Automation:** n8n optional workflows
- **Deployment:** Vercel for the web app, Supabase hosted project for data

## Documentation

- [Product Spec](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data Model](docs/DATA_MODEL.md)
- [API Contracts](docs/API.md)
- [AI Pipeline](docs/AI_PIPELINE.md)
- [Setup Guide](docs/SETUP.md)
- [n8n Workflow](docs/N8N_WORKFLOW.md)

## Repository Layout

```text
.
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── AI_PIPELINE.md
│   ├── DATA_MODEL.md
│   ├── N8N_WORKFLOW.md
│   ├── PRODUCT_SPEC.md
│   └── SETUP.md
├── n8n/
│   └── hot-lead-notification.json
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── supabase/
│   └── schema.sql
├── tests/
│   └── e2e/
├── .env.example
├── package.json
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── SECURITY.md
```

## MVP User Journey

1. A lead submits a message through the public contact form.
2. The app stores the raw message and lead contact details.
3. The AI classifier extracts intent, urgency, budget, requested service, and funnel stage.
4. The system assigns a temperature: `hot`, `warm`, or `cold`.
5. The system creates a follow-up task based on the suggested next action.
6. The dashboard shows the lead, summary, classification, and next step.
7. If the lead is hot, the optional n8n workflow notifies the team.

## Local Development

This repository includes a functional MVP. For a local demo without Supabase
credentials:

```bash
npm install
cp .env.example .env.local
```

Keep or set these demo values in `.env.local`:

```bash
AI_RECEPTION_STORAGE=memory
DEMO_AUTH_ENABLED=true
```

Then start the app:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000/contact
```

Demo login:

```text
demo@aireception.local / demo-password
```

For a Supabase-backed setup, fill the Supabase values in `.env.local`, keep
`AI_RECEPTION_STORAGE=supabase`, set `DEMO_AUTH_ENABLED=false`, and run the same
dev command. `OPENAI_API_KEY` is optional; without it the app uses a
deterministic local classifier.

See [Setup Guide](docs/SETUP.md) for required environment variables and Supabase setup.

## Useful Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm audit --audit-level=moderate
```

`npm run test:e2e` starts the app in memory/demo mode through Playwright.

## Commercial Expansion

This project can be used as a portfolio-grade open-source product and expanded into a paid installation service for small businesses:

- Custom setup: £500-£2,000
- Monthly maintenance: hosting, prompt tuning, workflow automation, reporting, and support

## License

MIT. See [LICENSE](LICENSE).
