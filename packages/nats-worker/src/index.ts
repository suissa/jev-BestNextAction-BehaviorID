import { connect, JSONCodec } from "nats";
import { z } from "zod";
import {
  DEFAULT_BEHAVIOR_IDS,
  DEFAULT_CRITERIA_VERSION,
  DEFAULT_ONTOLOGY_VERSION,
  JevBehaviorIDPredictor
} from "@suissa/jev-behaviorid";

const MessageSchema = z.object({
  content: z.string().min(1),
  timestamp: z.string().min(1)
});

const RequestSchema = z.object({
  correlationId: z.string().optional(),
  messages: z.tuple([MessageSchema, MessageSchema, MessageSchema])
});

const predictor = new JevBehaviorIDPredictor({
  definitions: DEFAULT_BEHAVIOR_IDS,
  ontologyVersion: DEFAULT_ONTOLOGY_VERSION,
  criteriaVersion: DEFAULT_CRITERIA_VERSION
});

const natsUrl = process.env.NATS_URL ?? "nats://127.0.0.1:4222";
const inputSubject = process.env.NATS_SUBJECT_IN ?? "behaviorid.predict";
const outputSubject = process.env.NATS_SUBJECT_OUT ?? "behaviorid.predicted";

const nc = await connect({ servers: natsUrl });
const codec = JSONCodec();
const sub = nc.subscribe(inputSubject);

console.error(`jev-behaviorid NATS worker listening on ${inputSubject}`);

for await (const msg of sub) {
  const startedAt = Date.now();

  try {
    const request = RequestSchema.parse(codec.decode(msg.data));
    const result = await predictor.predict(request.messages);
    const payload = {
      correlationId: request.correlationId,
      ok: true,
      durationMs: Date.now() - startedAt,
      result
    };

    if (msg.reply) {
      msg.respond(codec.encode(payload));
    } else {
      nc.publish(outputSubject, codec.encode(payload));
    }
  } catch (error) {
    const payload = {
      ok: false,
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error)
    };

    if (msg.reply) {
      msg.respond(codec.encode(payload));
    } else {
      nc.publish(outputSubject, codec.encode(payload));
    }
  }
}
