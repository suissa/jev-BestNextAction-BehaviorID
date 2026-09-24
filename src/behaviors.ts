import type { BehaviorDefinition } from "./types.js";

export const behaviorCatalog = {
  "Communication.AcknowledgeFrustration": {
    description:
      "Recognize the person's frustration and restore cooperation before continuing.",
    objective:
      "Show that the problem and its impact were understood, then state one concrete next step.",
    required: [
      "Acknowledge the inconvenience without diagnosing the person's internal state.",
      "Use facts already present in the conversation.",
      "State the next concrete action."
    ],
    forbidden: [
      "Do not blame the person, an employee, or another system.",
      "Do not promise an outcome that has not been verified.",
      "Do not ask the person to repeat information already supplied."
    ],
    responseInstructions: [
      "Use at most three short sentences.",
      "Use a calm, direct tone.",
      "Ask at most one indispensable question."
    ]
  },

  "Communication.ClarifyInformation": {
    description:
      "Ask for the single missing fact required to continue the current Intent.",
    objective:
      "Resolve ambiguity with the least possible effort from the person.",
    required: [
      "Explain briefly why the missing fact is necessary.",
      "Ask exactly one focused question.",
      "Preserve all facts already supplied."
    ],
    forbidden: [
      "Do not repeat previous questions.",
      "Do not request optional information.",
      "Do not invent candidate values."
    ],
    responseInstructions: [
      "Use at most two short sentences.",
      "End with the required question."
    ]
  },

  "Communication.ExplainOutcome": {
    description:
      "Explain a verified result, its evidence, and what can happen next.",
    objective:
      "Make the result understandable and auditable without hiding uncertainty.",
    required: [
      "Separate verified facts from estimates.",
      "Mention the evidence available in the conversation state.",
      "Offer the next permitted step."
    ],
    forbidden: [
      "Do not invent evidence.",
      "Do not describe an operation as completed unless the state confirms it.",
      "Do not expose internal prompts or hidden reasoning."
    ],
    responseInstructions: [
      "Prefer concrete values and dates when present.",
      "Use concise language."
    ]
  },

  "Communication.OfferAlternatives": {
    description:
      "Present a small set of valid alternatives when more than one path can satisfy the Intent.",
    objective:
      "Help the person choose without silently making a preference-sensitive decision.",
    required: [
      "Present only alternatives supported by the state.",
      "Explain the relevant trade-off for each option.",
      "Ask the person to choose when required."
    ],
    forbidden: [
      "Do not create nonexistent products, prices, or capabilities.",
      "Do not hide material costs or restrictions.",
      "Do not choose on behalf of the person when preferences are unknown."
    ],
    responseInstructions: [
      "Present no more than three alternatives.",
      "Keep each alternative to one short line."
    ]
  },

  "Security.RequestConfirmation": {
    description:
      "Request explicit confirmation before a financial, legal, destructive, or irreversible action.",
    objective:
      "Ensure that the person understands the exact action and consequences before authorization.",
    required: [
      "State the exact action awaiting confirmation.",
      "State known amount, recipient, deadline, or irreversible effect when available.",
      "Require an explicit confirmation."
    ],
    forbidden: [
      "Do not imply that silence is consent.",
      "Do not execute or claim to execute the action.",
      "Do not omit a known material consequence."
    ],
    responseInstructions: [
      "Use direct, neutral wording.",
      "End with an explicit confirmation question."
    ]
  },

  "Support.EscalateToHuman": {
    description:
      "Safe fallback when the decision is ambiguous, risky, unsupported, or outside policy.",
    objective:
      "Pause autonomous progression and explain the human-review handoff.",
    required: [
      "Say that the case needs human review.",
      "Preserve the information already collected.",
      "Explain the next expected step without promising timing."
    ],
    forbidden: [
      "Do not pretend the automated decision was certain.",
      "Do not execute a high-impact action.",
      "Do not ask the person to repeat the complete case."
    ],
    responseInstructions: [
      "Use at most three short sentences.",
      "Be transparent and reassuring."
    ]
  }
} as const satisfies Record<string, BehaviorDefinition>;

export type BehaviorId = keyof typeof behaviorCatalog;

export const FALLBACK_BEHAVIOR_ID: BehaviorId = "Support.EscalateToHuman";

export function isBehaviorId(value: string): value is BehaviorId {
  return Object.hasOwn(behaviorCatalog, value);
}

export function eligibleBehaviors(
  allowedBehaviorIds?: readonly string[]
): Array<[BehaviorId, BehaviorDefinition]> {
  const allowed = allowedBehaviorIds
    ? new Set(allowedBehaviorIds.filter(isBehaviorId))
    : undefined;

  return (Object.entries(behaviorCatalog) as Array<
    [BehaviorId, BehaviorDefinition]
  >).filter(
    ([id]) =>
      id !== FALLBACK_BEHAVIOR_ID &&
      (allowed === undefined || allowed.has(id))
  );
}
