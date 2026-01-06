import { Message } from "../../types";
import { LLMChatSession, SamplingConfig } from "../types";
import { LLMClient } from "../types";
import { LlamaChatSession } from "./llama.chatSession";
import { llamaConfig } from "./llama.config";
import { llmConfig } from "../llm.config";

export class LlamaClient implements LLMClient {
  private modelPath: string;
  private gpuLayers: number;
  private contextSize: number;
  private flashAttention: boolean;
  private defaultSamplingConfig?: SamplingConfig;

  private constructor(input: {
    modelPath: string;
    gpuLayers: number;
    contextSize: number;
    flashAttention: boolean;
    samplingConfig?: SamplingConfig;
  }) {
    const {
      modelPath,
      gpuLayers,
      contextSize,
      flashAttention,
      samplingConfig,
    } = input;
    this.modelPath = modelPath;
    this.gpuLayers = gpuLayers;
    this.contextSize = contextSize;
    this.flashAttention = flashAttention;
    this.defaultSamplingConfig = samplingConfig;
  }

  public static fromEnvironment(): LlamaClient {
    const config = llamaConfig();
    const { temperature, topP, topK } = llmConfig();
    return new LlamaClient({
      modelPath: config.llamaModelPath,
      gpuLayers: config.llamaGpuLayers,
      contextSize: config.llamaContextSize,
      flashAttention: config.llamaFlashAttention,
      samplingConfig: { temperature, topP, topK },
    });
  }

  public createChatSession(
    systemInstruction: string,
    history?: Message[],
    _thinkingBudget?: number,
    samplingConfig?: SamplingConfig
  ): LLMChatSession {
    // Merge default sampling config with provided one
    const finalSamplingConfig = {
      ...this.defaultSamplingConfig,
      ...samplingConfig,
    };

    return new LlamaChatSession(
      systemInstruction,
      this.modelPath,
      this.gpuLayers,
      this.contextSize,
      this.flashAttention,
      history,
      finalSamplingConfig
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
