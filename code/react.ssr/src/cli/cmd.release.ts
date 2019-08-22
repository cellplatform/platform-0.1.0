import { Config } from '../config';
import * as bundle from './cmd.bundle';
import * as pushBundle from './cmd.pushBundle';
import { cli, fs, log, semver } from './common';

/**
 * Release new version script.
 */
export async function run() {
  const config = await Config.create();

  // config.p

  const manifest = await config.manifest.s3.get();
  // log.info('manifest', manifest);

  const sites = manifest.sites.map(site => site.name || 'Unnamed');

  const site = await cli.prompt.list<string>({ message: 'site', items: sites });
  console.log('-------------------------------------------');
  console.log('res1', site);
  // manifest.

  // manifest.site.

  // manifest.

  const s3 = config.s3.fs;

  log.info('-------------------------------------------');
  const list = s3.list({
    bucket: config.s3.bucket,
    prefix: config.s3.path.bundles,
    // max: 5,
  });

  // const objects = await list.objects;
  const dirs = (await list.dirs).items.map(({ key }) => ({ key, version: fs.basename(key) }));
  // dirs = R.sortWith([R.prop('version')])
  const items = semver.sort(dirs.map(item => item.version)).reverse();

  // log.info('versions', items);

  const res = await cli.prompt.list({ message: 'version', items: [...items, '---'] });

  log.info('-------------------------------------------');
  log.info('res', res);
}
