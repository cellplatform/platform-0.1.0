import * as bundle from './cmd.bundle';
import * as pull from './cmd.pull';
import * as push from './cmd.push';
import * as release from './cmd.release';
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
      return yargs
        .option('v', {
          describe: 'The bundle version to push.',
          type: 'string',
        })
        .option('push', {
          alias: 'p',
          describe: 'Push the bundle to S3.',
          type: 'boolean',
        })
        .option('manifest', {
          alias: 'm',
          describe: 'Create the bundle manifest only.',
          type: 'boolean',
        });
    },
    async argv => {
      const { v: version, push, manifest } = argv;
      return bundle.run({ version, push, manifest });
    },
  )

  /**
   * Push (only).
   */
  .command(
    ['push', 'p'],
    'Push bundle or manifest to S3.',
    yargs => {
      return yargs
        .option('manifest', {
          alias: 'm',
          describe: 'Push the local manifest to S3.',
          type: 'boolean',
        })
        .option('bundle', {
          alias: 'b',
          describe: 'Push a bundle to S3.',
          type: 'boolean',
        });
    },
    async argv => {
      const { bundle, manifest } = argv;
      if (bundle) {
        await push.run({ type: 'BUNDLE' });
      }
      if (manifest) {
        await push.run({ type: 'MANIFEST' });
      }
      if (!bundle && !manifest) {
        // No options specified, run with prompts.
        await push.run();
      }
    },
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
  );

/**
 * Run.
 */
app.run();
