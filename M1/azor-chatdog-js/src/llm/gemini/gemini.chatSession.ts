import { GoogleGenAI, Content, Chat } from "@google/genai";
import { Message } from "../../types";
import { LLMChatSession, LLMResponse, SamplingConfig } from "../types";

export class GeminiChatSession implements LLMChatSession {
  private geminiSession: Chat;
  private history: Message[] = [];
  private systemInstruction: string;
  private samplingConfig?: SamplingConfig;
  private genAI: GoogleGenAI;
  private modelName: string;
  private thinkingBudget: number;

  constructor(
    genAI: GoogleGenAI,
    modelName: string,
    systemInstruction: string,
    thinkingBudget: number = 0,
    initialHistory?: Message[],
    samplingConfig?: SamplingConfig
  ) {
    this.genAI = genAI;
    this.modelName = modelName;
    this.systemInstruction = systemInstruction;
    this.thinkingBudget = thinkingBudget;
    this.history = initialHistory || [];
    this.samplingConfig = samplingConfig;

    // Create Gemini session with converted history
    const geminiHistory = this.convertToGeminiMessages(this.history);
    this.geminiSession = this.genAI.chats.create({
      model: this.modelName,
      config: {
        systemInstruction: this.systemInstruction,
        thinkingConfig: {
          thinkingBudget: this.thinkingBudget,
        },
        temperature: this.samplingConfig?.temperature,
        topP: this.samplingConfig?.topP,
        topK: this.samplingConfig?.topK,
      },
      history: geminiHistory,
    });
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

  private convertToGeminiMessages(history: Message[]): Content[] {
    return history.map((msg) => ({
      role: msg.role === "model" ? "model" : "user",
      parts: msg.parts.map((part) => ({ text: part.text })),
    }));
  }
}
