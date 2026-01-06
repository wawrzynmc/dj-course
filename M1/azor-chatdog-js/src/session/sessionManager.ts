import type { Assistant } from "../assistant/assistant";
import { ChatSession } from "./chatSession";
import type {
  SessionSwitchResult,
  SessionCreateResult,
  SessionRemoveResult,
} from "../types/index";
import { removeSessionFile } from "../files/sessionFiles";

/**
 * SessionManager - Orchestrates session lifecycle and manages active session
 */
export class SessionManager {
  private currentSession?: ChatSession;
  private assistant: Assistant;

  public constructor(assistant: Assistant) {
    this.assistant = assistant;
  }

  public getCurrentSession(): ChatSession {
    if (!this.currentSession) {
      throw new Error("No active session. Call createNewSession() first.");
    }
    return this.currentSession;
  }

  public hasActiveSession(): boolean {
    return !!this.currentSession;
  }

  public createNewSession(saveCurrent: boolean): SessionCreateResult {
    let saveAttempted = false;
    let previousId: string | undefined;
    let saveError: string | undefined;

    if (saveCurrent && this.currentSession) {
      saveAttempted = true;
      previousId = this.currentSession.id;

      const result = this.currentSession.saveToFile();
      if (!result.success) {
        saveError = result.error;
      }
    }

    const newSession = new ChatSession(this.assistant);
    this.currentSession = newSession;

    return {
      session: newSession,
      saveAttempted,
      previousId,
      saveError,
    };
  }

  public switchToSession(sessionId: string): SessionSwitchResult {
    let saveAttempted = false;
    let previousId: string | undefined;

    if (this.currentSession) {
      saveAttempted = true;
      previousId = this.currentSession.id;

      const saveResult = this.currentSession.saveToFile();
      if (!saveResult.success) {
        console.error("Error saving current session:", saveResult.error);
      }
    }

    const loadResult = ChatSession.loadFromFile(this.assistant, sessionId);

    if (!loadResult.success) {
      return {
        session: this.currentSession!,
        saveAttempted,
        previousId,
        loadSuccessful: false,
        error: loadResult.error,
        hasHistory: false,
      };
    }

    const newSession = loadResult.value;
    this.currentSession = newSession;

    return {
      session: newSession,
      saveAttempted,
      previousId,
      loadSuccessful: true,
      hasHistory: !newSession.isEmpty(),
    };
  }

  removeCurrentSessionAndCreateNew(): SessionRemoveResult {
    if (!this.currentSession) {
      throw new Error("No active session to remove");
    }

    const removedId = this.currentSession.id;
    const removeResult = removeSessionFile(removedId);

    const newSession = new ChatSession(this.assistant);
    this.currentSession = newSession;

    return {
      session: newSession,
      removedId,
      success: removeResult.success,
      error: removeResult.success ? undefined : removeResult.error,
    };
  }

  public initializeFromCLI(cliSessionId?: string): ChatSession {
    if (cliSessionId) {
      const result = ChatSession.loadFromFile(this.assistant, cliSessionId);

      if (result.success) {
        this.currentSession = result.value;
        return result.value;
      } else {
        console.error(`Error loading session ${cliSessionId}:`, result.error);
        console.log("Creating new session instead...");
      }
    }

    const session = new ChatSession(this.assistant);
    this.currentSession = session;
    return session;
  }

  cleanupAndSave(): void {
    if (this.currentSession) {
      const result = this.currentSession.saveToFile();
      if (!result.success) {
        console.error("Error saving session on exit:", result.error);
      }
    }
  }
}

let sessionManagerInstance: SessionManager | undefined;
export function getSessionManager(assistant?: Assistant): SessionManager {
  if (!sessionManagerInstance) {
    if (!assistant) {
      throw new Error("Assistant required for first initialization");
    }
    sessionManagerInstance = new SessionManager(assistant);
  }
  return sessionManagerInstance;
}
