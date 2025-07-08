#!/usr/bin/env node

import { Cli } from "./cli.js";
import { Logger } from "./logger.js";

const cli = new Cli();
cli.run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  Logger.error(`An error occurred while running the CLI: ${message}`);
  process.exit(1);
});
