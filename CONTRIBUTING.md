# Contributing

Thanks for considering a contribution to AI Reception Lite.

## Project Standards

- Keep the product focused on small-business lead capture, qualification, and follow-up.
- Prefer small, readable changes over broad rewrites.
- Validate external input at API boundaries.
- Do not hardcode secrets, API keys, webhook URLs, or credentials.
- Keep AI behavior structured, testable, and reviewable.
- Update documentation when behavior, setup, or architecture changes.

## Development Flow

1. Create an issue or describe the change clearly.
2. Keep the pull request scoped.
3. Add or update tests for behavior changes.
4. Run linting, type checks, and tests before opening a PR.
5. Include a short test plan in the PR description.

## Documentation Changes

Documentation should be specific and operational. Prefer examples, contracts, and setup steps over abstract descriptions.

Update these files when relevant:

- `README.md` for public overview and quickstart changes
- `docs/ARCHITECTURE.md` for system design changes
- `docs/DATA_MODEL.md` and `supabase/schema.sql` for schema changes
- `docs/API.md` for API contract changes
- `docs/AI_PIPELINE.md` for prompt, provider, or classification changes
- `docs/N8N_WORKFLOW.md` and `n8n/` for automation changes

## Security

Report vulnerabilities privately. See [SECURITY.md](SECURITY.md).
