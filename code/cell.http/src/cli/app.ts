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
    yargs => {
      return yargs;
    },
    async argv => cmd.init.run(),
  )

  /**
   * List.
   */
  .command(
    ['list', 'ls'],
    'List available deployment configurations.',
    yargs => {
      return yargs;
    },
    async argv => cmd.list.run(),
  )

  /**
   * Deploy.
   */
  .command(
    ['deploy', 'd'],
    'Run a cloud deployment.',
    yargs => {
      return yargs;
    },
    async argv => cmd.deploy.run(),
  );
