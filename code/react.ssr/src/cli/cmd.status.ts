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
    .task('pull latest manifest', async e => {
      manifest = await config.manifest.local.ensureLatest({ minimal: true });
    })
    .run({ concurrent: true });

  // Ensure the local manifest is up-to-date.
  if (!manifest) {
    log.error(`Manifest could not be found.`);
    return cli.exit(1);
  }

  log.info();

  console.log('manifest', manifest);

  // Finish up.
  log.info();
}
