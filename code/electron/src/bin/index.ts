#!/usr/bin/env node
import { log } from '@platform/log/lib/server';
import * as minimist from 'minimist';

import * as cmds from './cmds';

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', err => {
  throw err;
});

/**
 * Run the bin script.
 * NOTE:
 *  This entry point is a bare-bones starter script that
 *  delegates out to the actual application.
 */

(async () => {
  const args = minimist(process.argv.slice(2));
  const cmd = args._[0];
  log.info(`\ncommand: ${log.yellow(cmd)}`);

  switch (cmd) {
    case 'rebuild':
      return cmds.rebuild();

    default:
      log.info.gray(`Not found.\n`);
      return;
  }
})();
