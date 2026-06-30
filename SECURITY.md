# Security

AI Reception Lite is a portfolio mockup. It is designed to avoid secrets and
external services by default.

## Reporting

If you find a vulnerability, open a private report with enough detail to
reproduce the issue. Do not publish sensitive exploit details in a public issue.

## Current Security Posture

- No API keys are required.
- No service-role database keys are present.
- No webhook secrets are required.
- Public input is validated with Zod.
- API errors are generic.
- SQLite demo files are ignored by Git.
- Demo auth uses an httpOnly cookie but is not real authentication.

## Not Production Ready

Do not use this app as-is for real customer data. Before production use, replace:

- demo auth with a real identity provider.
- local SQLite JSON-state storage with a production database and authorization.
- in-memory rate limiting with durable platform rate limits.
- mock classification with a reviewed provider integration or job queue.

## Secret Hygiene

Keep `.env`, `.env.local`, `.data/`, logs, coverage, Playwright reports,
`node_modules`, and build output out of Git. The committed `.env.example`
contains only non-secret demo values.
