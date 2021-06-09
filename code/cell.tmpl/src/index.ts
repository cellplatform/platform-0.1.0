#!/usr/bin/env node

import { minimist } from './common';
import { tmpl } from './tmpl';

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', (err) => {
  throw err;
});

const argv = minimist(process.argv.slice(2));

/**
 * Runs a template generator.
 *
 * Arguments:
 *    --install: (optional) Flag indicating if [yarn install] should be run.
 *
 */
(async () => {
  const install = Boolean(argv.install);
  const dir = process.cwd();
  await tmpl({ dir, install });
})();
