#!/usr/bin/env node
import { minimist } from '../common';
import * as cmd from './commands';
import { logger } from './util';

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
  if (param === 'bundle') {
    return cmd.bundle(argv);
  }

  if (param === 'watch') {
    return cmd.watch(argv);
  }

  if (param === 'dev') {
    return cmd.dev(argv);
  }

  if (param === 'info') {
    return cmd.info(argv);
  }

  if (param === 'clean') {
    return cmd.clean(argv);
  }

  logger.commands();
  return;
})();
