#!/usr/bin/env node

import { minimist } from './common';
import * as cmd from './cmd';
import { Logger } from './util';

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

(() => {
  // Invoke the corresponding command name.
  if (typeof cmd[param] === 'function') return cmd[param](argv);

  // NB: No matched command name, list all available commands.
  return Logger.commands();
})();
