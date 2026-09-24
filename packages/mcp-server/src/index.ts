import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  DEFAULT_BEHAVIOR_IDS,
  DEFAULT_CRITERIA_VERSION,
  DEFAULT_ONTOLOGY_VERSION,
  JevBehaviorIDPredictor
} from "@suissa/jev-behaviorid";

const server = new McpServer({
  name: "jev-behaviorid",
  version: "0.1.0"
});

const predictor = new JevBehaviorIDPredictor({
  definitions: DEFAULT_BEHAVIOR_IDS,
  ontologyVersion: DEFAULT_ONTOLOGY_VERSION,
  criteriaVersion: DEFAULT_CRITERIA_VERSION
});

const MessageSchema = z.object({
  content: z.string().min(1),
  timestamp: z.string().min(1)
});

server.tool(
  "behaviorid_probabilities",
  "Return the Jev probability distribution for every configured next BehaviorID from exactly three timestamped messages. This tool does not choose a next best action.",
  {
    messages: z.tuple([MessageSchema, MessageSchema, MessageSchema])
  },
  async ({ messages }) => {
    const result = await predictor.predict(messages);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
