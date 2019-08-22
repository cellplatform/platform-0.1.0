import { Config } from '../config';
import { Manifest } from '../manifest';
import { cli, log } from './common';

/**
 * Print status summary of the manifest.
 */
export async function run() {
  const config = await Config.create();
  let manifest: Manifest | undefined;

  // Pull data from cloud.
  log.info();
  await cli
    .tasks()
    .task('pull manifest', async e => {
      manifest = await config.manifest.s3.get({ force: true, loadBundleManifest: true });
    })
    .run({ concurrent: true });

  // Ensure the local manifest is up-to-date.
  if (!manifest) {
    log.error(`Manifest could not be found.`);
    return cli.exit(1);
  }

  log.info();

  log.info.gray(`url:    ${config.manifest.s3.url}`);
  log.info.gray(`local:  ${config.manifest.local.path}`);
  log.info();

  manifest.sites.forEach(site => {
    const { name, version, size } = site;
    const domain = site.domain.join(', ');
    log.info(name);
    log.info.gray(` - version:   ${log.cyan(version)}`);
    log.info.gray(` - size:      ${size}`);
    log.info.gray(` - domain:    ${domain}`);
    log.info();
  });
}
