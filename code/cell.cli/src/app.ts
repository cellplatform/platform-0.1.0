import { cli, log } from './common';

export const app = cli.create('cell');

app
  /**
   * Foo.
   */
  .command(
    ['foo'],
    'Initialize new deployment config.',
    yargs => yargs,
    async argv => {
      log.info(`\nFOO\n`);
    },
  );
