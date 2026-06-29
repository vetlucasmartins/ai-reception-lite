# AI Pipeline

## Purpose

The AI layer converts unstructured inbound messages into commercial decision support. It should not be treated as the source of truth. It is a classification assistant whose output is validated, stored, and reviewable by a human.

## Input Context

The classifier receives:

- Business name
- Business services
- Tone of voice
- Opening hours
- Lead contact fields
- Latest inbound message
- Previous conversation history, when available

## Structured Output

The model must return JSON matching this shape:

```json
{
  "temperature": "hot",
  "confidence": 0.87,
  "intent": "Book an appointment and understand pricing",
  "urgency": "high",
  "budgetSignal": "unknown",
  "requestedService": "Dental implant consultation",
  "funnelStage": "qualified",
  "summary": "Maria wants an appointment this week and asked for pricing guidance.",
  "suggestedNextAction": "call",
  "responseDraft": "Thanks, Maria. We received your request. Our team can help with availability this week and explain the expected price range before booking."
}
```

## Enums

### Temperature

- `hot`
- `warm`
- `cold`

### Urgency

- `high`
- `medium`
- `low`
- `unknown`

### Suggested Next Action

- `call`
- `send_proposal`
- `ask_more_information`
- `schedule_meeting`
- `send_pricing`
- `nurture`

### Funnel Stage

- `new`
- `qualified`
- `proposal`
- `negotiation`
- `won`
- `lost`

## Classification Heuristics

| Signal | Impact |
| --- | --- |
| Requests availability today or this week | Increases urgency |
| Mentions budget, decision maker, property, procedure, or start date | Increases commercial intent |
| Asks only broad informational questions | Usually warm or cold |
| Provides contact details and preferred time | Increases temperature |
| Message is vague, spam-like, or unrelated | Usually cold |

## Prompt Contract

The system prompt should be concise and role-specific:

```text
You are an AI front-desk assistant for a small service business.
Classify the lead for commercial follow-up.
Return only valid JSON matching the provided schema.
Do not invent details that are not present in the message or business profile.
If a field is unknown, use "unknown".
```

The user prompt should include structured business and lead context:

```text
Business:
- Name: Demo Clinic
- Services: Dental implants, whitening, emergency dental care
- Tone: Friendly and professional
- Opening hours: Mon-Fri 09:00-18:00

Lead:
- Name: Maria Silva
- Email: maria@example.com
- Phone: +44 7700 900123
- Source: website
- Requested service: Dental implant consultation

Message:
"I need an appointment this week and would like to understand the price range."
```

## Validation and Fallback

The app must validate AI output before saving it.

Fallback behavior:

- If OpenAI fails or returns invalid JSON, classify as `warm`.
- If required fields are missing, fill safe defaults.
- If confidence is missing, set `confidence` to `0`.
- If next action is invalid, use `ask_more_information`.
- Never block lead creation because AI failed.
- Model output is parsed as JSON and validated with a Zod schema before it is
  persisted or shown in the UI.
- Provider requests use a short timeout so public submissions do not hang
  indefinitely on an upstream model call.

The implementation has two fallback paths:

- Development/test fallback: deterministic heuristics when no provider key is
  configured.
- Provider failure fallback: safer `warm` / `ask_more_information` output with
  confidence `0`.

## Provider Abstraction

Recommended interface:

```ts
export type LeadClassifierInput = {
  business: {
    name: string;
    services: string[];
    toneOfVoice: string;
    openingHours: unknown;
  };
  lead: {
    name: string;
    email?: string;
    phone?: string;
    source: string;
    requestedService?: string;
    message: string;
  };
};

export type LeadClassifier = {
  classify(input: LeadClassifierInput): Promise<LeadClassification>;
};
```

This keeps the application independent from one model provider.

## Privacy

- Send the minimum necessary context to the model.
- Do not include unrelated leads in the prompt.
- Avoid logging full prompts in production.
- Treat conversation content as personal data.
- Make deletion possible in production deployments.

## Evaluation Set

Maintain a small fixture set of lead messages:

- Hot lead with urgent timeline
- Warm lead asking about services
- Cold lead with vague inquiry
- Spam-like message
- Lead with budget
- Lead with missing contact field
- Multi-message conversation

Use this set to test prompt changes and provider migrations.
