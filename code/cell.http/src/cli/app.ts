import { cli, log } from './common';
import * as cmd from './cmd';

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
  );
