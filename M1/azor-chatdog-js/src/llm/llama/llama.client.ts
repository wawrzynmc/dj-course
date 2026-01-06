import { Message } from "../../types";
import { LLMChatSession } from "../types";
import { LLMClient } from "../types";
import { LlamaChatSession } from "./llama.chatSession";
import { llamaConfig } from "./llama.config";

export class LlamaClient implements LLMClient {
  private modelPath: string;
  private gpuLayers: number;
  private contextSize: number;
  private flashAttention: boolean;

  private constructor(input: {
    modelPath: string;
    gpuLayers: number;
    contextSize: number;
    flashAttention: boolean;
  }) {
    const { modelPath, gpuLayers, contextSize, flashAttention } = input;
    this.modelPath = modelPath;
    this.gpuLayers = gpuLayers;
    this.contextSize = contextSize;
    this.flashAttention = flashAttention;
  }

  public static fromEnvironment(): LlamaClient {
    const config = llamaConfig();
    return new LlamaClient({
      modelPath: config.llamaModelPath,
      gpuLayers: config.llamaGpuLayers,
      contextSize: config.llamaContextSize,
      flashAttention: config.llamaFlashAttention,
    });
  }

  public createChatSession(
    systemInstruction: string,
    history?: Message[],
    _thinkingBudget?: number
  ): LLMChatSession {
    return new LlamaChatSession(
      systemInstruction,
      this.modelPath,
      this.gpuLayers,
      this.contextSize,
      this.flashAttention,
      history
    );
  }

  public countHistoryTokens(history: Message[]): number {
    // Rough estimation (1 token ≈ 4 characters)
    let totalTokens = 0;
    for (const msg of history) {
      for (const part of msg.parts) {
        totalTokens += Math.ceil(part.text.length / 4);
      }
    }
    return totalTokens;
  }

  public getModelName(): string {
    return this.modelPath;
  }

  public isAvailable(): boolean {
    return !!this.modelPath && this.modelPath.length > 0;
  }

  public preparingForUseMessage(): string {
    return `Loading LLaMA model from ${this.modelPath}...`;
  }

  public readyForUseMessage(): string {
    return `LLaMA ${this.getModelName()} ready (GPU layers: ${
      this.gpuLayers
    }, Context: ${this.contextSize}, Flash Attention: ${
      this.flashAttention ? "enabled" : "disabled"
    })`;
  }
}
