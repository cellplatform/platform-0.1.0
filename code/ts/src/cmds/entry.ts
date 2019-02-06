import * as yargs from 'yargs';

import { log } from '../common';
import * as cmd from './cmd';

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', err => {
  throw err;
});

const CMD = {
  BUILD: 'build',
  BUILD_B: 'b',
  LINT: 'lint',
  LINT_L: 'l',
  TEST: 'test',
  TEST_T: 't',
  PREPARE: 'prepare',
  PREPARE_P: 'p',
};
const CMDS = Object.keys(CMD)
  .map(key => CMD[key])
  .map(cmd => cmd.split(' ')[0]);

/**
 * Cheat sheet.
 * https://devhints.io/yargs
 */
const program = yargs
  .scriptName('')
  .usage('Usage: ts <command> [options]')

  /**
   * `build`
   */
  .command(
    [CMD.BUILD, CMD.BUILD_B],
    'Transpile typescript.',
    e =>
      e
        .option('silent', {
          alias: 's',
          describe: 'Suppress console output.',
          boolean: true,
        })
        .option('watch', {
          alias: 'w',
          describe: 'Watch for changes.',
          boolean: true,
        }),
    async e => {
      const { silent, watch } = e;
      const res = await cmd.build({ silent, watch });
      if (res.error) {
        fail(1, res.error);
      }
    },
  )

  /**
   * `lint`
   */
  .command(
    [CMD.LINT, CMD.LINT_L],
    'Run linter.',
    e =>
      e.option('silent', {
        alias: 's',
        describe: 'Suppress console output.',
        boolean: true,
      }),
    async e => {
      const { silent } = e;
      const res = await cmd.lint({ silent });
      if (res.error) {
        fail(1, res.error);
      }
    },
  )

  /**
   * `test`
   */
  .command(
    [CMD.TEST, CMD.TEST_T],
    `Run tests.`,
    e =>
      e
        .option('silent', {
          alias: 's',
          describe: 'Suppress console output.',
          boolean: true,
        })
        .option('watch', {
          alias: 'w',
          describe: 'Watch for changes.',
          boolean: true,
        }),
    async e => {
      const { silent, watch } = e;
      const res = await cmd.test({ silent, watch });
      if (res.error) {
        fail(1, res.error);
      }
    },
  )

  /**
   * `prepare`
   */
  .command(
    [CMD.PREPARE, CMD.PREPARE_P],
    `Prepare for publish.`,
    e =>
      e.option('silent', {
        alias: 's',
        describe: 'Suppress console output.',
        boolean: true,
      }),
    async e => {
      const { silent } = e;
      const res = await cmd.prepare({ silent });
      if (res.error) {
        fail(1, res.error);
      }
    },
  )

  .help('h')
  .alias('h', 'help')
  .alias('v', 'version');

/**
 * Show full list of commands if none was provided.
 */
if (!CMDS.includes(program.argv._[0])) {
  program.showHelp();
  log.info();
  process.exit(0);
}

function fail(code: number, error: string | Error) {
  const message = typeof error === 'string' ? error : error.message;
  log.info(`\n😞  ${message}\n`);
  process.exit(code);
}
