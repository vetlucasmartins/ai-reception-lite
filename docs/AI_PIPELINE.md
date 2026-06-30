# AI Pipeline

The portfolio build uses a local heuristic classifier instead of a live model
provider. This keeps the repository safe to publish and simple to run.

## Pipeline

1. Public lead input is validated with Zod.
2. The lead and inbound conversation are saved to SQLite.
3. `FallbackLeadClassifier` scores the message with simple intent, urgency, and
   budget signals.
4. The result is parsed through `leadClassificationSchema`.
5. A follow-up task and simulated response draft are saved.

## Classification Signals

| Signal | Example words | Effect |
| --- | --- | --- |
| Urgency | `today`, `urgent`, `asap`, `emergency` | raises urgency |
| Buying intent | `book`, `quote`, `price`, `appointment` | raises temperature |
| Budget | `budget`, `cost`, `price`, `payment` | suggests pricing follow-up |
| Vague research | `information`, `curious`, `maybe` | can lower temperature |

## Output Contract

The classifier must return:

- `temperature`
- `confidence`
- `intent`
- `urgency`
- `budgetSignal`
- `requestedService`
- `funnelStage`
- `summary`
- `suggestedNextAction`
- `responseDraft`

Every output is schema-validated before persistence. Invalid output falls back
to a safe warm lead response.

## Why No Live LLM?

For a public portfolio project, a mock classifier is easier to review and avoids
API keys, billing, rate limits, and provider-specific setup. The repository
contract keeps the workflow clear enough to replace the classifier later.
