import { GoogleGenAI, Content, CreateChatParameters } from "@google/genai";

import { geminiConfig } from "./gemini.config";
import { Message } from "../../types";
import { LLMChatSession, LLMClient } from "../types";
import { GeminiChatSession } from "./gemini.chatSession";

export class GeminiLLMClient implements LLMClient {
  private genAI: GoogleGenAI;
  private modelName: string;
  private apiKey: string;

  private constructor(modelName: string, apiKey: string) {
    this.modelName = modelName;
    this.apiKey = apiKey;
    this.genAI = new GoogleGenAI({ apiKey });
  }

  public static fromEnvironment(): GeminiLLMClient {
    const config = geminiConfig();
    return new GeminiLLMClient(config.modelName, config.apiKey);
  }

  public createChatSession(
    systemInstruction: string,
    history?: Message[],
    thinkingBudget: number = 0 // 0 is disabled, -1 is automatic, other values are model dependent
  ): LLMChatSession {
    // Convert universal Message format to Gemini Content format
    const geminiHistory: Content[] = (history || []).map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: msg.parts.map((part) => ({ text: part.text })),
    }));

    // Create chat session configuration
    const chatConfig: CreateChatParameters = {
      model: this.modelName,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingBudget,
        },
      },
      history: geminiHistory,
    };

    const geminiSession = this.genAI.chats.create(chatConfig);

    return new GeminiChatSession(geminiSession, history);
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
