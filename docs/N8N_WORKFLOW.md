# n8n Workflow

## Purpose

The optional n8n workflow notifies the team when AI Reception Lite receives a hot lead. The workflow is intentionally simple so small businesses can inspect and customize it.

Workflow file:

- [n8n/hot-lead-notification.json](../n8n/hot-lead-notification.json)

## Trigger

The app sends an outbound `POST` request to an n8n webhook when a lead is classified as `hot`.

Expected event:

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

## Workflow Steps

1. Webhook receives `lead.hot`.
2. Function node normalizes the payload.
3. IF node verifies the event type.
4. Email node sends a notification to the team.
5. Slack node optionally posts to a sales channel.

## Security

- Use a random `N8N_WEBHOOK_SECRET`.
- Send the secret in a header such as `x-ai-reception-secret`.
- Validate the secret in n8n before sending notifications.
- Do not include service-role keys or model provider keys in the workflow.

## Customization

Small businesses can change:

- Notification recipient
- Slack channel
- Message template
- Follow-up urgency rules
- Additional CRM or spreadsheet destinations

## Example Notification Copy

```text
Hot lead received: Maria Silva
Service: Dental implant consultation
Suggested action: call
Summary: Maria wants an appointment this week and asked for pricing guidance.
Contact: maria@example.com / +44 7700 900123
```
