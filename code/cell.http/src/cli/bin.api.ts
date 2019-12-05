import * as cmd from './cmd';
import { cli } from './common';

export { cmd };
export const app = cli.create('cell');

app
  /**
   * Initialize.
   */
  .command(
    ['init'],
    'Initialize new deployment config.',
    yargs => yargs,
    async argv => cmd.init.run(),
  )

  /**
   * List.
   */
  .command(
    ['list', 'ls'],
    'List deployment configs.',
    yargs => yargs,
    async argv => cmd.list.run(),
  )

  /**
   * Deploy.
   */
  .command(
    ['deploy', 'd'],
    'Deploy to the cloud.',
    yargs => {
      return yargs
        .option('force', {
          alias: 'f',
          describe: 'Force a new deployment even if nothing has changed.',
          type: 'boolean',
          default: false,
        })
        .option('dry', {
          describe: 'Dry run (prepares but will not deploy).',
          type: 'boolean',
          default: false,
        });
    },
    async argv => cmd.deploy.run({ target: 'now', force: argv.force, dry: argv.dry }),
  );
