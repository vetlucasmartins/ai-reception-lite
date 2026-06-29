# API Contracts

## Conventions

All API responses should use a consistent envelope:

```ts
type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
```

Do not return stack traces, prompts, provider keys, SQL details, or raw vendor errors to clients.

## Public Endpoints

### `POST /api/public/leads`

Creates a lead from the public contact form and starts AI classification.

#### Request

```json
{
  "businessId": "5c2f2f1e-8f3e-4c37-b8a9-4f51d01e1e17",
  "name": "Maria Silva",
  "email": "maria@example.com",
  "phone": "+44 7700 900123",
  "requestedService": "Dental implant consultation",
  "message": "I need an appointment this week and would like to understand the price range.",
  "source": "website"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "leadId": "7b2aa978-52de-44c4-9870-833d29c38dc7",
    "status": "received",
    "simulatedResponse": "Thanks, Maria. We received your request and our team will follow up shortly with availability and pricing guidance."
  }
}
```

#### Validation

- `businessId` must be a valid UUID.
- `name` is required.
- At least one of `email` or `phone` is required.
- `message` is required and should have a maximum length.
- `source` is fixed to `website` for the public endpoint. Other channels should
  use dedicated server-side ingestion paths in future integrations.
- Apply rate limiting and spam protection.

## Authenticated Endpoints

The MVP implements authenticated read endpoints for leads. The dashboard also
uses server-side repository reads directly, which keeps browser code away from
service-role credentials.

Unauthenticated API clients receive the standard error envelope with
`UNAUTHORIZED` and HTTP `401`.

### `GET /api/leads`

Returns leads for the authenticated user's active business.

#### Query Parameters

| Name | Type | Notes |
| --- | --- | --- |
| `temperature` | string | `hot`, `warm`, `cold`, `unclassified` |
| `status` | string | `new`, `open`, `won`, `lost`, `archived` |
| `q` | string | Search by name, email, phone, or summary |
| `page` | number | Planned after MVP |
| `pageSize` | number | Planned after MVP |

#### Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "7b2aa978-52de-44c4-9870-833d29c38dc7",
        "name": "Maria Silva",
        "temperature": "hot",
        "requestedService": "Dental implant consultation",
        "summary": "Maria wants an appointment this week and asked for pricing guidance.",
        "suggestedNextAction": "call",
        "createdAt": "2026-06-29T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1
    }
  }
}
```

### `GET /api/leads/:id`

Returns a lead with conversations, classifications, and follow-up tasks.

### `PATCH /api/leads/:id`

Updates human-owned fields such as `status`, `temperature`, or `funnelStage`. AI history should remain immutable.

Planned after the MVP. The current UI keeps AI history read-only and exposes
task completion.

### `POST /api/leads/:id/classify`

Re-runs classification for a lead. This is useful after prompt tuning or when a user adds manual notes.

Planned after the MVP.

#### Response

```json
{
  "success": true,
  "data": {
    "classificationId": "54b37d7a-c9da-4719-8bd1-22a6f0373776",
    "temperature": "hot",
    "suggestedNextAction": "call",
    "confidence": 0.87
  }
}
```

### `PATCH /api/tasks/:id`

Updates task status.

The MVP uses a server action from the lead detail page for task completion
instead of exposing this as a public route handler.

#### Request

```json
{
  "status": "completed"
}
```

## Outbound Webhook

The MVP does not expose an inbound `/api/webhooks/hot-lead` route. When a lead is
classified as hot, the server can send an outbound request to the configured
`N8N_HOT_LEAD_WEBHOOK_URL`.

#### Payload Sent to n8n

```json
{
  "event": "lead.hot",
  "lead": {
    "id": "7b2aa978-52de-44c4-9870-833d29c38dc7",
    "name": "Maria Silva",
    "email": "maria@example.com",
    "phone": "+44 7700 900123",
    "requestedService": "Dental implant consultation",
    "summary": "Maria wants an appointment this week and asked for pricing guidance.",
    "suggestedNextAction": "call"
  },
  "business": {
    "id": "5c2f2f1e-8f3e-4c37-b8a9-4f51d01e1e17",
    "name": "Demo Clinic"
  },
  "createdAt": "2026-06-29T12:00:00.000Z"
}
```

## Error Codes

| Code | Meaning |
| --- | --- |
| `VALIDATION_ERROR` | Request body or query string failed validation |
| `UNAUTHORIZED` | User is not authenticated |
| `FORBIDDEN` | User does not have access to the resource |
| `NOT_FOUND` | Resource does not exist in the user's business scope |
| `AI_CLASSIFICATION_FAILED` | AI provider failed or returned invalid output |
| `RATE_LIMITED` | Public endpoint received too many requests |
| `INTERNAL_ERROR` | Unexpected server error |
