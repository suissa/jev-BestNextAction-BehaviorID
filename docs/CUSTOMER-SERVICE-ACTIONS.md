# Customer-service action map

`@suissa/jev-behaviorid` includes a reusable, domain-neutral action space for a single customer-service turn. It supports retail, healthcare administration, logistics, financial service, SaaS, public service, professional services, and other verticals because it describes **what kind of response is appropriate**, not the vertical implementation.

## Context contract

The scorer deliberately accepts exactly three messages in this fixed order:

```ts
{
  customerPrevious: { content, timestamp },
  systemPrevious:   { content, timestamp },
  customerLatest:   { content, timestamp }
}
```

The final field is the message being answered. The preceding customer/system pair preserves the immediate conversational causality: what the customer said, what the system committed to, and what the customer now says.

## Action space

The canonical map contains generic actions in eight categories:

| Category | Purpose |
| --- | --- |
| `understand` | acknowledge, clarify, collect only necessary data, and preserve context |
| `inform` | answer, explain, set expectations, provide status or options |
| `resolve` | execute authorized work, verify, troubleshoot, restore, or offer a workaround |
| `recover` | apologize, own a failure, remediate, compensate, or reopen |
| `coordinate` | create a case, route, escalate, follow up, request evidence, notify |
| `commercial` | qualify, recommend, quote, handle objections, facilitate purchase/cancellation |
| `safety` | verify identity, request consent, protect data, decline safely, review fraud, escalate urgent harm |
| `close` | check resolution, recap, close, and optionally invite feedback |

The executable source of truth is `DEFAULT_CUSTOMER_SERVICE_ACTIONS`, not this table. Each action has a stable id, plain-language description, positive conditions, optional avoidance conditions, and optional prerequisites.

## Use

```ts
import {
  JevCustomerServiceActionMapper
} from "@suissa/jev-behaviorid";

const mapper = new JevCustomerServiceActionMapper();

const result = await mapper.score({
  customerPrevious: {
    timestamp: "2026-09-24T12:00:00Z",
    content: "Minha entrega ainda não chegou."
  },
  systemPrevious: {
    timestamp: "2026-09-24T12:01:00Z",
    content: "Vou verificar o rastreio para você."
  },
  customerLatest: {
    timestamp: "2026-09-24T12:05:00Z",
    content: "Preciso dela hoje. O que aconteceu?"
  }
});
```

`result.predictions` contains every action and its probability. The mapper never chooses, executes, or authorizes an action. A vertical must still enforce policy, consent, identity, permissions, data minimization, and human escalation.
