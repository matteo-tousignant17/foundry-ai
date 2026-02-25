import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";

// Switch between providers by changing this export.
// Requires OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.local

export const model = process.env.ANTHROPIC_API_KEY
  ? anthropic("claude-3-5-haiku-20241022")
  : openai("gpt-4o");

export const fastModel = process.env.ANTHROPIC_API_KEY
  ? anthropic("claude-3-5-haiku-20241022")
  : openai("gpt-4o-mini");
