import { generateText } from "ai";

import type { ResponsePrompt } from "./types.js";

type GenerationModel = Parameters<typeof generateText>[0]["model"];

export async function generateResponse(
  prompt: ResponsePrompt,
  options: {
    model?: GenerationModel;
    temperature?: number;
  } = {}
): Promise<string> {
  const model =
    options.model ??
    (process.env.LLM_MODEL ?? "openai/gpt-5-mini");

  const result = await generateText({
    model,
    system: prompt.system,
    prompt: prompt.user,
    temperature: options.temperature ?? 0.2
  });

  return result.text.trim();
}
