import { z } from "zod";

export const GeminiConfigSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  apiKey: z.string().min(1, "Gemini API key is required"),
});

export type GeminiConfig = z.infer<typeof GeminiConfigSchema>;

export function geminiConfig(): GeminiConfig {
  const config = {
    modelName: process.env.GEMINI_MODEL_NAME,
    apiKey: process.env.GEMINI_API_KEY,
  };

  return GeminiConfigSchema.parse(config);
}
