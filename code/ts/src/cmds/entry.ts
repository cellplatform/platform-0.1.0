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
    'Transpile the typescript.',
    e =>
      e.option('silent', {
        alias: 's',
        describe: 'Suppress console output.',
        boolean: true,
      }),
    async e => {
      const { silent } = e;
      const res = await cmd.build({ silent });
      if (res.error) {
        log.info(`FAIL: ${res.error.message}`);
        log.info();
        process.exit(1);
      }
    },
  )

  /**
   * `lint`
   */
  .command(
    [CMD.LINT, CMD.LINT_L],
    'Run the typescript linter.',
    e =>
      e.option('silent', {
        alias: 's',
        describe: 'Suppress console output.',
        boolean: true,
      }),
    async e => {
      const { silent } = e;
      const res = await cmd.lint({ silent });

      // console.log('res', res);
      if (res.error) {
        log.info(`FAIL: ${res.error.message}`);
        log.info();
        process.exit(1);
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
