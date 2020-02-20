#!/usr/bin/env node

/**
 * NOTE:
 *    This command line entry is a local sub-set of the
 *    wider `cell.cli` command-line, used locally for
 *    testing purposes.
 */

import * as tmpl from './cli';
import { cli } from './common';

/**
 * Create a new "command-line-interface" application
 * and register commands from the various modules
 * within Cell/OS that expose a CLI/API.
 */
export const app = cli.create('cell');
tmpl.init(app.plugins);

/**
 * Run the application.
 */
app.run();
