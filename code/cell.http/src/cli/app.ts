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
    'Initialize a new deployment.',
    yargs => yargs,
    async argv => cmd.init.run(),
  )

  /**
   * List.
   */
  .command(
    ['list', 'ls'],
    'List available deployment configurations.',
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
      return yargs.option('force', {
        alias: 'f',
        describe: 'Force a new deployment even if nothing has changed.',
        type: 'boolean',
        default: false,
      });
    },
    async argv => cmd.deploy.run({ target: 'now', force: argv.force }),
  );
