import { ObjectValues } from "../../types/objectType.type";

export const LLM_ENGINE = {
  GEMINI: "GEMINI",
  LLAMA_CPP: "LLAMA_CPP",
  OPENAI: "OPENAI",
} as const;

export type LLMEngine = ObjectValues<typeof LLM_ENGINE>;
