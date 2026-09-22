import {
  experimental_evaluate as evaluate,
  type Experimental_EvaluationModel as EvaluationModel
} from "ai";

import {
  eligibleBehaviors,
  FALLBACK_BEHAVIOR_ID
} from "./behaviors.js";
import { applyDecisionPolicy } from "./decision-policy.js";
import type {
  BehaviorDecision,
  ConversationState,
  DecisionThresholds
} from "./types.js";

export async function selectBehaviorWithJev(
  state: ConversationState,
  options: {
    model?: EvaluationModel;
    thresholds?: Partial<DecisionThresholds>;
  } = {}
): Promise<BehaviorDecision> {
  const candidates = eligibleBehaviors(state.allowedBehaviorIds);

  if (candidates.length === 0) {
    return {
      selectedBehaviorId: FALLBACK_BEHAVIOR_ID,
      probability: 0,
      confidence: 0,
      margin: 0,
      probabilities: {},
      fallback: true,
      reason: "no-eligible-behaviors"
    };
  }

  if (candidates.length === 1) {
    return {
      selectedBehaviorId: candidates[0]![0],
      probability: 1,
      confidence: 1,
      margin: 1,
      probabilities: { [candidates[0]![0]]: 1 },
      fallback: false,
      reason: "single-eligible-behavior"
    };
  }

  const criteria = Object.fromEntries(
    candidates.map(([id, definition]) => [id, definition.description])
  );

  const model =
    options.model ??
    ((process.env.JEV_MODEL ?? "typesafe-ai/jev") as EvaluationModel);

  const result = await evaluate({
    model,
    state,
    questions: {
      nextBehaviorId: {
        type: "choice",
        instructions: [
          "Choose the canonical BehaviorID for the assistant's next message.",
          "Use only the supplied candidates.",
          "Consider the current message, recent conversation, Intent, flow stage, verified facts and affect signals.",
          "Prefer clarification when indispensable information is missing.",
          "Prefer explicit confirmation before financial, legal, destructive or irreversible effects."
        ].join(" "),
        criteria
      }
    },
    providerOptions: {
      gateway: { zeroDataRetention: true }
    }
  });

  const answer = result.answers.nextBehaviorId;
  const confidenceByQuestion =
    result.providerMetadata?.typesafe?.confidence as
      | Record<string, number>
      | undefined;

  return applyDecisionPolicy({
    probabilities: answer.probabilities,
    confidence: confidenceByQuestion?.nextBehaviorId,
    thresholds: options.thresholds,
    fallbackBehaviorId: FALLBACK_BEHAVIOR_ID
  });
}
