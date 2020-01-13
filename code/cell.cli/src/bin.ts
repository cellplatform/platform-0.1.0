#!/usr/bin/env node
import * as fsSync from '@platform/cell.fs.sync/lib/cli';
import { filter, map } from 'rxjs/operators';

import { cli } from '.';
import { chalk, log, t } from './common';

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
export const app = cli.init();

/**
 * Cell/OS commands.
 */
fsSync.init(app.plugins);

/**
 * Show title before Help
 */
app.events$
  .pipe(
    filter(e => e.type === 'CLI/showHelp'),
    map(e => e.payload as t.ICmdAppShowHelp),
    filter(e => e.stage === 'BEFORE'),
  )
  .subscribe(() => {
    log.info(chalk.bgCyan.black(` CellOS `));
    log.info();
  });

/**
 * Run the application.
 */
app.plugins.run();
