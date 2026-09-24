# jev-BestNextAction-BehaviorID

Probability infrastructure for predicting the next cognitive-behavioral trajectory with Jev.

Despite the historical repository name, this project does **not** choose the Next Best Action. It calculates the probability of every configured next BehaviorID from exactly three timestamped messages.

Jev is accessed through the OpenRouter Decisions API.

## Repository layout

```
packages/
  jev-behaviorid/   # portable package; can be moved to another repository
  mcp-server/       # MCP stdio server
  nats-worker/      # NATS adapter

docs/
  ARCHITECTURE.md
  MCP.md
  NATS.md
  OPENROUTER.md
  PORTABLE-PACKAGE.md
```

## Core contract

Input:

```json
{
  "messages": [
    {"content":"...","timestamp":"..."},
    {"content":"...","timestamp":"..."},
    {"content":"...","timestamp":"..."}
  ]
}
```

The complete configured BehaviorID probability space is returned. No winner is promoted to a domain decision.

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

Tool:

```
behaviorid_probabilities
```

See [docs/MCP.md](docs/MCP.md).

## NATS

```bash
docker run --rm -p 4222:4222 nats:latest
bun run nats
```

See [docs/NATS.md](docs/NATS.md).

## Portable package

Everything needed to reuse the BehaviorID predictor is under:

```
packages/jev-behaviorid
```

See [docs/PORTABLE-PACKAGE.md](docs/PORTABLE-PACKAGE.md).

## Design principles

- exactly three timestamped messages;
- one Jev `choice` over all configured BehaviorIDs;
- Jev through OpenRouter;
- probabilities preserved for every candidate;
- provider `choice` is metadata, not domain authority;
- transition cost remains separate from probability;
- no Next Best Action selection in the core;
- MCP and NATS are thin adapters around the portable package;
- BehaviorID models the interaction trajectory, not the person.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [MCP server](docs/MCP.md)
- [NATS](docs/NATS.md)
- [OpenRouter](docs/OPENROUTER.md)
- [Portable package](docs/PORTABLE-PACKAGE.md)
