# Product Spec

**Product:** AI Reception Lite
**Status:** Portfolio mockup
**Audience:** Small businesses that need a clearer lead follow-up workflow
**Primary user:** Business owner, receptionist, consultant, or sales assistant

## Problem

Small businesses often receive website enquiries but do not respond quickly or
track follow-up consistently. A lightweight receptionist workflow can make the
next action obvious.

## Goal

Show the end-to-end product idea in a public GitHub project without requiring
cloud credentials or paid services.

## MVP Scope

- Website lead capture form
- Local SQLite demo persistence
- Mock AI lead classification
- Dashboard with lead cards, temperatures, and follow-up tasks
- Lead detail page with conversation and classification history
- Demo login

## Out Of Scope

- Real authentication
- Multi-tenant production authorization
- Live LLM provider calls
- External workflow automation
- Durable cloud database setup

## Success Criteria

- A reviewer can clone the repo and run the app locally.
- The dashboard has useful demo data immediately.
- Submitting the public form creates a new lead.
- Tests verify the public-to-dashboard workflow.
