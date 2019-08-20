import { bundler } from '../bundler';
import { Config } from '../config';
import { cli, exec, fs, log, npm, t } from './common';

type Logger = () => void;

/**
 * Bundle script.
 */
export async function run() {
  // Setup initial conditions.
  const config = await Config.create();
  const builder = config.builder;
  // const loggers: Logger[] = [];
  const bundleDir = await bundler.lastDir(fs.resolve(builder.bundles));
  const { endpoint } = config.s3;

  let manifestLogger: Logger | undefined;

  // Prompt user for input.
  await npm.prompt.incrementVersion({ noChange: true, save: true });
  const push = (await cli.prompt.list({ message: 'push to S3', items: ['yes', 'no'] })) === 'yes';

  // Ensure endpoint exists.
  if (push && !endpoint) {
    throw new Error(`The S3 endpoint has not been configured in [ssr.yml].`);
  }

  // Task list.
  const tasks = cli
    .tasks()
    .task('build', async e => execScript(e, 'build'))
    .task('bundle', async e => execScript(e, 'bundle'))
    .task('manifest', async e => {
      const entries = await getEntries(config);
      const res = await bundler.prepare({ bundleDir, entries, silent: true });
      manifestLogger = res.write;
    });

  // Run tasks.
  await tasks.run({ concurrent: false });

  // Push to S3.
  if (push) {
    const { accessKey, secret, bucket } = config.s3;
    const s3 = { endpoint, accessKey, secret };
    const version = fs.basename(bundleDir);
    const bucketKey = fs.join(config.s3.bucketKey, version);
    await bundler.push(s3).bundle({ bundleDir, bucket, bucketKey, silent: false });
  } else {
    if (manifestLogger) {
      manifestLogger();
      log.info();
    }
  }
}

/**
 * [Helpers]
 */

async function execScript(e: cli.TaskArgs, scriptName: string) {
  const pkg = npm.pkg();

  // Ensure the script exists.
  const exists = Boolean(pkg.scripts.bundle);
  if (!exists) {
    e.error(`Package.json does not have a "${scriptName}" script.`);
    return;
  }

  // Run the bundle script.
  await exec.command(`yarn ${scriptName}`).run({ silent: true });
}

const getEntries = async (config: Config) => {
  let path = config.builder.entries;
  if (!path) {
    return [];
  }
  path = fs.resolve(path);
  const err = `Failed to load bundle entries at path: ${path}.`;
  try {
    const res = require(path);
    if (Array.isArray(res.default)) {
      return res.default as t.IBundleEntryElement[];
    }
    log.error(`${err} Ensure the array is exported as the module default.`);
    return [];
  } catch (error) {
    log.error(`${err} ${error.message}`);
    return [];
  }
};
