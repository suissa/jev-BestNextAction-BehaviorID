import type {
  BehaviorDecision,
  DecisionThresholds
} from "./types.js";

export const defaultThresholds: DecisionThresholds = {
  minimumProbability: 0.7,
  minimumConfidence: 0.6,
  minimumMargin: 0.15
};

type ApplyDecisionPolicyInput = {
  probabilities?: Record<string, number>;
  confidence?: number;
  thresholds?: Partial<DecisionThresholds>;
  fallbackBehaviorId: string;
};

function normalizedEntries(
  probabilities?: Record<string, number>
): Array<[string, number]> {
  if (!probabilities) return [];

  return Object.entries(probabilities)
    .filter(
      ([, value]) =>
        Number.isFinite(value) && value >= 0 && value <= 1
    )
    .sort(
      ([leftId, left], [rightId, right]) =>
        right - left || leftId.localeCompare(rightId)
    );
}

export function applyDecisionPolicy({
  probabilities,
  confidence = 0,
  thresholds,
  fallbackBehaviorId
}: ApplyDecisionPolicyInput): BehaviorDecision {
  const policy = { ...defaultThresholds, ...thresholds };
  const ranked = normalizedEntries(probabilities);

  if (ranked.length === 0) {
    return {
      selectedBehaviorId: fallbackBehaviorId,
      probability: 0,
      confidence,
      margin: 0,
      probabilities: probabilities ?? {},
      fallback: true,
      reason: "missing-probabilities"
    };
  }

  const [bestId, bestProbability] = ranked[0]!;
  const secondProbability = ranked[1]?.[1] ?? 0;
  const margin = bestProbability - secondProbability;

  const fallback = (
    reason: BehaviorDecision["reason"]
  ): BehaviorDecision => ({
    selectedBehaviorId: fallbackBehaviorId,
    probability: bestProbability,
    confidence,
    margin,
    probabilities: probabilities ?? {},
    fallback: true,
    reason
  });

  if (bestProbability < policy.minimumProbability) {
    return fallback("low-probability");
  }

  if (confidence < policy.minimumConfidence) {
    return fallback("low-confidence");
  }

  if (margin < policy.minimumMargin) {
    return fallback("low-margin");
  }

  return {
    selectedBehaviorId: bestId,
    probability: bestProbability,
    confidence,
    margin,
    probabilities: probabilities ?? {},
    fallback: false,
    reason: "selected"
  };
}
