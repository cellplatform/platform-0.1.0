import { bundler } from '../bundler';
import { Config } from '../config';
import { Manifest } from '../manifest';
import { cli, log } from './common';

/**
 * Release new version script.
 */
export async function run() {
  const config = await Config.create();

  let manifest: Manifest | undefined;
  let versions: string[] = [];

  // Pull data from cloud.
  log.info();
  await cli
    .tasks()
    .task('pull latest manifest', async e => {
      manifest = await config.manifest.local.ensureLatest({ minimal: true });
    })
    .task('pull version list', async e => {
      versions = await config.s3.versions({ sort: 'DESC' });
    })
    .run({ concurrent: true });

  // Ensure the local manifest is up-to-date.
  if (!manifest) {
    log.error(`The manifest could not be found.`);
    return cli.exit(1);
  }

  log.info();

  // Prompt for which site to update.
  const sites = manifest.sites.map(site => site.name || 'Unnamed');
  const name = await cli.prompt.list<string>({ message: 'site', items: sites });
  const site = manifest.site.byName(name);
  if (!site) {
    log.error(`The site named '${name}' does not exist in the manifest.`);
    return cli.exit(1);
  }

  // Prompt for which version to update to.
  const version = await cli.prompt.list<string>({
    message: 'version',
    items: [
      ...versions.map(value => ({
        name: `${value} ${value === site.version ? '🌼  CURRENT' : ''}`,
        value,
      })),
      '---',
    ],
  });

  // Save change to the manifest.
  const saveTo = config.manifest.local.path;
  await manifest.change.site(site).version({ version, saveTo });

  // Push change to S3.
  const s3 = config.s3;
  const bucket = s3.bucket;
  const source = config.manifest.local.path;
  const target = s3.path.manifest;
  await bundler.push(s3.config).manifest({ bucket, source, target, silent: false });

  // Finish up.
  log.info();
}
