import * as yargs from 'yargs';

import { log } from '../common';
import * as cmds from './cmds';

/**
 * Makes the script crash on unhandled rejections instead of silently
 * ignoring them. In the future, promise rejections that are not handled will
 * terminate the Node.js process with a non-zero exit code.
 */
process.on('unhandledRejection', (err) => {
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
  PUBLISH: 'publish',
  PUBLISH_PUB: 'pub',
  CHMOD: 'chmod',
};
const CMDS = Object.keys(CMD)
  .map((key) => CMD[key])
  .map((cmd) => cmd.split(' ')[0]);

const DESCRIPTION = {
  SILENT: 'Suppress console output',
};

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
    (e) =>
      e
        .option('silent', {
          alias: 's',
          describe: DESCRIPTION.SILENT,
          boolean: true,
        })
        .option('watch', {
          alias: 'w',
          describe: 'Watch for changes',
          boolean: true,
        })
        .option('dir', {
          describe: 'The directory of the module',
          string: true,
        })
        .option('outDir', {
          describe: 'Redirect output structure to the directory',
          string: true,
        })
        .option('tsconfig', {
          describe: 'Name of the `tsconfig` file',
          string: true,
        })
        .option('no-esm', {
          describe: 'Do not include ESModule output (.jsm)',
          boolean: true,
        }),
    async (e) => {
      const { silent, watch, dir, outDir, esm, tsconfig } = e;

      if (watch) {
        // Watching (build as common-js)
        await cmds.build({ silent, tsconfig, dir, outDir, watch: true, as: 'COMMON_JS' });
      } else {
        // Build all formats (ESM and common-js)
        let formats: cmds.BuildFormat[] = [];
        formats = esm !== false ? [...formats, 'ES_MODULE'] : formats;
        formats = [...formats, 'COMMON_JS'];
        const res = await cmds.buildAs(formats, {
          silent,
          watch,
          tsconfig,
          dir,
          outDir,
        });
        if (res.error) {
          fail(1, res.error);
        }
      }
    },
  )

  /**
   * `lint`
   */
  .command(
    [CMD.LINT, CMD.LINT_L],
    'Run linter',
    (e) =>
      e
        .option('silent', {
          alias: 's',
          describe: DESCRIPTION.SILENT,
          boolean: true,
        })
        .option('dir', {
          describe: 'The directory of the module',
          string: true,
        }),
    async (e) => {
      const { silent, dir } = e;
      const res = await cmds.lint({ silent, dir });
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
    `Run tests`,
    (e) =>
      e
        .option('silent', {
          alias: 's',
          describe: DESCRIPTION.SILENT,
          boolean: true,
        })
        .option('dir', {
          describe: 'The directory of the module',
          string: true,
        })
        .option('watch', {
          alias: 'w',
          describe: 'Watch for changes',
          boolean: true,
        })
        .option('suffix', {
          describe: 'The test file suffix to match.',
          default: 'test,TEST',
          string: true,
        }),
    async (e) => {
      const { silent, watch, dir, suffix } = e;
      const res = await cmds.test({ silent, watch, dir, suffix });
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
    `Prepare for publish`,
    (e) =>
      e
        .option('silent', {
          alias: 's',
          describe: DESCRIPTION.SILENT,
          boolean: true,
        })
        .option('dir', {
          describe: 'The directory of the module',
          string: true,
        }),
    async (e) => {
      const { silent, dir } = e;
      const res = await cmds.prepare({ silent, dir });
      if (res.error) {
        fail(1, res.error);
      }
    },
  )

  /**
   * `publish`
   */
  .command(
    [CMD.PUBLISH, CMD.PUBLISH_PUB],
    `Publish to NPM`,
    (e) =>
      e
        .option('silent', {
          alias: 's',
          describe: DESCRIPTION.SILENT,
          boolean: true,
        })
        .option('dir', {
          describe: 'The directory of the module',
          string: true,
        })
        .option('outDir', {
          describe: 'The dir typescript has been transpiled to',
          string: true,
        }),

    async (e) => {
      const { silent, dir, outDir } = e;
      const res = await cmds.publish({ silent, dir, outDir });
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
    (e) =>
      e
        .positional('permissions', {
          type: 'string',
          default: '777',
          describe: 'The permissions to apply',
        })
        .option('silent', {
          alias: 's',
          describe: DESCRIPTION.SILENT,
          boolean: true,
        }),
    async (e) => {
      const { silent, permissions = '777' } = e;
      const res = await cmds.chmod({ silent, permissions });
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

const command = (program.argv as any)._[0];

if (!CMDS.includes(command)) {
  program.showHelp('log');
  log.info();
  process.exit(0);
}

function fail(code: number, error: string | Error) {
  const message = typeof error === 'string' ? error : error.message;
  log.info(`\n😞  ${message}`);
  process.exit(code);
}
