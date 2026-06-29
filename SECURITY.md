# Security Policy

## Supported Scope

This project is an open-source reference implementation. Security reports are welcome for:

- Authentication and authorization flaws
- Row-level security bypasses
- Secret exposure
- Unsafe webhook handling
- Prompt injection that changes persisted business decisions
- Input validation issues
- Cross-site scripting or unsafe HTML rendering

## Reporting

Do not open public issues for vulnerabilities that expose user data, secrets, or service credentials.

For now, report privately to the repository maintainer through the contact method listed on the project profile. A dedicated security email can be added when the repository is published.

## Security Principles

- Never expose Supabase service-role keys to the browser.
- Never hardcode LLM provider keys.
- Validate public lead submissions.
- Apply row-level security to authenticated business-owned reads and updates.
  Keep service-role usage server-only and limited to public ingestion or
  bootstrap workflows.
- Verify webhook secrets before processing automation events.
- Store only the data needed to operate the lead workflow.
- Avoid logging full prompts or sensitive conversation content in production.

## Operational Notes

- The bundled rate limiter is in-memory and intended for the MVP/demo. It trusts
  the deployment proxy's client IP headers. Use a distributed edge/platform
  limiter before running multiple instances or accepting meaningful public
  traffic.
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and webhook secrets must stay in
  server-side environment variables only. Do not put them in `NEXT_PUBLIC_*`
  variables or client-side code.
- Demo auth and memory storage are for local development only. Production
  runtime disables both and should use Supabase Auth with real users.

## Demo Data

Public demos must use fake leads and fake contact details. Do not seed production-like personal data in the repository.
