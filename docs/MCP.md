# MCP Server

Run:

```bash
bun install
OPENROUTER_API_KEY=... bun run mcp
```

The server uses stdio transport and exposes the tool:

```
behaviorid_probabilities
```

Input:

```json
{
  "messages": [
    {"content":"I liked it, but it seems expensive","timestamp":"2026-09-23T10:00:00Z"},
    {"content":"The competitor has something similar","timestamp":"2026-09-23T10:01:15Z"},
    {"content":"What exactly is the difference?","timestamp":"2026-09-23T10:03:40Z"}
  ]
}
```

The tool returns every configured BehaviorID probability plus entropy, provider metadata, ontology version, and criteria version.

It intentionally does not expose a `next_best_action` tool and does not choose an action.
