#!/usr/bin/env node

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', err => {
  throw err;
});

/**
 * Create a new "command-line-interface" application
 * and register commands from the various modules
 * within Cell/OS that expose a CLI/API.
 */
import { cli } from '.';
export const app = cli.init();

/**
 * Cell/OS commands.
 */
import * as fsSync from '@platform/cell.fs.sync/lib/cli';
fsSync.init(app);

/**
 * Run the application.
 */
app.run();
