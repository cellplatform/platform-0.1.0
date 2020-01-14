import { Config } from '../config';
import { Manifest } from '../manifest';
import { t, log } from './common';

/**
 * Print status summary of the manifest.
 */
export async function run(args: { cli: t.ICmdApp; config?: Config }) {
  const { cli } = args;
  const config = args.config || (await Config.create());
  let manifest: Manifest | undefined;

  // Pull data from cloud.
  log.info();
  await cli
    .task('pull manifest', async e => {
      manifest = await config.manifest.s3.pull({ force: true, loadBundleManifest: true });
    })
    .run({ concurrent: true });

  // Ensure the local manifest is up-to-date.
  if (!manifest) {
    log.error('\nManifest could not be found.');
    log.info.gray(config.manifest.s3.url);
    return cli.exit(1);
  }

  // Log output.
  await print({ config, manifest });
}

/**
 * Print the status of the given manifest
 */
export async function print(args: { config: Config; manifest: Manifest }) {
  const { config, manifest } = args;
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
