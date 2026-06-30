# Data Model

The demo persists one JSON state document in a local SQLite table. This is a
mockup choice, not a production CRM schema.

## SQLite Table

```sql
create table if not exists demo_state (
  id text primary key,
  payload text not null,
  updated_at text not null default current_timestamp
);
```

## Payload Shape

```ts
type DemoState = {
  businesses: Business[];
  memberships: { businessId: string; userId: string }[];
  leads: Lead[];
  conversations: Conversation[];
  classifications: AiClassification[];
  tasks: FollowUpTask[];
};
```

## Core Entities

- `Business`: demo company profile, services, tone, and opening hours.
- `Lead`: public lead with status, temperature, funnel stage, and summary.
- `Conversation`: inbound website message.
- `AiClassification`: local heuristic classification and response draft.
- `FollowUpTask`: next action generated from the classification.

## Reset

Delete `.data/ai-reception-lite.sqlite` to recreate seeded demo data.
