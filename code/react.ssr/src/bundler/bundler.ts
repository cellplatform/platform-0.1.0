import { fs, log, time, jsYaml, constants, t, S3, util } from '../common';
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
  await bundleManifest.write({ path: fs.join(dir, constants.PATH.BUNDLE_MANIFEST) });
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

  // Prepare the list of files to push.
  const files = await fs.glob.find(fs.join(bundleDir, '**'));
  const items = files.map(source => {
    const key = fs.join(bucketKey, source.substring(bundleDir.length + 1));
    return { source, key };
  });

  // Log task.
  if (!args.silent) {
    const size = await fs.size.dir(bundleDir);
    log.info();
    log.info.cyan(`Pushing to S3 ☝`);
    log.info();
    log.info.gray(`  size:      ${log.magenta(size.toString())}`);
    log.info.gray(`  dir:       ${bundleDir}`);
    log.info.gray(`  endpoint:  ${bucket.endpoint}`);
    log.info.gray(`  bucket:    ${args.bucket}`);
    log.info();
    for (const item of items) {
      log.info.gray(`   - ${util.formatPath(item.key)}`);
    }
    log.info();
  }

  // Push to S3.
  const putting = items.map(({ source, key }) => bucket.put({ source, key, acl: 'public-read' }));
  await Promise.all(putting);

  if (!args.silent) {
    log.info.gray(`${log.green('pushed')} ${timer.elapsed.toString()}`);
    log.info();
  }
}
