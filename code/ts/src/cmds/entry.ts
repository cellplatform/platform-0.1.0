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
    'Transpiles the typescript.',
    e =>
      e.option('silent', {
        alias: 's',
        describe: 'Supress console output.',
        boolean: true,
      }),
    async e => {
      const { silent } = e;
      const res = await cmd.build({ silent });
      if (res.error) {
        log.info(`FAIL: ${res.error.message}`);
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
