import { Message } from "../../types";
import { LLMResponse } from "./llmResponse.type";

export interface LLMChatSession {
  sendMessage(text: string): Promise<LLMResponse>;
  getHistory(): Message[];
}
