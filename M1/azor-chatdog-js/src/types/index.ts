/**
 * Shared TypeScript types and interfaces for Azor Chatdog
 */

/**
 * Message part containing text content
 */
export interface MessagePart {
  text: string;
}

/**
 * Universal message format used by all LLM clients
 * Compatible with both Gemini and LLaMA
 */
export interface Message {
  role: "user" | "model";
  parts: MessagePart[];
}

/**
 * Message with timestamp for persistence
 */
export interface TimestampedMessage {
  role: "user" | "model";
  timestamp: string;
  text: string;
}

/**
 * Session history file format
 */
export interface SessionHistoryFile {
  session_id: string;
  model: string;
  system_role: string;
  history: TimestampedMessage[];
}

/**
 * Write-Ahead Log entry format
 */
export interface WALEntry {
  timestamp: string;
  session_id: string;
  model: string;
  prompt: string;
  response: string;
  tokens_used: number;
}

/**
 * Session metadata for listing
 */
export interface SessionMetadata {
  session_id: string;
  model: string;
  message_count: number;
  last_modified: Date;
  first_message?: string;
}

/**
 * Token information
 */
export interface TokenInfo {
  total: number;
  remaining: number;
  max: number;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = string> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * CLI arguments
 */
export interface CLIArguments {
  sessionId?: string;
}

/**
 * Session operation result
 */
export interface SessionSwitchResult {
  session: any; // ChatSession
  saveAttempted: boolean;
  previousId?: string;
  loadSuccessful: boolean;
  error?: string;
  hasHistory: boolean;
}

/**
 * Session creation result
 */
export interface SessionCreateResult {
  session: any; // ChatSession
  saveAttempted: boolean;
  previousId?: string;
  saveError?: string;
}

/**
 * Session removal result
 */
export interface SessionRemoveResult {
  session: any; // ChatSession
  removedId: string;
  success: boolean;
  error?: string;
}
