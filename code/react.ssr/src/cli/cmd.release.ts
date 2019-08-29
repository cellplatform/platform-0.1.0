import { Config } from '../config';
import { Manifest } from '../manifest';
import * as push from './cmd.push';
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
    .task('pull versions', async e => {
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
  const sites = await promptForSites({ manifest });
  if (sites.length === 0) {
    log.error(`The site named '${name}' does not exist in the manifest.`);
    return cli.exit(1);
  }

  // Prompt for which version to update to.
  const current = sites.map(({ version, name }) => ({ version, name }));
  const version = await promptForVersion({ current, versions });

  // Save change to the manifest.
  const s3 = config.s3;
  const bundle = fs.join(s3.path.bundles, version);
  const saveTo = config.manifest.local.path;
  for (const site of sites) {
    await manifest.change.site(site).bundle({ value: bundle, saveTo });
  }

  // Push change to S3 and reset cache.
  await push.manifest({ config, silent: false });

  // Finish up.
  log.info();
}

/**
 * [Helpers]
 */
async function promptForSites(args: { manifest: Manifest }) {
  const { manifest } = args;
  let sites = manifest.sites.map(site => site.name || 'Unnamed');
  sites = ['all', ...sites];
  const name = await cli.prompt.list<string>({ message: 'site', items: sites });
  if (name === 'all') {
    return manifest.sites;
  } else {
    const site = manifest.site.byName(name);
    return site ? [site] : [];
  }
}

async function promptForVersion(args: {
  current: Array<{ version: string; name: string }>;
  versions: string[];
}) {
  const versions = args.versions.map(value => {
    const matches = args.current.filter(item => item.version === value);
    const current =
      matches.length === 0
        ? ''
        : matches.length === 1
        ? matches[0].name
        : matches.map(m => m.name).join(',');
    return {
      name: `${value} ${matches.length > 0 ? `🌼  ${current.toUpperCase()}` : ''}`,
      value,
    };
  });
  return cli.prompt.list<string>({
    message: 'version',
    items: [...versions, '---'],
  });
}
