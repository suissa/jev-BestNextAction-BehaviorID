# MCP server

Run:

```bash
bun run mcp
```

The stdio server exposes two read-only decision-support tools.

## `behaviorid_probabilities`

Input:

```json
{
  "messages": [
    {"content":"...","timestamp":"2026-09-23T12:00:00Z"},
    {"content":"...","timestamp":"2026-09-23T12:03:00Z"},
    {"content":"...","timestamp":"2026-09-23T12:08:00Z"}
  ]
}
```

The response includes every configured BehaviorID probability. It does not choose a next best action.

## `customer_service_action_probabilities`

Input is explicitly ordered to preserve local conversational causality:

```json
{
  "customerPrevious": {"content":"...","timestamp":"2026-09-23T12:00:00Z"},
  "systemPrevious": {"content":"...","timestamp":"2026-09-23T12:03:00Z"},
  "customerLatest": {"content":"...","timestamp":"2026-09-23T12:08:00Z"}
}
```

It returns the probability for every generic action in the customer-service map. The result is advisory: no action is selected, executed, or authorized by the tool. See [Customer-service actions](CUSTOMER-SERVICE-ACTIONS.md).
