import { z } from "zod";
import fs from "fs";
import path from "path";

export const LlamaConfigSchema = z.object({
  llamaModelPath: z
    .string()
    .min(1, "LLaMA model path is required")
    .refine((p) => fs.existsSync(p), {
      message: "LLaMA model file does not exist",
    })
    .refine((p) => path.extname(p).toLowerCase() === ".gguf", {
      message: "LLaMA model must be a .gguf file",
    }),
  llamaGpuLayers: z.number().int().min(0).default(1),
  llamaContextSize: z.number().int().min(1).default(2048),
  llamaFlashAttention: z.boolean().default(false),
});

export type LlamaConfig = z.infer<typeof LlamaConfigSchema>;

export function llamaConfig(): LlamaConfig {
  const config = {
    llamaModelPath: process.env.LLAMA_MODEL_PATH,
    llamaGpuLayers: parseInt(process.env.LLAMA_GPU_LAYERS || "1", 10),
    llamaContextSize: parseInt(process.env.LLAMA_CONTEXT_SIZE || "2048", 10),
    llamaFlashAttention: process.env.LLAMA_FLASH_ATTENTION === "true",
  };

  return LlamaConfigSchema.parse(config);
}
