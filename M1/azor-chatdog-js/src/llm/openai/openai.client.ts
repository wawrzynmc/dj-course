import OpenAI from "openai";

import { Message } from "../../types";
import { LLMChatSession, LLMClient, SamplingConfig } from "../types";
import { OpenAIChatSession } from "./openai.chatSession";
import { openaiConfig } from "./openai.config";
import { llmConfig } from "../llm.config";

export class OpenAILLMClient implements LLMClient {
  private openaiClient: OpenAI;
  private modelName: string;
  private apiKey: string;
  private defaultSamplingConfig?: SamplingConfig;

  private constructor(
    modelName: string,
    apiKey: string,
    samplingConfig?: SamplingConfig
  ) {
    this.modelName = modelName;
    this.apiKey = apiKey;
    this.defaultSamplingConfig = samplingConfig;
    this.openaiClient = new OpenAI({
      apiKey: this.apiKey,
    });
  }

  public static fromEnvironment(): OpenAILLMClient {
    const config = openaiConfig();
    const { temperature, topP, topK } = llmConfig();
    // Note: topK will be ignored for OpenAI (warned in createChatSession)
    return new OpenAILLMClient(config.modelName, config.apiKey, {
      temperature,
      topP,
      topK,
    });
  }

  public createChatSession(
    systemInstruction: string,
    history?: Message[],
    thinkingBudget?: number,
    samplingConfig?: SamplingConfig
  ): LLMChatSession {
    // Note: OpenAI doesn't support thinkingBudget parameter
    if (thinkingBudget !== undefined) {
      console.warn("OpenAI does not support thinking budget parameter");
    }

    // Merge default sampling config with provided one
    const finalSamplingConfig = {
      ...this.defaultSamplingConfig,
      ...samplingConfig,
    };

    // Warn if topK is specified (OpenAI doesn't support it)
    if (finalSamplingConfig.topK !== undefined) {
      console.warn("OpenAI does not support topK parameter");
    }

    return new OpenAIChatSession(
      this.openaiClient,
      this.modelName,
      systemInstruction,
      history,
      finalSamplingConfig
    );
  }

  public countHistoryTokens(history: Message[]): number {
    // Use rough estimation for OpenAI (1 token ≈ 4 characters)
    // In production, you'd use tiktoken or OpenAI's token counting API
    let totalTokens = 0;
    for (const msg of history) {
      for (const part of msg.parts) {
        totalTokens += Math.ceil(part.text.length / 4);
      }
    }
    return totalTokens;
  }

  public getModelName(): string {
    return this.modelName;
  }

  public isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  public preparingForUseMessage(): string {
    return `Preparing OpenAI model ${this.modelName}...`;
  }

  public readyForUseMessage(): string {
    const maskedKey = this.apiKey
      ? `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(
          this.apiKey.length - 4
        )}`
      : "NOT SET";
    return `OpenAI ${this.modelName} ready (API Key: ${maskedKey})`;
  }
}
