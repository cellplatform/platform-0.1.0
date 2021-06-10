#!/usr/bin/env node

import * as fsSync from '@platform/cell.fs.sync/lib/cli';
import { cli, constants } from './common';

const log = cli.log;

/**
 * Create a new "command-line-interface" application
 * and register commands from the various modules
 * within Cell/OS that expose a CLI/API.
 */
export const app = cli.create('cell');
fsSync.init(app.plugins);

// Log header (meta-data).
const PKG = constants.PKG;
const header = `${PKG.name}@${PKG.version}`;
log.info.gray(`${header}\n${log.cyan('━'.repeat(header.length))}\n`);

/**
 * Run the application.
 */
app.run();
