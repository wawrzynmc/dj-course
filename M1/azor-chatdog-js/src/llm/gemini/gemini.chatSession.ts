import { Chat } from "@google/genai";
import { Message } from "../../types";
import { LLMChatSession, LLMResponse } from "../types";

export class GeminiChatSession implements LLMChatSession {
  private geminiSession: Chat;
  private history: Message[] = [];

  constructor(geminiSession: Chat, initialHistory?: Message[]) {
    this.geminiSession = geminiSession;
    this.history = initialHistory || [];
  }

  async sendMessage(text: string): Promise<LLMResponse> {
    const result = await this.geminiSession.sendMessage({ message: text });
    const responseText = result.text || "";

    // Add to history
    this.history.push({
      role: "user",
      parts: [{ text }],
    });
    this.history.push({
      role: "model",
      parts: [{ text: responseText }],
    });

    return { text: responseText };
  }

  getHistory(): Message[] {
    return this.history;
  }
}
