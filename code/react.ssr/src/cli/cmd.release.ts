import { bundler } from '../bundler';
import { Config } from '../config';
import { Manifest } from '../manifest';
import { cli, log, fs } from './common';
import * as reset from './cmd.reset';

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
    log.error(`Manifest could not be found.`);
    return cli.exit(1);
  }

  log.info();

  // Prompt for which site to update.
  const site = await promptForSite({ manifest });
  if (!site) {
    log.error(`The site named '${name}' does not exist in the manifest.`);
    return cli.exit(1);
  }

  // Prompt for which version to update to.
  const version = await promptForVersion({ current: site.version, versions });

  // Save change to the manifest.
  const s3 = config.s3;
  const bundle = fs.join(s3.path.bundles, version);
  const saveTo = config.manifest.local.path;
  await manifest.change.site(site).bundle({ value: bundle, saveTo });

  // Push change to S3.
  const bucket = s3.bucket;
  const source = config.manifest.local.path;
  const target = fs.join(s3.path.base, s3.path.manifest);
  await bundler.push(s3.config).manifest({ bucket, source, target, silent: false });

  // Finish up.
  await reset.run({ config, manifest, site });
  log.info();
}

/**
 * [Helpers]
 */
async function promptForSite(args: { manifest: Manifest }) {
  const { manifest } = args;
  const sites = manifest.sites.map(site => site.name || 'Unnamed');
  const name = await cli.prompt.list<string>({ message: 'site', items: sites });
  return manifest.site.byName(name);
}

async function promptForVersion(args: { current: string; versions: string[] }) {
  const { current } = args;
  const versions = args.versions.map(value => ({
    name: `${value} ${value === current ? '🌼  CURRENT' : ''}`,
    value,
  }));
  return cli.prompt.list<string>({
    message: 'version',
    items: [...versions, '---'],
  });
}
