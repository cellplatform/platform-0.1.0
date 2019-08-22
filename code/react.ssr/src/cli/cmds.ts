import * as bundle from './cmd.bundle';
import * as pull from './cmd.pull';
import * as pushBundle from './cmd.pushBundle';
import * as release from './cmd.release';
import * as reset from './cmd.reset';
import * as status from './cmd.status';
import { cli } from './common';

const app = cli.create('ssr');

app
  /**
   * Status.
   */
  .command(
    ['status', 's'],
    'Current status of the cloud manifest.',
    yargs => {
      return yargs;
    },
    async argv => status.run(),
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
    'Change release version of a site.',
    yargs => {
      return yargs;
    },
    async argv => release.run(),
  )

  /**
   * Pull.
   */
  .command(
    ['pull'],
    'Pull the latet version of the manifest locally.',
    yargs => {
      return yargs;
    },
    async argv => pull.run(),
  )

  /**
   * Reset cache.
   */
  .command(
    ['reset'],
    'Reset the cache on sites.',
    yargs => {
      return yargs;
    },
    async argv => reset.run(),
  );

/**
 * Run.
 */
app.run();
