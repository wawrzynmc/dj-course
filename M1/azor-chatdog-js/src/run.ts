import { initChat, mainLoop } from "./chat";

async function main(): Promise<void> {
  try {
    initChat();
    await mainLoop();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
