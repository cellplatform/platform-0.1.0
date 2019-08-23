import { Config } from '../config';
import { Manifest } from '../manifest';
import { cli, log } from './common';

/**
 * Pull latest manifest.
 */
export async function run() {
  const config = await Config.create();
  let manifest: Manifest | undefined;

  // Pull data from cloud.
  log.info();
  await cli
    .tasks()
    .task('pull manifest', async e => {
      manifest = await config.manifest.local.ensureLatest({ minimal: true });
    })
    .run({ concurrent: true });
  log.info();

  if (!manifest) {
    log.error('\nManifest could not be found.');
    log.info.gray(config.manifest.s3.url);
    return cli.exit(1);
  }

  // Ensure the local manifest is up-to-date.
  log.info.gray(`  url:   ${manifest.baseUrl}`);
  log.info.gray(`  local: ${config.manifest.local.path}`);
  log.info();
}
