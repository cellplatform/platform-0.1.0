#!/usr/bin/env node
import * as fsSync from '@platform/cell.fs.sync/lib/cli';
// import * as compile from '@platform/cell.compile/lib/cli';

const pkg = require('../package.json') as { version: string };

import { cli } from './common';

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
// compile.init(app.plugins);

/**
 * Run the application.
 */
cli.log.info.gray(`v${pkg.version}`);
cli.log.info('');
app.run();
