export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationState = {
  currentMessage: string;
  recentMessages?: ConversationMessage[];
  intentId?: string;
  flowStage?: string;
  locale?: string;
  facts?: Record<string, unknown>;
  affectSignals?: Record<string, number>;
  allowedBehaviorIds?: string[];
};

export type BehaviorDefinition = {
  description: string;
  objective: string;
  required: readonly string[];
  forbidden: readonly string[];
  responseInstructions: readonly string[];
};

export type DecisionThresholds = {
  minimumProbability: number;
  minimumConfidence: number;
  minimumMargin: number;
};

export type DecisionReason =
  | "selected"
  | "single-eligible-behavior"
  | "no-eligible-behaviors"
  | "missing-probabilities"
  | "low-probability"
  | "low-confidence"
  | "low-margin";

export type BehaviorDecision = {
  selectedBehaviorId: string;
  probability: number;
  confidence: number;
  margin: number;
  probabilities: Record<string, number>;
  fallback: boolean;
  reason: DecisionReason;
};

export type ResponsePrompt = {
  system: string;
  user: string;
};
