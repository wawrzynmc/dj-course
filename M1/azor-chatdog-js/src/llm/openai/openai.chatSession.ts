import OpenAI from "openai";
import { Message } from "../../types";
import { LLMChatSession, LLMResponse, SamplingConfig } from "../types";

export class OpenAIChatSession implements LLMChatSession {
  private openaiClient: OpenAI;
  private modelName: string;
  private history: Message[] = [];
  private systemInstruction: string;
  private samplingConfig?: SamplingConfig;

  constructor(
    openaiClient: OpenAI,
    modelName: string,
    systemInstruction: string,
    initialHistory?: Message[],
    samplingConfig?: SamplingConfig
  ) {
    this.openaiClient = openaiClient;
    this.modelName = modelName;
    this.systemInstruction = systemInstruction;
    this.history = initialHistory || [];
    this.samplingConfig = samplingConfig;
  }

  async sendMessage(text: string): Promise<LLMResponse> {
    // Add user message to history
    this.history.push({
      role: "user",
      parts: [{ text }],
    });

    // Convert internal Message format to OpenAI format
    const openaiMessages = this.convertToOpenAIMessages(this.history);

    const completion = await this.openaiClient.chat.completions.create({
      model: this.modelName,
      messages: openaiMessages,
      temperature: this.samplingConfig?.temperature,
      top_p: this.samplingConfig?.topP,
      // Note: topK is not supported by OpenAI
    });

    const responseText = completion.choices[0].message.content || "";

    // Add assistant response to history
    this.history.push({
      role: "model",
      parts: [{ text: responseText }],
    });

    return { text: responseText };
  }

  getHistory(): Message[] {
    return this.history;
  }

  private convertToOpenAIMessages(
    history: Message[]
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Add system instruction as first message
    if (this.systemInstruction) {
      messages.push({
        role: "system",
        content: this.systemInstruction,
      });
    }

    // Convert history messages
    for (const msg of history) {
      const role = msg.role === "model" ? "assistant" : msg.role;
      const content = msg.parts.map((part) => part.text).join("");

      messages.push({
        role: role as "user" | "assistant",
        content,
      });
    }

    return messages;
  }
}
