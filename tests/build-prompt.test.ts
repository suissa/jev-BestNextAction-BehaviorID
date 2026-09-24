import { describe, expect, it } from "vitest";

import { buildBehaviorPrompt } from "../src/build-prompt.js";

describe("buildBehaviorPrompt", () => {
  it("binds the selected BehaviorID and its Atomic Skill to the LLM prompt", () => {
    const prompt = buildBehaviorPrompt(
      {
        currentMessage: "Já expliquei isso.",
        locale: "pt-BR"
      },
      {
        selectedBehaviorId: "Communication.AcknowledgeFrustration",
        probability: 0.9,
        confidence: 0.8,
        margin: 0.7,
        probabilities: {
          "Communication.AcknowledgeFrustration": 0.9
        },
        fallback: false,
        reason: "selected"
      }
    );

    expect(prompt.system).toContain(
      "Selected BehaviorID: Communication.AcknowledgeFrustration"
    );
    expect(prompt.system).toContain(
      "Do not ask the person to repeat information already supplied."
    );
    expect(prompt.user).toContain("Já expliquei isso.");
  });

  it("falls back to the human-review behavior for an unknown ID", () => {
    const prompt = buildBehaviorPrompt(
      { currentMessage: "teste" },
      {
        selectedBehaviorId: "Injected.UnknownBehavior",
        probability: 1,
        confidence: 1,
        margin: 1,
        probabilities: {},
        fallback: false,
        reason: "selected"
      }
    );

    expect(prompt.system).toContain(
      "Selected BehaviorID: Support.EscalateToHuman"
    );
  });
});
