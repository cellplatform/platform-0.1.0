import { bundler } from '../bundler';
import { Config } from '../config';
import { t, fs, log } from './common';
import * as status from './cmd.status';

type PayloadType = 'MANIFEST' | 'BUNDLE';

/**
 * Push a bundle or manifest to S3.
 */
export async function run(args: { cli: t.ICmdApp; type?: PayloadType; silent?: boolean }) {
  const { cli, silent } = args;
  const config = await Config.create();

  let type = args.type;
  if (type === undefined) {
    type = await cli.prompt.list<PayloadType>({
      message: 'type',
      items: [
        { name: 'bundle', value: 'BUNDLE' },
        { name: 'manifest', value: 'MANIFEST' },
      ],
    });
  }

  if (type === 'MANIFEST') {
    await manifest({ cli, config, silent });
  }

  if (type === 'BUNDLE') {
    await bundle({ cli, config, silent, prompt: true });
  }

  // Finish up.
  if (!args.silent) {
    log.info();
  }
}

/**
 * Push bundle to S3.
 */
export async function bundle(args: {
  cli: t.ICmdApp;
  config?: Config;
  version?: string;
  prompt?: boolean;
  silent?: boolean;
}) {
  const { cli, silent } = args;
  const config = args.config || (await Config.create());
  const bundlesDir = config.builder.bundles;

  const promptForVersion = async () => {
    const paths = await bundler.dir(bundlesDir).semver();
    const versions = paths.map(path => fs.basename(path)).reverse();
    const items = [...versions, '---'];
    const res = await cli.prompt.list<string>({ message: 'bundle version', items });
    return res;
  };

  // Derive the bundle-version to push.
  const version = args.prompt
    ? await promptForVersion()
    : args.version || fs.basename(await bundler.dir(bundlesDir).latest());

  // S3 config.
  const { endpoint, accessKey, secret, bucket } = config.s3;
  const s3 = { endpoint, accessKey, secret };
  const bucketKey = fs.join(config.s3.path.base, config.s3.path.bundles, version);

  // Ensure the bundle exists.
  const bundleDir = fs.resolve(fs.join(bundlesDir, version));
  if (!(await fs.pathExists(bundleDir))) {
    log.error(`\nBundle does not exist.`);
    log.info.gray(bundleDir);
    cli.exit(1);
  }

  // Push.
  await bundler.push({ ...s3, cli }).bundle({
    bundleDir,
    bucket,
    bucketKey,
    silent,
  });

  // Finish up.
  if (!args.silent) {
    log.info();
  }
  return { version, bundleDir };
}

/**
 * Push manifest to S3.
 */
export async function manifest(args: { cli: t.ICmdApp; config?: Config; silent?: boolean }) {
  const { cli, silent } = args;
  const config = args.config || (await Config.create());
  const s3 = config.s3;

  // Push change to S3.
  const bucket = s3.bucket;
  const source = config.manifest.local.path;
  const target = fs.join(s3.path.base, s3.path.manifest);
  await bundler.push({ ...s3.config, cli }).manifest({ bucket, source, target, silent });

  // Finish up.
  if (!silent) {
    const manifest = await config.manifest.s3.pull({ loadBundleManifest: true });
    await status.print({ config, manifest });
  }
}
