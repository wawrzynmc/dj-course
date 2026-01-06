import { GoogleGenAI } from "@google/genai";

import { geminiConfig } from "./gemini.config";
import { llmConfig } from "../llm.config";
import { Message } from "../../types";
import { LLMChatSession, LLMClient, SamplingConfig } from "../types";
import { GeminiChatSession } from "./gemini.chatSession";

export class GeminiLLMClient implements LLMClient {
  private genAI: GoogleGenAI;
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
    this.genAI = new GoogleGenAI({ apiKey });
  }

  public static fromEnvironment(): GeminiLLMClient {
    const config = geminiConfig();
    const { temperature, topP, topK } = llmConfig();
    return new GeminiLLMClient(config.modelName, config.apiKey, {
      temperature,
      topP,
      topK,
    });
  }

  public createChatSession(
    systemInstruction: string,
    history?: Message[],
    thinkingBudget: number = 0, // 0 is disabled, -1 is automatic, other values are model dependent
    samplingConfig?: SamplingConfig
  ): LLMChatSession {
    // Merge default sampling config with provided one
    const finalSamplingConfig = {
      ...this.defaultSamplingConfig,
      ...samplingConfig,
    };

    return new GeminiChatSession(
      this.genAI,
      this.modelName,
      systemInstruction,
      thinkingBudget,
      history,
      finalSamplingConfig
    );
  }

  public countHistoryTokens(history: Message[]): number {
    // Convert to Gemini format and count
    // For now, use rough estimation (will implement actual token counting)
    let totalTokens = 0;
    for (const msg of history) {
      for (const part of msg.parts) {
        // Rough estimation: 1 token ≈ 4 characters
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
    return `Preparing Gemini model ${this.modelName}...`;
  }

  public readyForUseMessage(): string {
    const maskedKey = this.apiKey
      ? `${this.apiKey.substring(0, 8)}...${this.apiKey.substring(
          this.apiKey.length - 4
        )}`
      : "NOT SET";
    return `Gemini ${this.modelName} ready (API Key: ${maskedKey})`;
  }
}
