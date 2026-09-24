import type { BehaviorIDDefinition } from "./types.js";

function list(label: string, values?: string[]): string {
  return values?.length ? `\n${label}:\n- ${values.join("\n- ")}` : "";
}

export function buildJevCriteria(
  definitions: BehaviorIDDefinition[]
): Record<string, string> {
  return Object.fromEntries(
    definitions.map((definition) => [
      definition.id,
      [
        definition.description,
        list("Positive evidence", definition.positiveEvidence),
        list("Negative evidence", definition.negativeEvidence),
        list("Ambiguities", definition.ambiguities),
        list("Temporal hints", definition.temporalHints)
      ].join("")
    ])
  );
}
