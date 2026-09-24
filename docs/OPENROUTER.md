# Jev through OpenRouter

This project uses Jev through OpenRouter instead of a direct TypeSafe endpoint.

Configuration:

```bash
OPENROUTER_API_KEY=...
OPENROUTER_JEV_MODEL=typesafe/jev-1.13
```

The implementation uses `@openrouter/sdk` and the OpenRouter Decisions API.

Conceptually:

```ts
openRouter.alpha.decisions.create({
  model: "typesafe/jev-1.13",
  state,
  questions: {
    next_behavior_id: {
      type: "choice",
      instructions,
      criteria
    }
  }
});
```

One `choice` contains the complete configured BehaviorID candidate space so all returned probabilities belong to the same closed decision.

The provider's `choice` and `confidence` are preserved as metadata. They are not treated as a domain-level recommendation.
