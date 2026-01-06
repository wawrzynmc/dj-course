import { z } from "zod";

export const OpenAIConfigSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  apiKey: z.string().min(1, "OpenAI API key is required"),
});

export type OpenAIConfig = z.infer<typeof OpenAIConfigSchema>;

export function openaiConfig(): OpenAIConfig {
  const config = {
    modelName: process.env.OPENAI_MODEL_NAME,
    apiKey: process.env.OPENAI_API_KEY,
  };

  return OpenAIConfigSchema.parse(config);
}
