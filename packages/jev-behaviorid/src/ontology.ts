import type { BehaviorIDDefinition } from "./types.js";

export const DEFAULT_BEHAVIOR_IDS: BehaviorIDDefinition[] = [
  {
    id: "HES.CONFIRMATION.ACE",
    initial: "HES",
    transition: "CONFIRMATION",
    final: "ACE",
    description:
      "The interaction moves from hesitation toward acceptance because uncertainty is resolved through confirmation, reassurance, clarification, or verification.",
    positiveEvidence: [
      "a doubt is followed by agreement",
      "the user asks for reassurance and then shows willingness to proceed",
      "uncertainty is visibly reduced"
    ],
    negativeEvidence: [
      "generic positivity without previous hesitation",
      "comparison remains unresolved",
      "explicit resistance persists"
    ],
    temporalHints: [
      "response speed is weak supporting evidence only and must not dominate semantics"
    ],
    transitionCost: 0.25
  },
  {
    id: "ENG.DELIBERATION.COM",
    initial: "ENG",
    transition: "DELIBERATION",
    final: "COM",
    description:
      "The interaction moves from engagement into comparison through deliberate evaluation of alternatives, trade-offs, price, features, or competing options.",
    positiveEvidence: [
      "competitor reference",
      "explicit comparison of trade-offs",
      "movement from interest to evaluation"
    ],
    negativeEvidence: [
      "simple curiosity without comparison",
      "clear acceptance with no active evaluation"
    ],
    transitionCost: 0.20
  },
  {
    id: "COM.REACTANCE.RES",
    initial: "COM",
    transition: "REACTANCE",
    final: "RES",
    description:
      "The interaction moves from comparison into resistance because evaluation develops into objection, pressure sensitivity, defensiveness, rejection, or reluctance to continue.",
    positiveEvidence: [
      "comparison turns into objection",
      "the user pushes back against influence or pressure"
    ],
    negativeEvidence: [
      "comparison remains neutral",
      "the user is still exploring without resistance"
    ],
    transitionCost: 0.35
  },
  {
    id: "ENG.VALIDATION.VAL",
    initial: "ENG",
    transition: "VALIDATION",
    final: "VAL",
    description:
      "The interaction moves from engagement toward validation because the user seeks or provides evidence that confirms legitimacy, correctness, fit, value, or trustworthiness.",
    positiveEvidence: [
      "asks for proof, references, guarantees, examples, or confirmation",
      "actively verifies claims before proceeding"
    ],
    transitionCost: 0.18
  }
];

export const DEFAULT_ONTOLOGY_VERSION = "crm-12@0.1.0";
export const DEFAULT_CRITERIA_VERSION = "behaviorid-criteria@0.1.0";
