import { constants, fs, Listr, log, S3, time, util } from '../common';
import * as bundleManifest from './bundleManifest';

/**
 * Prepares a bundle for publishing.
 */
export async function prepare(args: { bundleDir: string }) {
  const dir = fs.resolve(args.bundleDir);
  if (!(await fs.pathExists(dir))) {
    throw new Error(`Cannot prepare, the directory does not exist. ${dir}`);
  }

  // Write a YAML file describing the contents of the bundle.
  const path = fs.join(dir, constants.PATH.BUNDLE_MANIFEST);
  const manifest = await bundleManifest.write({ path });

  // Finish up.
  return { bundle: dir, manifest };
}

/**
 * Pushes the specified bundle to S3
 */
export async function push(args: {
  s3: S3;
  bucket: string;
  bundleDir: string;
  bucketKey: string;
  silent?: boolean;
}) {
  const { bucketKey } = args;
  const bucket = args.s3.bucket(args.bucket);
  const bundleDir = fs.resolve(args.bundleDir);
  const timer = time.timer();

  // Prepare the bundle.
  const { manifest } = await prepare({ bundleDir });

  // Calculate the list of files to push.
  const files = await fs.glob.find(fs.join(bundleDir, '**'));
  const items = files.map(source => {
    const key = fs.join(bucketKey, source.substring(bundleDir.length + 1));
    return { source, key };
  });

  // Log task.
  if (!args.silent) {
    const { formatPath } = util;
    const size = await fs.size.dir(bundleDir);
    const endpoint = fs.join(bucket.endpoint, args.bucket, args.bucketKey);
    log.info();
    log.info.cyan(`Pushing to S3 ☝`);
    log.info();
    log.info.gray(`  size:   ${log.magenta(size.toString())}`);
    log.info.gray(`  from:   ${formatPath(bundleDir)}`);
    log.info.gray(`  to:     ${formatPath(endpoint)}`);
    log.info();
  }

  // Push to S3.
  const tasks = new Listr(
    items.map(item => {
      const { source, key } = item;
      return {
        title: item.key.substring(args.bucketKey.length + 1),
        task: () => bucket.put({ source, key, acl: 'public-read' }),
      };
    }),
    { concurrent: true, renderer: args.silent ? 'silent' : undefined },
  );

  try {
    await tasks.run();
  } catch (error) {
    log.error(`Failed while pushing to S3`);
    log.warn(error.message);
    log.info();
  }

  if (!args.silent) {
    log.info();
    log.info.gray(`${log.green('done')} ${timer.elapsed.toString()}`);
    log.info();
  }

  // Finish up.
  return {
    bucket: args.bucket,
    endpoint: bucket.endpoint,
    s3: items,
    manifest,
  };
}
