# jev-BestNextAction-BehaviorID

Probability infrastructure for predicting the next cognitive-behavioral trajectory with Jev, plus a generic customer-service action map.

Despite the historical repository name, the core never chooses or executes a Next Best Action. It returns the complete probability distribution for the configured candidate space. Jev is accessed through the OpenRouter Decisions API.

## Repository layout

```
packages/
  jev-behaviorid/   # portable package; can be moved to another repository
  mcp-server/       # MCP stdio server
  nats-worker/      # NATS adapter

docs/
  ARCHITECTURE.md
  CUSTOMER-SERVICE-ACTIONS.md
  MCP.md
  NATS.md
  OPENROUTER.md
  PORTABLE-PACKAGE.md
```

## Core contracts

### Behavior trajectory

```json
{
  "messages": [
    {"content":"...","timestamp":"..."},
    {"content":"...","timestamp":"..."},
    {"content":"...","timestamp":"..."}
  ]
}
```

### Customer-service action map

The action mapper scores every generic action that may be suitable for the immediate reply. Its fixed causal window is:

```
customer previous → system previous → customer latest
```

```json
{
  "customerPrevious": {"content":"...","timestamp":"..."},
  "systemPrevious": {"content":"...","timestamp":"..."},
  "customerLatest": {"content":"...","timestamp":"..."}
}
```

It covers eight generic categories: understand, inform, resolve, recover, coordinate, commercial, safety, and close. It returns every probability; policy, identity, consent, and human escalation retain authority. See [the action map](docs/CUSTOMER-SERVICE-ACTIONS.md).

## Install

```bash
bun install
cp .env.example .env
```

Set:

```bash
OPENROUTER_API_KEY=...
OPENROUTER_JEV_MODEL=typesafe/jev-1.13
```

## MCP

```bash
bun run mcp
```

Tools:

- `behaviorid_probabilities`
- `customer_service_action_probabilities`

See [docs/MCP.md](docs/MCP.md).

## NATS

```bash
docker run --rm -p 4222:4222 nats:latest
bun run nats
```

Send `kind: "behaviorid"` for the trajectory distribution or `kind: "customer_service_actions"` with the named customer/system/customer context fields. See [docs/NATS.md](docs/NATS.md).

## Portable package

Everything needed to reuse the predictors is under:

```
packages/jev-behaviorid
```

See [docs/PORTABLE-PACKAGE.md](docs/PORTABLE-PACKAGE.md).

## Design principles

- exactly three timestamped messages per predictor;
- explicit causal roles for customer-service scoring;
- one Jev `choice` over every configured candidate;
- Jev through OpenRouter;
- probabilities preserved for every candidate;
- provider `choice` is metadata, not domain authority;
- transition cost remains separate from probability;
- no automatic Next Best Action selection or execution;
- MCP and NATS are thin adapters around the portable package;
- BehaviorID models the interaction trajectory, not the person.
