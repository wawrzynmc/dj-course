import { GeminiLLMClient } from "./gemini";
import { LlamaClient } from "./llama";
import { llmConfig } from "./llm.config";
import { OpenAILLMClient } from "./openai";
import { LLMEngine, LLMClient } from "./types";

const LLM_ENGINE_MAPPING: Record<
  LLMEngine,
  typeof GeminiLLMClient | typeof LlamaClient | typeof OpenAILLMClient
> = {
  LLAMA_CPP: LlamaClient,
  GEMINI: GeminiLLMClient,
  OPENAI: OpenAILLMClient,
};

export function getLLMClient(): LLMClient {
  const config = llmConfig();
  const SelectedClientClass = LLM_ENGINE_MAPPING[config.llmEngine];
  return SelectedClientClass.fromEnvironment();
}
