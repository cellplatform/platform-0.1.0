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
  CHMOD: 'chmod',
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
    'Transpile typescript',
    e =>
      e
        .option('silent', {
          alias: 's',
          describe: 'Suppress console output',
          boolean: true,
        })
        .option('watch', {
          alias: 'w',
          describe: 'Watch for changes',
          boolean: true,
        })
        .option('outDir', {
          describe: 'Redirect output structure to the directory',
          string: true,
        })
        .option('--no-esm', {
          describe: 'Do not include ESModule output (.jsm)',
          boolean: true,
        }),
    async e => {
      const { silent, watch, outDir, esm } = e;

      let formats: cmd.BuildFormat[] = [];
      formats = esm !== false ? [...formats, 'ES_MODULE'] : formats;
      formats = [...formats, 'COMMON_JS'];

      const res = await cmd.buildAs(formats, {
        silent,
        watch,
        outDir,
      });
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
    'Run linter',
    e =>
      e.option('silent', {
        alias: 's',
        describe: 'Suppress console output',
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
          describe: 'Suppress console output',
          boolean: true,
        })
        .option('watch', {
          alias: 'w',
          describe: 'Watch for changes',
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
        describe: 'Suppress console output',
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

  /**
   * `chmod`
   */
  .command(
    [CMD.CHMOD],
    `Change permissions on [node_modules/.bin] files.`,
    e =>
      e
        .positional('permissions', {
          type: 'string',
          default: '777',
          describe: 'The permissions to apply',
        })
        .option('silent', {
          alias: 's',
          describe: 'Suppress console output',
          boolean: true,
        }),
    async e => {
      const { silent, permissions = '777' } = e;
      const res = await cmd.chmod({ silent, permissions });
      if (res.error) {
        fail(1, res.error);
      }
    },
  )

  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .recommendCommands();

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
