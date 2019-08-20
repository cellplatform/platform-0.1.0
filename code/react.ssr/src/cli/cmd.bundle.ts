import { bundler } from '../bundler';
import { Config } from '../config';
import { cli, exec, fs, log, npm, t } from './common';
import * as pushBundle from './cmd.pushBundle';

/**
 * Bundle script.
 */
export async function run() {
  // Setup initial conditions.
  const config = await Config.create();
  const { endpoint } = config.s3;
  let manifest: t.IBundleManifest | undefined;

  // Prompt user for version.
  const version = await npm.prompt.incrementVersion({ noChange: true, save: true });
  const bundleDir = fs.resolve(fs.join(config.builder.bundles, version));

  // Prompt the user whether to push to S3.
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
      // manifestLogger = res.write;
      manifest = res.manifest;
    });

  // Run tasks.
  await tasks.run({ concurrent: false });

  // Push to S3.
  if (push) {
    await pushBundle.run({ version });
  } else if (manifest) {
    bundler.log.bundle({ dir: bundleDir, manifest });
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
