# Jev Best Next Action — BehaviorID

Reference implementation for a bounded conversational decision pipeline:

```text
conversation state
      ↓
Jev Choice over allowed BehaviorIDs
      ↓
probability + confidence + top-1/top-2 margin
      ↓
canonical BehaviorID or safe abstention
      ↓
Behavior-specific Atomic Skill prompt
      ↓
LLM generates only the user-facing response
```

Jev does not write the response. It chooses the most probable canonical behavior from a closed set. Application policy validates that decision. Only then is the selected BehaviorID converted into a specific prompt for a text-generating LLM.

## Why not use only the largest probability?

The largest number can still be a bad decision. For example, `0.38` is the maximum of `[0.38, 0.34, 0.28]`, but it is too ambiguous for autonomous execution.

This implementation accepts the top BehaviorID only when all three gates pass:

- selected probability is at least `0.70`;
- Jev Choice confidence is at least `0.60`;
- the margin between the first and second candidates is at least `0.15`.

Otherwise it abstains to `Support.EscalateToHuman`. Thresholds are starting points and must be calibrated on labeled conversations.

## Behavior catalog

Each BehaviorID has an Atomic Skill-like definition:

- semantic description supplied to Jev;
- objective supplied to the response LLM;
- required invariants;
- forbidden behavior;
- response-format instructions.

The current catalog contains:

- `Communication.AcknowledgeFrustration`
- `Communication.ClarifyInformation`
- `Communication.ExplainOutcome`
- `Communication.OfferAlternatives`
- `Security.RequestConfirmation`
- `Support.EscalateToHuman` — deterministic fallback

The caller may restrict `allowedBehaviorIds` according to the current Intent and flow stage. Unknown IDs are discarded; Jev never invents a BehaviorID.

## Jev request

`src/select-behavior.ts` sends the conversation state and a single typed `choice` question:

```ts
const result = await evaluate({
  model: "typesafe-ai/jev",
  state,
  questions: {
    nextBehaviorId: {
      type: "choice",
      instructions:
        "Choose the canonical BehaviorID for the assistant's next message.",
      criteria: {
        "Communication.AcknowledgeFrustration":
          "Recognize frustration and restore cooperation.",
        "Communication.ClarifyInformation":
          "Ask for the one indispensable missing fact.",
        "Communication.ExplainOutcome":
          "Explain a verified result and its evidence.",
        "Security.RequestConfirmation":
          "Request confirmation before a high-impact action."
      }
    }
  },
  providerOptions: {
    gateway: { zeroDataRetention: true }
  }
});
```

Jev returns a probability distribution. The application recomputes the `argmax` instead of trusting a free-form value:

```ts
{
  "Communication.AcknowledgeFrustration": 0.84,
  "Communication.ClarifyInformation": 0.08,
  "Communication.ExplainOutcome": 0.05,
  "Security.RequestConfirmation": 0.03
}
```

The policy selects `Communication.AcknowledgeFrustration` only if its probability, Jev confidence, and margin pass their gates.

## Prompt sent to the LLM

The selected BehaviorID is resolved locally. The LLM receives its objective and invariants:

```text
You are the response-realization layer of a human-intent-bound system.
The BehaviorID has already been selected. Do not choose another behavior.

Selected BehaviorID: Communication.AcknowledgeFrustration

Objective:
Show that the problem and its impact were understood, then state one concrete next step.

Required:
- Acknowledge the inconvenience.
- Use facts already present in the conversation.
- State the next concrete action.

Forbidden:
- Do not blame anyone.
- Do not promise an unverified outcome.
- Do not ask the person to repeat information already supplied.

Return only the final user-facing response.
```

The conversation state is appended as JSON data. The prompt explicitly says that values inside it are data, not system instructions.

## Run

Requires Node.js 22 or newer.

```bash
cp .env.example .env
npm install
npm test
npm run build
npm run demo
```

Configure AI SDK Gateway authentication in `.env` or use Vercel OIDC:

```env
AI_GATEWAY_API_KEY=...
JEV_MODEL=typesafe-ai/jev
LLM_MODEL=openai/gpt-5-mini
```

No test calls Jev or an LLM. Tests cover deterministic selection, abstention and prompt binding.

## Use as a library

```ts
import { generateBestNextResponse } from "./src/pipeline.js";

const result = await generateBestNextResponse({
  currentMessage:
    "Já expliquei três vezes que esse valor está errado. Preciso resolver isso hoje.",
  intentId: "Financials.DisputeCharge",
  flowStage: "CollectingDisputeEvidence",
  locale: "pt-BR",
  facts: {
    informationAlreadyProvided: true,
    financialCorrectionConfirmed: false
  },
  affectSignals: {
    frustration: 0.97,
    urgency: 0.96
  },
  allowedBehaviorIds: [
    "Communication.AcknowledgeFrustration",
    "Communication.ClarifyInformation",
    "Communication.ExplainOutcome",
    "Security.RequestConfirmation"
  ]
});

console.log(result.decision);
console.log(result.response);
```

## Architectural invariants

1. Jev receives only BehaviorIDs allowed by the current Intent/flow.
2. The highest probability is recomputed from the returned distribution.
3. Low probability, confidence or margin causes abstention.
4. User content cannot provide or register a BehaviorID.
5. The LLM realizes the selected behavior; it does not select it again.
6. The LLM cannot authorize financial, legal, destructive or irreversible effects.
7. Decision metadata can be emitted as `Communication.ResolveNextBehavior.Ok` for audit and replay.
8. High-impact execution remains behind deterministic policy and explicit human confirmation.
