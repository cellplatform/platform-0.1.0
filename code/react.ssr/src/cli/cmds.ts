import * as bundle from './cmd.bundle';
import { cli, log } from './common';

const app = cli.create('ssr');

app
  /**
   * Status.
   */
  .command(
    ['status', 's'],
    'Current status of the service.',
    yargs => {
      return yargs;
    },
    async argv => {
      log.info('status', argv);
    },
  )

  /**
   * Bundle.
   */
  .command(
    ['bundle', 'b'],
    'Bundles and prepare javascript.',
    yargs => {
      return yargs;
    },
    async argv => bundle.run(),
  );

/**
 * Run
 */
app.run();
