#!/usr/bin/env node
import { init } from '.';

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
const args = process.argv.slice(2);
init(args);
