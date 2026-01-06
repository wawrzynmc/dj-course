import {
  LlamaChatSession as NodeLlamaChatSession,
  getLlama,
} from "node-llama-cpp";
import { Message } from "../../types";
import { LLMChatSession, LLMResponse, SamplingConfig } from "../types";

export class LlamaChatSession implements LLMChatSession {
  private history: Message[] = [];
  private systemInstruction: string;
  private modelPath: string;
  private gpuLayers: number;
  private contextSize: number;
  private flashAttention: boolean;
  private samplingConfig?: SamplingConfig;
  private llamaSession: NodeLlamaChatSession | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    systemInstruction: string,
    modelPath: string,
    gpuLayers: number,
    contextSize: number,
    flashAttention: boolean,
    initialHistory?: Message[],
    samplingConfig?: SamplingConfig
  ) {
    this.systemInstruction = systemInstruction;
    this.modelPath = modelPath;
    this.gpuLayers = gpuLayers;
    this.contextSize = contextSize;
    this.flashAttention = flashAttention;
    this.history = initialHistory || [];
    this.samplingConfig = samplingConfig;

    // Start eager loading immediately
    this.initializationPromise = this.initializeModel();
  }

  private async initializeModel(): Promise<void> {
    try {
      // Get Llama runtime
      const llama = await getLlama();

      // Load model
      const model = await llama.loadModel({
        modelPath: this.modelPath,
        gpuLayers: this.gpuLayers,
      });

      // Create context
      const context = await model.createContext({
        contextSize: this.contextSize,
        flashAttention: this.flashAttention,
      });

      // Create chat session
      this.llamaSession = new NodeLlamaChatSession({
        contextSequence: context.getSequence(),
      });

      // Initialize with system instruction and history if present
      if (this.systemInstruction) {
        // Add system instruction to chat session
        await this.llamaSession.prompt(`System: ${this.systemInstruction}`);
      }

      // Add existing history to the session
      for (const message of this.history) {
        const role = message.role === "model" ? "assistant" : message.role;
        const content = message.parts.map((part) => part.text).join("");
        await this.llamaSession.prompt(`${role}: ${content}`);
      }
    } catch (error) {
      throw new Error(`Failed to initialize LLaMA model: ${error}`);
    }
  }

  async sendMessage(text: string): Promise<LLMResponse> {
    // Wait for initialization if it's still in progress (eager loading)
    if (this.initializationPromise) {
      await this.initializationPromise;
      this.initializationPromise = null; // Clear the promise once done
    }

    if (!this.llamaSession) {
      throw new Error("LLaMA session not initialized");
    }

    // Add user message to history
    this.history.push({
      role: "user",
      parts: [{ text }],
    });

    // Send message to model with sampling parameters
    const responseText = await this.llamaSession.prompt(text, {
      temperature: this.samplingConfig?.temperature,
      topP: this.samplingConfig?.topP,
      topK: this.samplingConfig?.topK,
    });

    // Add response to history
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
