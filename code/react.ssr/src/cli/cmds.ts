import * as bundle from './cmd.bundle';
import * as pushBundle from './cmd.pushBundle';
import { cli, log } from './common';
import { Config } from '../config';

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

      const config = await Config.create();

      const manifest = await config.manifest.load();
      console.log('manifest', manifest);
      // console.log('m', manifest);
      // console.log('exists', await manifest.exists);
      // console.log('-------------------------------------------');
      // const ff = await manifest.load();
      // console.log('ff', ff);
    },
  )

  /**
   * Bundle.
   */
  .command(
    ['bundle', 'b'],
    'Prepare and bundle javascript.',
    yargs => {
      return yargs;
    },
    async argv => bundle.run(),
  )

  /**
   * Push.
   */
  .command(
    ['push', 'p'],
    'Push bundle to S3.',
    yargs => {
      return yargs;
    },
    async argv => pushBundle.run({ prompt: true }),
  );

/**
 * Run.
 */
app.run();
