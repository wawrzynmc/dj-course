/**
 * LLM Client interface - implemented by both Gemini and LLaMA clients
 */
import { Message } from "../../types";
import { LLMChatSession } from "./llmChatSession.type";

export interface LLMClient {
  createChatSession(
    systemInstruction: string,
    history?: Message[],
    thinkingBudget?: number
  ): LLMChatSession;

  countHistoryTokens(history: Message[]): number;

  getModelName(): string;

  isAvailable(): boolean;

  /**
   * Get message shown while preparing the model
   */
  preparingForUseMessage(): string;

  /**
   * Get message shown when model is ready
   */
  readyForUseMessage(): string;
}
