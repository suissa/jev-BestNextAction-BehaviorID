# Portable package

The reusable implementation lives under:

```
packages/jev-behaviorid
```

It can later be moved into another repository without carrying the MCP or NATS adapters.

Public exports include:

- `JevBehaviorIDPredictor`
- `buildJevCriteria`
- `DEFAULT_BEHAVIOR_IDS`
- BehaviorID input/output types
- entropy helpers

Example:

```ts
import {
  DEFAULT_BEHAVIOR_IDS,
  JevBehaviorIDPredictor
} from "@suissa/jev-behaviorid";

const predictor = new JevBehaviorIDPredictor({
  definitions: DEFAULT_BEHAVIOR_IDS,
  ontologyVersion: "crm-12@0.1.0",
  criteriaVersion: "behaviorid-criteria@0.1.0"
});

const result = await predictor.predict([
  { content: "I liked it, but it seems expensive", timestamp: "2026-09-23T10:00:00Z" },
  { content: "The competitor has something similar", timestamp: "2026-09-23T10:01:15Z" },
  { content: "What exactly is the difference?", timestamp: "2026-09-23T10:03:40Z" }
]);

console.log(result.predictions);
```

The package does not rank, threshold, filter, or select a Best Next Action. The raw Jev `choice` field is provider metadata only.
