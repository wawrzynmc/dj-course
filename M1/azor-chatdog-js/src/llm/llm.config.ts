import z from "zod";
import { LLM_ENGINE } from "./types";
import { tupleEnum } from "../types/tupleEnum.type";

const LLMConfigSchema = z.object({
  llmEngine: z.enum(tupleEnum(LLM_ENGINE)),
});

export type LLMConfig = z.infer<typeof LLMConfigSchema>;

export function llmConfig(): LLMConfig {
  const config = {
    llmEngine: process.env.LLM_ENGINE,
  };

  return LLMConfigSchema.parse(config);
}
