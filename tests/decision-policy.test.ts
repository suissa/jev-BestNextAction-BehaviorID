import { describe, expect, it } from "vitest";

import { applyDecisionPolicy } from "../src/decision-policy.js";

const fallbackBehaviorId = "Support.EscalateToHuman";

describe("applyDecisionPolicy", () => {
  it("selects the BehaviorID with the highest probability", () => {
    const result = applyDecisionPolicy({
      probabilities: {
        "Communication.ClarifyInformation": 0.08,
        "Communication.AcknowledgeFrustration": 0.84,
        "Communication.ExplainOutcome": 0.08
      },
      confidence: 0.81,
      fallbackBehaviorId
    });

    expect(result.selectedBehaviorId).toBe(
      "Communication.AcknowledgeFrustration"
    );
    expect(result.fallback).toBe(false);
    expect(result.margin).toBeCloseTo(0.76);
  });

  it("abstains when the highest probability is below the floor", () => {
    const result = applyDecisionPolicy({
      probabilities: {
        "Communication.ClarifyInformation": 0.45,
        "Communication.ExplainOutcome": 0.4
      },
      confidence: 0.9,
      fallbackBehaviorId
    });

    expect(result.selectedBehaviorId).toBe(fallbackBehaviorId);
    expect(result.reason).toBe("low-probability");
  });

  it("abstains when Jev confidence is low", () => {
    const result = applyDecisionPolicy({
      probabilities: {
        "Communication.ClarifyInformation": 0.8,
        "Communication.ExplainOutcome": 0.2
      },
      confidence: 0.4,
      fallbackBehaviorId
    });

    expect(result.reason).toBe("low-confidence");
  });

  it("abstains when the first and second options are too close", () => {
    const result = applyDecisionPolicy({
      probabilities: {
        "Communication.ClarifyInformation": 0.76,
        "Communication.ExplainOutcome": 0.69
      },
      confidence: 0.9,
      fallbackBehaviorId
    });

    expect(result.reason).toBe("low-margin");
  });
});
