import { fs, Listr, log, S3, t, util } from '../common';

type IBundleArgs = {
  bundleDir: string;
  bucket: string;
  bucketKey: string;
  silent?: boolean;
};

type IManifestArgs = { bucket: string; source: string; target: string; silent?: boolean };

/**
 * Push API.
 */
export function push(args: t.IS3Config) {
  const s3 = fs.s3(args);
  return {
    bundle: (args: IBundleArgs) => bundle({ ...args, s3 }),
    manifest: (args: IManifestArgs) => manifest({ ...args, s3 }),
  };
}

/**
 * Pushes the specified bundle to S3.
 */
export async function bundle(args: {
  s3: S3;
  bundleDir: string;
  bucket: string;
  bucketKey: string;
  silent?: boolean;
}) {
  const bucket = args.s3.bucket(args.bucket);
  const bundleDir = fs.resolve(args.bundleDir);

  // Ensure the key is not prepended with the bucket name.
  const bucketKey = args.bucketKey.replace(new RegExp(`^${args.bucket}\/`), '');

  // Calculate the list of files to push.
  const files = await fs.glob.find(fs.join(bundleDir, '**'));
  const items = files.map(source => {
    const key = fs.join(bucketKey, source.substring(bundleDir.length + 1));
    return { source, key };
  });

  // Log activity.
  if (!args.silent) {
    const { formatPath } = util;
    const version = fs.basename(bundleDir);
    const size = await fs.size.dir(bundleDir);
    const endpoint = fs.join(bucket.endpoint, args.bucket, args.bucketKey);
    log.info();
    log.info.cyan(`Pushing bundle ${log.white(version)} to S3 ☝`);
    log.info();
    log.info.gray(`  size:  ${log.magenta(size.toString())}`);
    log.info.gray(`  from:  ${formatPath(bundleDir)}`);
    log.info.gray(`  to:    ${formatPath(endpoint)}`);
    log.info();
  }

  // Push to S3.
  const dirSize = await fs.size.dir(bundleDir);
  const renderer = args.silent ? 'silent' : undefined;
  const tasks = new Listr(
    items.map(item => {
      const { source, key } = item;
      const file = fs.basename(key);
      const fileSize = dirSize.files.find(item => item.path.endsWith(`/${file}`));
      let size = fileSize ? fileSize.toString({ round: 0, spacer: '' }) : '';
      size = `${size}        `.substring(0, 8);
      return {
        title: `${size} ${file}`,
        task: async () => {
          const res = await bucket.put({ source, key, acl: 'public-read' });
          if (!res.ok) {
            throw res.error;
          }
        },
      };
    }),
    { concurrent: true, renderer, exitOnError: false },
  );
  try {
    await tasks.run();
  } catch (error) {
    log.error(`\nFailed while pushing to S3.\n`);
    process.exit(1);
  }

  // Finish up.
  return {
    bucket: args.bucket,
    endpoint: bucket.endpoint,
    s3: items,
    manifest,
  };
}

/**
 * Pushes the overall manifest to S3.
 */
export async function manifest(args: {
  s3: S3;
  bucket: string;
  source: string;
  target: string;
  silent?: boolean;
}) {
  const source = fs.resolve(args.source);
  const bucket = args.s3.bucket(args.bucket);

  const filename = fs.basename(source);
  let target = args.target;
  target = target.endsWith(filename) ? target : fs.join(target, filename);

  // Log activity.
  if (!args.silent) {
    const { formatPath } = util;
    const size = await fs.size.file(source);
    const endpoint = fs.join(bucket.endpoint, args.bucket, target);
    log.info();
    log.info.cyan(`Pushing manifest to S3 ☝`);
    log.info();
    log.info.gray(`  size:  ${log.magenta(size.toString())}`);
    log.info.gray(`  from:  ${formatPath(source)}`);
    log.info.gray(`  to:    ${formatPath(endpoint)}`);
    log.info();
  }

  // Push to S3.
  const renderer = args.silent ? 'silent' : undefined;
  const tasks = new Listr(
    [
      {
        title: fs.basename(source),
        task: async () => bucket.put({ source, key: target, acl: 'public-read' }),
      },
    ],
    { renderer },
  );
  try {
    await tasks.run();
  } catch (error) {
    log.error(`\nFailed while pushing to S3.\n`);
    process.exit(1);
  }
}
