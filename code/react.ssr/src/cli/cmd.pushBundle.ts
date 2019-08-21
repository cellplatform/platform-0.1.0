import { bundler } from '../bundler';
import { Config } from '../config';
import { cli, fs } from './common';

/**
 * Push a bundle to S3.
 */
export async function run(options: { version?: string; prompt?: boolean; silent?: boolean } = {}) {
  const { silent } = options;
  const config = await Config.create();
  const bundlesDir = config.builder.bundles;

  const promptForVersion = async () => {
    const paths = await bundler.dir(bundlesDir).semver();
    const items = paths.map(path => fs.basename(path)).reverse();
    const res = await cli.prompt.list<string>({ message: 'bundle version', items });
    return res;
  };

  // Derive the bundle-version to push.
  const version = options.prompt
    ? await promptForVersion()
    : options.version || fs.basename(await bundler.dir(bundlesDir).latest());

  // S3 config.
  const { endpoint, accessKey, secret, bucket } = config.s3;
  const s3 = { endpoint, accessKey, secret };
  const bucketKey = fs.join(config.s3.path.bundles, version);

  // Push.
  const bundleDir = fs.resolve(fs.join(bundlesDir, version));
  await bundler.push(s3).bundle({ bundleDir, bucket, bucketKey, silent });

  // Finish up.
  return { version, bundleDir };
}
