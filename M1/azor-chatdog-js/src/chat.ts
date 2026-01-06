import { config } from "dotenv";
import { createAssistant } from "./assistant/createAssistant";
import { getSessionManager } from "./session/sessionManager";
import { getSessionIdFromCLI } from "./cli/args";
import { getUserInput } from "./cli/prompt";
import { printAssistant, printInfo, printError } from "./cli/console";
import { logWelcome } from "./commands/logWelcome";
import { handleCommand } from "./commandHandler";

config();

export function initChat(): void {
  logWelcome();

  const assistant = createAssistant();
  const manager = getSessionManager(assistant);
  const cliSessionId = getSessionIdFromCLI();
  const session = manager.initializeFromCLI(cliSessionId);

  if (cliSessionId) {
    printInfo(`Loaded session: ${session.id}`);
  } else {
    printInfo(`Started new session: ${session.id}`);
  }

  printInfo(`Using model: ${session.modelName}`);
  printInfo("Type /help for available commands\n");

  // Register cleanup handler
  process.on("exit", () => {
    manager.cleanupAndSave();
  });

  process.on("SIGINT", () => {
    console.log("\n");
    printInfo("Saving session and exiting...");
    manager.cleanupAndSave();
    process.exit(0);
  });
}

/**
 * Main chat loop
 */
export async function mainLoop(): Promise<void> {
  const assistant = createAssistant();
  const manager = getSessionManager(assistant);

  while (true) {
    try {
      // Get user input
      const userInput = await getUserInput();

      // Skip empty input
      if (!userInput) {
        continue;
      }

      // Handle commands
      if (userInput.startsWith("/")) {
        const shouldExit = handleCommand(userInput, manager);
        if (shouldExit) {
          break;
        }
        continue;
      }

      // Get current session
      const session = manager.getCurrentSession();

      // Send message to LLM
      const response = await session.sendMessage(userInput);

      // Get token information
      const tokenInfo = session.getTokenInfo();

      // Display response
      printAssistant(`\n${assistant.name}: ${response.text}`);
      printInfo(
        `Tokens: ${tokenInfo.total} (Pozostało: ${tokenInfo.remaining} / ${tokenInfo.max})`
      );

      // Save session
      const saveResult = session.saveToFile();
      if (!saveResult.success && saveResult.error) {
        printError(`Error saving session: ${saveResult.error}`);
      }
    } catch (error) {
      printError(`Error: ${(error as Error).message}`);
      console.error(error);
    }
  }

  // Cleanup on exit
  manager.cleanupAndSave();
}
