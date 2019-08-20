import { bundler } from '../bundler';
import { Config } from '../config';
import { cli, exec, fs, log, npm, t } from './common';

/**
 * Push a bundle to S3.
 */
export async function run(options: { version?: string; silent?: boolean } = {}) {
  const { silent } = options;
  const config = await Config.create();

  // Source.
  const bundlesDir = config.builder.bundles;
  const version = options.version || fs.basename(await bundler.lastDir(bundlesDir));
  const bundleDir = fs.resolve(fs.join(config.builder.bundles, version));

  // S3 config.
  const { endpoint, accessKey, secret, bucket } = config.s3;
  const s3 = { endpoint, accessKey, secret };
  const bucketKey = fs.join(config.s3.bucketKey, version);

  // Push.
  await bundler.push(s3).bundle({ bundleDir, bucket, bucketKey, silent });
}
