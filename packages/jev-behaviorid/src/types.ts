export type BehaviorState =
  | "CUR" | "ENG" | "HES" | "COM" | "RES" | "ACE"
  | "VAL" | "ABO" | "NEG" | "AAN" | "INP" | "DES";

export type MessagePoint = {
  content: string;
  timestamp: string;
};

export type ThreeMessageWindow = readonly [MessagePoint, MessagePoint, MessagePoint];

export type BehaviorIDDefinition = {
  id: string;
  initial: BehaviorState;
  transition: string;
  final: BehaviorState;
  description: string;
  positiveEvidence?: string[];
  negativeEvidence?: string[];
  ambiguities?: string[];
  temporalHints?: string[];
  transitionCost?: number;
};

export type BehaviorIDPrediction = {
  behaviorId: BehaviorIDDefinition;
  probability: number;
  transitionCost?: number;
};

export type BehaviorIDDistribution = {
  window: { size: 3; deltaMs: [number, number] };
  predictions: BehaviorIDPrediction[];
  distribution: { sum: number; entropy: number; normalizedEntropy: number };
  provider: {
    type: "jev-openrouter";
    model: string;
    confidence?: number;
    rawChoice?: string;
  };
  versions: { ontology: string; criteria: string };
};
