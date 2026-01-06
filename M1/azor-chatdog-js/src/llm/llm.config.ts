import z from "zod";
import { LLM_ENGINE } from "./types";
import { tupleEnum } from "../types/tupleEnum.type";

const LLMConfigSchema = z.object({
  llmEngine: z.enum(tupleEnum(LLM_ENGINE)),
  temperature: z.number().min(0).max(2).default(0.7),
  topP: z.number().min(0).max(1).default(0.9),
  topK: z.number().int().positive().default(40),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;

export function llmConfig(): LLMConfig {
  const config = {
    llmEngine: process.env.LLM_ENGINE,
    temperature: process.env.LLM_TEMPERATURE
      ? parseFloat(process.env.LLM_TEMPERATURE)
      : 0.7,
    topP: process.env.LLM_TOP_P ? parseFloat(process.env.LLM_TOP_P) : 0.9,
    topK: process.env.LLM_TOP_K ? parseInt(process.env.LLM_TOP_K, 10) : 40,
  };

  return LLMConfigSchema.parse(config);
}
