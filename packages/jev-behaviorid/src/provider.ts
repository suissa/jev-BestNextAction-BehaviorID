import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";
import { buildJevCriteria } from "./criteria.js";
import { entropy, normalizedEntropy } from "./math.js";
import type {
  BehaviorIDDefinition,
  BehaviorIDDistribution,
  ThreeMessageWindow
} from "./types.js";

const ChoiceAnswerSchema = z.object({
  type: z.literal("choice"),
  choice: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  probabilities: z.record(z.string(), z.number().min(0).max(1))
});

export type JevBehaviorIDOptions = {
  apiKey?: string;
  model?: string;
  definitions: BehaviorIDDefinition[];
  ontologyVersion?: string;
  criteriaVersion?: string;
};

export class JevBehaviorIDPredictor {
  private readonly openRouter: OpenRouter;
  private readonly model: string;

  constructor(private readonly options: JevBehaviorIDOptions) {
    this.model =
      options.model ??
      process.env.OPENROUTER_JEV_MODEL ??
      "typesafe/jev-1.13";

    this.openRouter = new OpenRouter({
      apiKey: options.apiKey ?? process.env.OPENROUTER_API_KEY
    });

    if (options.definitions.length < 1) {
      throw new Error("At least one BehaviorID definition is required.");
    }

    if (options.definitions.length > 255) {
      throw new Error("Jev choice supports at most 255 BehaviorID candidates.");
    }
  }

  async predict(window: ThreeMessageWindow): Promise<BehaviorIDDistribution> {
    const [m0, m1, m2] = window;
    const t0 = Date.parse(m0.timestamp);
    const t1 = Date.parse(m1.timestamp);
    const t2 = Date.parse(m2.timestamp);

    if ([t0, t1, t2].some(Number.isNaN)) {
      throw new Error("All message timestamps must be valid ISO timestamps.");
    }

    const deltaMs: [number, number] = [t1 - t0, t2 - t1];
    const criteria = buildJevCriteria(this.options.definitions);

    const decision = await this.openRouter.alpha.decisions.create({
      model: this.model,
      state: {
        messages: [
          { position: -2, content: m0.content, timestamp: m0.timestamp },
          {
            position: -1,
            content: m1.content,
            timestamp: m1.timestamp,
            latencyMs: deltaMs[0]
          },
          {
            position: 0,
            content: m2.content,
            timestamp: m2.timestamp,
            latencyMs: deltaMs[1]
          }
        ]
      },
      questions: {
        next_behavior_id: {
          type: "choice",
          instructions:
            "Estimate the probability distribution over the immediate next BehaviorID from exactly these three messages. A BehaviorID is a contextual trajectory [initial state]-[cognitive transition]-[final state]. Use semantic progression as the primary evidence. Timestamps and latency are weak contextual evidence only and must never override strong semantic evidence.",
          criteria
        }
      }
    } as any);

    const answer = ChoiceAnswerSchema.parse(
      (decision as any).answers.next_behavior_id
    );

    const expected = new Set(this.options.definitions.map((x) => x.id));
    const actual = new Set(Object.keys(answer.probabilities));

    if (
      expected.size !== actual.size ||
      [...expected].some((id) => !actual.has(id))
    ) {
      throw new Error(
        "Jev response does not contain exactly the configured BehaviorID probability space."
      );
    }

    const sum = Object.values(answer.probabilities).reduce(
      (a, b) => a + b,
      0
    );

    if (Math.abs(sum - 1) > 0.02) {
      throw new Error(`Invalid Jev probability distribution: sum=${sum}`);
    }

    const predictions = this.options.definitions.map((behaviorId) => ({
      behaviorId,
      probability: answer.probabilities[behaviorId.id],
      transitionCost: behaviorId.transitionCost
    }));

    const probabilities = predictions.map((x) => x.probability);

    return {
      window: { size: 3, deltaMs },
      predictions,
      distribution: {
        sum,
        entropy: entropy(probabilities),
        normalizedEntropy: normalizedEntropy(probabilities)
      },
      provider: {
        type: "jev-openrouter",
        model: this.model,
        confidence: answer.confidence,
        rawChoice: answer.choice
      },
      versions: {
        ontology: this.options.ontologyVersion ?? "custom",
        criteria: this.options.criteriaVersion ?? "custom"
      }
    };
  }
}
