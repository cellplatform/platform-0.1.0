import { bundler } from '../bundler';
import { Config } from '../config';
import { cli, exec, fs, log, npm, t } from './common';
import * as push from './cmd.push';

/**
 * Bundle script.
 */
export async function run(args: { config?: Config; version?: string; push?: boolean } = {}) {
  // Setup initial conditions.
  const config = args.config || (await Config.create());
  const { endpoint } = config.s3;
  let manifest: t.IBundleManifest | undefined;

  // Prompt user for version.
  const version =
    args.version || (await npm.prompt.incrementVersion({ noChange: true, save: true }));
  const bundleDir = fs.resolve(fs.join(config.builder.bundles, version));

  // Load the NPM package closest to the bundle.
  const pkgPath = await fs.ancestor(bundleDir).first('package.json');
  const pkg = npm.pkg(pkgPath);
  log.info.gray(fs.dirname(pkgPath));

  // Prompt the user whether to push to S3.
  const isPush =
    args.push !== undefined
      ? args.push
      : (await cli.prompt.list({ message: 'push to S3', items: ['yes', 'no'] })) === 'yes';

  // Ensure end-point exists.
  if (isPush && !endpoint) {
    throw new Error(`The S3 endpoint has not been configured in [ssr.yml].`);
  }

  // Task list.
  log.info();
  const tasks = cli
    .tasks()
    .task('build', async e => execScript(pkg, e, 'build'))
    .task('bundle', async e => execScript(pkg, e, 'bundle'))
    .skip('manifest', async e => {
      const entries = await getEntries(config);
      const res = await bundler.prepare({ bundleDir, entries, silent: true });
      manifest = res.manifest;
    });

  // Run tasks.
  await tasks.run({ concurrent: false });

  // Push to S3.
  if (isPush) {
    await push.bundle({ config, version });
  } else if (manifest) {
    bundler.log.bundle({ bundleDir, manifest });
  }

  // Finish up.
  log.info();
}

/**
 * [Helpers]
 */

async function execScript(pkg: npm.NpmPackage, e: cli.TaskArgs, scriptName: string) {
  // Ensure the script exists.
  const exists = Boolean(pkg.scripts.bundle);
  if (!exists) {
    e.error(`Package.json does not have a "${scriptName}" script.`);
    return;
  }

  // Run the bundle script.
  const cwd = pkg.dir;
  await exec.command(`yarn ${scriptName}`).run({ cwd, silent: true });
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
