import * as bundle from './cmd.bundle';
import * as pushBundle from './cmd.pushBundle';
import * as release from './cmd.release';
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
      log.info('TODO status ', argv); // TEMP 🐷
    },
  )

  /**
   * Bundle (and push).
   */
  .command(
    ['bundle', 'b'],
    'Prepare, bundle and push javascript.',
    yargs => {
      return yargs;
    },
    async argv => bundle.run(),
  )

  /**
   * Push (only).
   */
  .command(
    ['push', 'p'],
    'Push bundle to S3.',
    yargs => {
      return yargs;
    },
    async argv => pushBundle.run({ prompt: true }),
  )

  /**
   * Release version.
   */
  .command(
    ['release', 'r'],
    'Change the release version of a site.',
    yargs => {
      return yargs;
    },
    async argv => release.run(),
  );

/**
 * Run.
 */
app.run();
