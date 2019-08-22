import * as bundle from './cmd.bundle';
import * as pull from './cmd.pull';
import * as pushBundle from './cmd.pushBundle';
import * as release from './cmd.release';
import * as reset from './cmd.reset';
import { cli } from './common';

const app = cli.create('ssr');

app
  /**
   * Status.
   */
  .command(
    ['pull'],
    'Pull the latet version of the manifest from the cloud.',
    yargs => {
      return yargs;
    },
    async argv => pull.run(),
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
