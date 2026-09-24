import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  DEFAULT_BEHAVIOR_IDS,
  DEFAULT_CRITERIA_VERSION,
  DEFAULT_ONTOLOGY_VERSION,
  JevBehaviorIDPredictor,
  JevCustomerServiceActionMapper
} from "@suissa/jev-behaviorid";

const server = new McpServer({
  name: "jev-behaviorid",
  version: "0.2.0"
});

const predictor = new JevBehaviorIDPredictor({
  definitions: DEFAULT_BEHAVIOR_IDS,
  ontologyVersion: DEFAULT_ONTOLOGY_VERSION,
  criteriaVersion: DEFAULT_CRITERIA_VERSION
});
const customerServiceMapper = new JevCustomerServiceActionMapper();

const MessageSchema = z.object({
  content: z.string().min(1),
  timestamp: z.string().min(1)
});

server.tool(
  "behaviorid_probabilities",
  "Return the Jev probability distribution for every configured next BehaviorID from exactly three timestamped messages. This tool does not choose a next best action.",
  { messages: z.tuple([MessageSchema, MessageSchema, MessageSchema]) },
  async ({ messages }) => ({
    content: [{ type: "text", text: JSON.stringify(await predictor.predict(messages), null, 2) }]
  })
);

server.tool(
  "customer_service_action_probabilities",
  "Return probabilities for every generic customer-service action from customer previous → system previous → customer latest. It only scores the map; it never chooses, executes, or authorizes an action.",
  {
    customerPrevious: MessageSchema,
    systemPrevious: MessageSchema,
    customerLatest: MessageSchema
  },
  async (context) => ({
    content: [{ type: "text", text: JSON.stringify(await customerServiceMapper.score(context), null, 2) }]
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
