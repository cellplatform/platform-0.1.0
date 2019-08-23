import { Config } from '../config';
import { Manifest } from '../manifest';
import * as push from './cmd.push';
import * as reset from './cmd.reset';
import { cli, fs, log } from './common';

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
    .task('pull manifest', async e => {
      manifest = await config.manifest.local.ensureLatest({ minimal: true });
    })
    .task('pull version list', async e => {
      versions = await config.s3.versions({ sort: 'DESC' });
    })
    .run({ concurrent: true });

  // Ensure the local manifest is up-to-date.
  if (!manifest) {
    log.error('\nManifest could not be found.');
    log.info.gray(config.manifest.s3.url);
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

  // Push change to S3 and reset cache.
  await push.manifest({ config, silent: false });
  await reset.run({ config, manifest, site });

  // Finish up.
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
    name: `${value} ${value === current ? '🌼' : ''}`,
    value,
  }));
  return cli.prompt.list<string>({
    message: 'version',
    items: [...versions, '---'],
  });
}
