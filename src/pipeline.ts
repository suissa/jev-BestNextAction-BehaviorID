import type {
  Experimental_EvaluationModel as EvaluationModel
} from "ai";

import { buildBehaviorPrompt } from "./build-prompt.js";
import { generateResponse } from "./generate-response.js";
import { selectBehaviorWithJev } from "./select-behavior.js";
import type {
  ConversationState,
  DecisionThresholds
} from "./types.js";

type GenerationModel = Parameters<typeof generateResponse>[1] extends infer T
  ? T extends { model?: infer M }
    ? M
    : never
  : never;

export async function generateBestNextResponse(
  state: ConversationState,
  options: {
    jevModel?: EvaluationModel;
    llmModel?: GenerationModel;
    thresholds?: Partial<DecisionThresholds>;
  } = {}
) {
  const decision = await selectBehaviorWithJev(state, {
    ...(options.jevModel ? { model: options.jevModel } : {}),
    ...(options.thresholds ? { thresholds: options.thresholds } : {})
  });

  const prompt = buildBehaviorPrompt(state, decision);
  const response = await generateResponse(prompt, {
    ...(options.llmModel ? { model: options.llmModel } : {})
  });

  return {
    decision,
    prompt,
    response
  };
}
