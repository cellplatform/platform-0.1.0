import { cli, log } from './common';

export const app = cli.create('cell');

app
  /**
   * Foo.
   */
  .command(
    ['foo'],
    'Sample dummy foo.',
    yargs => yargs,
    async argv => {
      log.info(`\nFOO\n`);
    },
  );
