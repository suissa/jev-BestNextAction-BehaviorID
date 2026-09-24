import { OpenRouter } from "@openrouter/sdk";
import { z } from "zod";
import {
  DEFAULT_CUSTOMER_SERVICE_ACTIONS,
  type CustomerServiceActionDefinition
} from "./customer-service-actions.js";

export type CustomerServiceMessage = {
  content: string;
  timestamp: string;
};

export type CustomerServiceContextWindow = {
  /** Message preceding the system response. */
  customerPrevious: CustomerServiceMessage;
  /** The system response between customer turns. */
  systemPrevious: CustomerServiceMessage;
  /** The most recent message; this is the message to respond to. */
  customerLatest: CustomerServiceMessage;
};

export type CustomerServiceActionPrediction = {
  action: CustomerServiceActionDefinition;
  probability: number;
};

export type CustomerServiceActionDistribution = {
  contextOrder: ["customer_previous", "system_previous", "customer_latest"];
  deltaMs: [number, number];
  predictions: CustomerServiceActionPrediction[];
  distribution: { sum: number };
  provider: {
    type: "jev-openrouter";
    model: string;
    confidence?: number;
    rawChoice?: string;
  };
  version: string;
};

export type JevCustomerServiceActionMapperOptions = {
  apiKey?: string;
  model?: string;
  actions?: CustomerServiceActionDefinition[];
  version?: string;
};

const ChoiceAnswerSchema = z.object({
  type: z.literal("choice"),
  choice: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  probabilities: z.record(z.string(), z.number().min(0).max(1))
});

function criteria(actions: CustomerServiceActionDefinition[]): Record<string, string> {
  return Object.fromEntries(actions.map((item) => [
    item.id,
    [
      item.description,
      `Category: ${item.category}`,
      `Use when: ${item.useWhen.join("; ")}`,
      item.avoidWhen?.length ? `Avoid when: ${item.avoidWhen.join("; ")}` : "",
      item.requires?.length ? `Requires: ${item.requires.join("; ")}` : ""
    ].filter(Boolean).join("\n")
  ]));
}

/**
 * Scores every generic customer-service action. It never executes or promotes
 * an action; policy, authorization, and the caller retain decision authority.
 */
export class JevCustomerServiceActionMapper {
  private readonly openRouter: OpenRouter;
  private readonly model: string;
  private readonly actions: CustomerServiceActionDefinition[];

  constructor(private readonly options: JevCustomerServiceActionMapperOptions = {}) {
    this.model = options.model ?? process.env.OPENROUTER_JEV_MODEL ?? "typesafe/jev-1.13";
    this.actions = options.actions ?? DEFAULT_CUSTOMER_SERVICE_ACTIONS;
    this.openRouter = new OpenRouter({
      apiKey: options.apiKey ?? process.env.OPENROUTER_API_KEY
    });

    if (this.actions.length < 1 || this.actions.length > 255) {
      throw new Error("Customer-service action space must contain 1 to 255 actions.");
    }
  }

  async score(context: CustomerServiceContextWindow): Promise<CustomerServiceActionDistribution> {
    const ordered = [context.customerPrevious, context.systemPrevious, context.customerLatest] as const;
    const times = ordered.map((message) => Date.parse(message.timestamp));
    if (times.some(Number.isNaN)) {
      throw new Error("All message timestamps must be valid ISO timestamps.");
    }

    const answer = ChoiceAnswerSchema.parse((await this.openRouter.alpha.decisions.create({
      model: this.model,
      state: {
        messages: [
          { position: -2, role: "customer", content: ordered[0].content, timestamp: ordered[0].timestamp },
          { position: -1, role: "system", content: ordered[1].content, timestamp: ordered[1].timestamp, latencyMs: times[1] - times[0] },
          { position: 0, role: "customer", content: ordered[2].content, timestamp: ordered[2].timestamp, latencyMs: times[2] - times[1] }
        ]
      },
      questions: {
        next_customer_service_action: {
          type: "choice",
          instructions: "Estimate the probability of every immediate generic customer-service action for replying to the latest customer message. Use exactly this ordered window: customer previous, system previous, customer latest. Score intent, unresolved need, system commitment, risk, authorization, and context. Do not assume product domain. This is a decision-support distribution only: do not execute, choose, or bypass policy, consent, identity, or human escalation.",
          criteria: criteria(this.actions)
        }
      }
    } as any)).answers.next_customer_service_action);

    const expected = new Set(this.actions.map((item) => item.id));
    const actual = new Set(Object.keys(answer.probabilities));
    if (expected.size !== actual.size || [...expected].some((id) => !actual.has(id))) {
      throw new Error("Jev response does not contain exactly the configured customer-service action space.");
    }

    const sum = Object.values(answer.probabilities).reduce((total, probability) => total + probability, 0);
    if (Math.abs(sum - 1) > 0.02) {
      throw new Error(`Invalid Jev probability distribution: sum=${sum}`);
    }

    return {
      contextOrder: ["customer_previous", "system_previous", "customer_latest"],
      deltaMs: [times[1] - times[0], times[2] - times[1]],
      predictions: this.actions.map((action) => ({ action, probability: answer.probabilities[action.id] })),
      distribution: { sum },
      provider: { type: "jev-openrouter", model: this.model, confidence: answer.confidence, rawChoice: answer.choice },
      version: this.options.version ?? "customer-service-actions@0.1.0"
    };
  }
}
