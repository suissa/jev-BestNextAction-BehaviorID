import "dotenv/config";

import { generateBestNextResponse } from "./pipeline.js";

const result = await generateBestNextResponse({
  currentMessage:
    "Já expliquei três vezes que esse valor está errado. Preciso resolver isso hoje.",
  recentMessages: [
    {
      role: "assistant",
      content: "Você poderia informar novamente o valor correto?"
    }
  ],
  intentId: "Financials.DisputeCharge",
  flowStage: "CollectingDisputeEvidence",
  locale: "pt-BR",
  facts: {
    informationAlreadyProvided: true,
    financialCorrectionConfirmed: false
  },
  affectSignals: {
    frustration: 0.97,
    urgency: 0.96,
    distrust: 0.68
  },
  allowedBehaviorIds: [
    "Communication.AcknowledgeFrustration",
    "Communication.ClarifyInformation",
    "Communication.ExplainOutcome",
    "Security.RequestConfirmation"
  ]
});

console.log(JSON.stringify(result, null, 2));
