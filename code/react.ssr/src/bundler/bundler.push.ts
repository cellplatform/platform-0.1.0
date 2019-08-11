import { fs, Listr, log, S3, time, util } from '../common';

/**
 * Pushes the specified bundle to S3
 */
export async function bundle(args: {
  s3: S3;
  bundleDir: string;
  bucket: string;
  bucketKey: string;
  silent?: boolean;
}) {
  const { bucketKey } = args;
  const timer = time.timer();
  const bucket = args.s3.bucket(args.bucket);
  const bundleDir = fs.resolve(args.bundleDir);

  // Calculate the list of files to push.
  const files = await fs.glob.find(fs.join(bundleDir, '**'));
  const items = files.map(source => {
    const key = fs.join(bucketKey, source.substring(bundleDir.length + 1));
    return { source, key };
  });

  // Log activity.
  if (!args.silent) {
    const { formatPath } = util;
    const size = await fs.size.dir(bundleDir);
    const endpoint = fs.join(bucket.endpoint, args.bucket, args.bucketKey);
    log.info();
    log.info.cyan(`Pushing bundle to S3 ☝`);
    log.info();
    log.info.gray(`  size:  ${log.magenta(size.toString())}`);
    log.info.gray(`  from:  ${formatPath(bundleDir)}`);
    log.info.gray(`  to:    ${formatPath(endpoint)}`);
    log.info();
  }

  // Push to S3.
  const renderer = args.silent ? 'silent' : undefined;
  const tasks = new Listr(
    items.map(item => {
      const { source, key } = item;
      return {
        title: item.key.substring(args.bucketKey.length + 1),
        task: () => bucket.put({ source, key, acl: 'public-read' }),
      };
    }),
    { concurrent: true, renderer },
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

/**
 * Pushes the overall manifest to S3
 */
export async function manifest(args: {
  s3: S3;
  bucket: string;
  source: string;
  target: string;
  silent?: boolean;
}) {
  const timer = time.timer();
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
    log.error(`Failed while pushing to S3`);
    log.warn(error.message);
    log.info();
  }

  if (!args.silent) {
    log.info();
    log.info.gray(`${log.green('done')} ${timer.elapsed.toString()}`);
    log.info();
  }
}
