import * as bundle from './cmd.bundle';
import * as pushBundle from './cmd.pushBundle';
import { R, cli, log, fs, semver } from './common';
import { Config } from '../config';
import { bundler } from '../bundler';

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

      // const manifest = await config.manifest.load();
      // console.log('manifest', manifest);

      const s3 = config.s3.fs;

      console.log('-------------------------------------------');
      const list = s3.list({
        bucket: config.s3.bucket,
        prefix: config.s3.path.bundles,
        // max: 5,
      });

      const objects = await list.objects;
      const dirs = (await list.dirs).items.map(({ key }) => ({ key, version: fs.basename(key) }));
      // dirs = R.sortWith([R.prop('version')])
      const items = semver.sort(dirs.map(item => item.version)).reverse();

      // console.log('versions', items);

      const res = await cli.prompt.list({ message: 'version', items: [...items, '---'] });

      console.log('-------------------------------------------');
      console.log('res', res);

      // console.log('-------------------------------------------');
      // console.log('objects', objects);
      // console.log('-------------------------------------------');
      // console.log('dirs', dirs);

      // const res2 = await s3.get({
      //   bucket: 'platform',
      //   key: 'modules/react.ssr/manifest.yml',
      //   // max: 3,
      // });
      // console.log('res2', res2);
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
