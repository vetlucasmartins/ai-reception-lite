# Product Spec

## Summary

**Product:** AI Reception Lite
**Status:** MVP implemented with some workflow extensions planned
**Audience:** Small businesses that need faster lead response and better follow-up discipline
**Primary user:** Business owner, sales assistant, receptionist, or solo consultant

AI Reception Lite is an AI-powered front desk for local service businesses. It captures inbound messages, qualifies leads, summarizes commercial context, creates follow-up tasks, and helps teams prioritize the opportunities most likely to convert.

## Problem

Small businesses often receive leads through disconnected channels such as website forms, WhatsApp, Instagram, referrals, and phone calls. Messages are answered manually, follow-ups depend on memory, and lead quality is rarely captured in a structured way.

The commercial cost is direct: high-intent leads lose urgency when the team replies late or asks repetitive questions. The business needs a lightweight AI receptionist that turns unstructured messages into a prioritized sales workflow.

## Target Users

| User | Need | Example |
| --- | --- | --- |
| Owner-operator | Know which leads need immediate attention | Dental clinic owner checking hot inquiries |
| Receptionist | Understand what to answer and when to follow up | Gym front desk handling class inquiries |
| Sales assistant | Prioritize proposals and callbacks | Real estate assistant sorting viewing requests |
| Consultant | Avoid losing leads while busy | Independent advisor receiving website messages |

## Goals

- Capture inbound lead messages through a public form.
- Classify lead quality as `hot`, `warm`, or `cold`.
- Extract commercial fields from natural language.
- Summarize each conversation for fast human review.
- Suggest the next action.
- Create a follow-up task automatically.
- Provide a clean dashboard for lead review.
- Support optional automation through n8n.

## Non-Goals

- Replace CRM systems completely.
- Send production WhatsApp, SMS, or Instagram messages in the MVP.
- Provide multi-tenant billing or subscription management in the MVP.
- Guarantee AI classification accuracy without human review.
- Build a generic chatbot with no commercial workflow.

## MVP Scope

### Phase 1: Foundation

- Next.js app shell
- Supabase Auth
- Supabase schema and row-level security
- Business profile settings
- Public contact form

### Phase 2: Lead Intelligence

- AI classification inside the public lead workflow
- Structured extraction schema
- Conversation summary
- Suggested next action
- Follow-up task generation

### Phase 3: Dashboard

- Lead list with filters
- Lead detail page
- Conversation history
- Task status updates
- Manual override for classification and next action (planned after MVP)

### Phase 4: Automation

- Webhook trigger for hot leads
- n8n workflow export
- Email or Slack notification template
- Operational documentation

## User Stories

- As a business owner, I want incoming leads to be classified automatically so that I can focus on the most urgent opportunities first.
- As a receptionist, I want a concise summary of each conversation so that I can respond without reading the full message history.
- As a sales assistant, I want the system to suggest the next action so that follow-up is consistent.
- As a consultant, I want business tone and services to be configurable so that the AI response matches my offer.
- As an operator, I want hot leads to trigger a notification so that the team can respond quickly.

## Classification Rules

| Temperature | Signals |
| --- | --- |
| Hot | Clear buying intent, urgent timeline, specific service requested, budget or decision-maker signal |
| Warm | Interested but missing details, exploratory tone, asks about pricing or availability without urgency |
| Cold | Vague message, low intent, no timeline, general information request, spam-like content |

## Next Action Options

- `call`
- `send_proposal`
- `ask_more_information`
- `schedule_meeting`
- `send_pricing`
- `nurture`

## Success Metrics

| Metric | Target | Measurement |
| --- | --- | --- |
| Lead capture completeness | 95% of submissions stored with contact and message | Database records |
| Classification availability | 99% of valid submissions receive a classification or fallback | API logs |
| Time to human review | Under 60 seconds from submission to dashboard visibility | Created timestamps |
| Hot lead response time | Under 10 minutes in a real deployment | Task completion timestamps |
| Manual correction rate | Below 20% after prompt tuning | Classification override events |

## Portfolio Differentiator

The project demonstrates AI applied to a real commercial workflow: lead capture, qualification, summarization, prioritization, and follow-up. It is intentionally more practical than a generic chatbot because the output is structured for sales operations.

## Open Questions

- Should the first implementation include full multi-tenant accounts or one business per user?
- Should simulated AI responses be shown only internally or also sent to leads in demo mode?
- Which LLM providers should be supported after OpenAI?
- Should the public contact form be embeddable as a script widget or only exposed as a hosted page in the MVP?
- Should n8n receive events directly from the app or through Supabase webhooks?
