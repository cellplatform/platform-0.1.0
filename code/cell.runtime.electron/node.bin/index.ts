#!/usr/bin/env node
import { minimist, Logger } from './common';
import * as cmd from './cmd';

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', (err) => {
  throw err;
});

const argv = minimist(process.argv.slice(2));
const param = argv._[0];

(async () => {
  if (param === 'prepare') {
    return cmd.prepare(argv);
  }

  // NB: No matched command, list all available commands.
  Logger.commands();
  return;
})();
