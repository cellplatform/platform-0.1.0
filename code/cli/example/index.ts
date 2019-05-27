#!/usr/bin/env node
import { log, yargs } from './libs';

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', err => {
  throw err;
});

const CMD = {
  INIT: 'init',
  INIT_ALIAS: 'i',
};
const CMDS = Object.keys(CMD).map(key => CMD[key]);

/**
 * Cheat sheet.
 * https://devhints.io/yargs
 */
const SCRIPT = log.magenta('my-app');
const COMMAND = log.cyan('<command>');
const OPTIONS = log.gray('[options]');
const program = yargs
  .scriptName('')
  .usage(`${'Usage:'} ${SCRIPT} ${COMMAND} ${OPTIONS}`)
  .recommendCommands()

  /**
   * `init`
   */
  .command(
    [CMD.INIT, CMD.INIT_ALIAS],
    'Initialize the thing.',
    e =>
      e.option('force', {
        alias: 'f',
        describe: 'Overwrite existing files.',
        boolean: true,
      }),
    e => {
      const { force } = e;
      log.info();
      log.info('🌼  init', e);
      log.info();
    },
  );

/**
 * Show full list of commands if none was provided.
 */
if (!CMDS.includes(program.argv._[0])) {
  program.showHelp();
  exit(0);
}

/**
 * [Helpers]
 */

function exit(code: number) {
  log.info();
  process.exit(code);
}
