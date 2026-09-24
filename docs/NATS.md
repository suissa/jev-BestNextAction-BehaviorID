# NATS

Start a local NATS server:

```bash
docker run --rm -p 4222:4222 nats:latest
```

Start the worker:

```bash
OPENROUTER_API_KEY=... NATS_URL=nats://127.0.0.1:4222 bun run nats
```

Default input subject:

```
behaviorid.predict
```

Default output subject:

```
behaviorid.predicted
```

Request payload:

```json
{
  "correlationId": "example-1",
  "messages": [
    {"content":"I liked it, but it seems expensive","timestamp":"2026-09-23T10:00:00Z"},
    {"content":"The competitor has something similar","timestamp":"2026-09-23T10:01:15Z"},
    {"content":"What exactly is the difference?","timestamp":"2026-09-23T10:03:40Z"}
  ]
}
```

If request/reply is used, the response is sent to the NATS reply subject. For ordinary publish, the result is emitted on `behaviorid.predicted`.

Error shape:

```json
{
  "ok": false,
  "durationMs": 7,
  "error": "..."
}
```
