# Architecture

This repository is split into three packages:

- `packages/jev-behaviorid`: portable domain package;
- `packages/mcp-server`: MCP stdio adapter;
- `packages/nats-worker`: NATS adapter.

Core invariant:

```
3 timestamped messages
        |
        v
Jev Choice via OpenRouter Decisions API
        |
        v
probability for every configured BehaviorID
        |
        v
STOP
```

There is deliberately no Next Best Action selector in this module.

## BehaviorID

A BehaviorID is represented as:

```
[INITIAL] -- [COG_TRANSITION] --> [FINAL]
```

It describes a contextual conversational trajectory, not a personality trait or diagnosis.

## Information boundary

The predictor uses exactly three messages and their timestamps. It does not fetch CRM state, long-term memory, demographics, purchase history, or previous action-selection outcomes.

Latency is derived locally from timestamps and passed to Jev as weak contextual evidence.

## OpenRouter

Jev is accessed through OpenRouter's Decisions API with `@openrouter/sdk`. The default model is `typesafe/jev-1.13`, configurable with `OPENROUTER_JEV_MODEL`.

Each BehaviorID is represented as one criterion in one Jev `choice` question. The raw winner returned in `choice` is preserved only as provider metadata. Domain consumers should use the full `probabilities` distribution.

## NATS

Default subjects:

- input: `behaviorid.predict`
- output: `behaviorid.predicted`

If a NATS message carries a reply subject, the worker responds directly. Otherwise it publishes the result to the configured output subject.

The portable package has no dependency on MCP or NATS.
