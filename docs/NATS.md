# NATS adapter

Run NATS:

```bash
docker run --rm -p 4222:4222 nats:latest
```

Start the worker:

```bash
bun run nats
```

Defaults:

- input subject: `behaviorid.predict`
- output subject: `behaviorid.predicted`
- NATS URL: `nats://127.0.0.1:4222`

Override with `NATS_SUBJECT_IN`, `NATS_SUBJECT_OUT`, and `NATS_URL`.

## Behavior trajectory request

```json
{
  "kind": "behaviorid",
  "correlationId": "optional-id",
  "messages": [
    {"content":"...","timestamp":"..."},
    {"content":"...","timestamp":"..."},
    {"content":"...","timestamp":"..."}
  ]
}
```

## Customer-service action map request

```json
{
  "kind": "customer_service_actions",
  "correlationId": "optional-id",
  "customerPrevious": {"content":"...","timestamp":"..."},
  "systemPrevious": {"content":"...","timestamp":"..."},
  "customerLatest": {"content":"...","timestamp":"..."}
}
```

Both requests return `{ correlationId, kind, ok, durationMs, result }` through the reply subject when present, otherwise on the output subject. Customer-service action results contain the full candidate distribution and never authorize or execute an action.
