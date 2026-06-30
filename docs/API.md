# API

The API surface is intentionally small and demo-oriented.

## Response Envelope

Success:

```json
{
  "success": true,
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check the contact form fields."
  }
}
```

## `POST /api/public/leads`

Creates a public website lead in the local SQLite demo store.

Request:

```json
{
  "businessId": "00000000-0000-4000-8000-000000000001",
  "name": "Maya Patel",
  "email": "maya@example.com",
  "phone": "+44 7000 000101",
  "requestedService": "Dental implants",
  "message": "I need an appointment this week and want pricing.",
  "source": "website"
}
```

Validation:

- `businessId` must be a UUID.
- `name` must be 2-120 characters.
- either `email` or `phone` is required.
- `message` must be 5-2000 characters.
- public `source` is fixed to `website`.

Response:

```json
{
  "success": true,
  "data": {
    "leadId": "generated-uuid",
    "status": "received",
    "simulatedResponse": "Thanks, Maya..."
  }
}
```

## `GET /api/leads`

Returns dashboard lead cards for the demo user. Requires the demo auth cookie.

Optional query params:

- `temperature=hot|warm|cold|unclassified`
- `status=new|open|won|lost|archived`
- `q=search text`

## `GET /api/leads/:id`

Returns lead detail for the demo user. The `id` path parameter must be a UUID.

## Error Handling

Errors are intentionally generic. The API does not expose stack traces, SQL
details, prompts, or provider errors.
