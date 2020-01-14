#!/usr/bin/env node
import * as fsSync from '@platform/cell.fs.sync/lib/cli';
import { filter } from 'rxjs/operators';
import { chalk, log, cli } from './common';

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
export const app = cli.create('cell');

/**
 * Register [Cell/OS] plugin commands from child modules.
 */
fsSync.init(app.plugins);

/**
 * Show title before [Help] is displayed.
 * NB: This is done when no command is passed to the app.
 */
app.events$.pipe(filter(e => e.type === 'CLI/showHelp/before')).subscribe(() => {
  log.info(chalk.bgCyan.black(` CellOS `));
  log.info();
});

/**
 * Run the application.
 */
app.run();
