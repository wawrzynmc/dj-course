/**
 * CLI argument parsing
 */

import type { CLIArguments } from "../types/index.js";

export function parseArgs(): CLIArguments {
  const args = process.argv.slice(2);
  const result: CLIArguments = {};

  for (const arg of args) {
    if (arg.startsWith("--session-id=")) {
      result.sessionId = arg.split("=")[1];
    }
  }

  return result;
}

export function getSessionIdFromCLI(): string | undefined {
  const args = parseArgs();
  return args.sessionId;
}
