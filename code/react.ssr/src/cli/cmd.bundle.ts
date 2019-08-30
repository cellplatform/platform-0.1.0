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

  // Load the NPM package closest to the bundle.
  await fs.ensureDir(config.builder.bundles);
  const pkgPath = await fs.ancestor(config.builder.bundles).first('package.json');
  const pkg = npm.pkg(pkgPath);
  log.info.gray(fs.dirname(pkgPath));
  log.info();

  // Prompt user for version.
  const version =
    args.version ||
    (await npm.prompt.incrementVersion({ path: pkgPath, noChange: true, save: true }));
  const bundleDir = fs.resolve(fs.join(config.builder.bundles, version));

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
    .task('manifest', async e => {
      const { entries, error } = await getEntries(config);
      if (error) {
        throw error;
      } else {
        const res = await bundler.prepare({ bundleDir, entries, silent: true });
        manifest = res.manifest;
      }
    });

  // Run tasks.
  const res = await tasks.run({ concurrent: false, exitOnError: true });
  if (!res.ok) {
    // Task(s) failed.
    log.info();
    res.errors.forEach(item => {
      log.error(`ERROR ${item.title}`);
      log.warn(item.error);
      log.info();
    });
    return cli.exit(1);
  }

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
  const res = await exec.command(`yarn ${scriptName}`).run({ cwd, silent: true });

  // Ensure the command completed successfully.
  if (!res.ok) {
    throw new Error(`Failed while executing '${scriptName}' script of package '${pkg.name}'`);
  }
}

const getRootDir = async (source: string) => {
  let path = '';
  await fs.ancestor(source).walk(async e => {
    if ((await fs.readdir(e.dir)).includes('package.json')) {
      return e.stop();
    } else {
      path = e.dir;
    }
  });
  return path;
};

// type EntriesResponse = { entries: bundler.IBundleEntryElement[]; error?: Error };

const getEntries = async (config: Config) => {
  const done = (entries: bundler.IBundleEntryElement[], errorMessage?: string) => {
    const error = errorMessage ? new Error(errorMessage) : undefined;
    return { ok: !Boolean(error), entries, error };
  };

  let source = config.builder.entries;
  if (!source) {
    return done([]);
  }

  // Copy the source libs locally.
  // NB: This is necessary to ensure the [require] import works correctly.
  source = fs.resolve(source);

  const sourceRoot = await getRootDir(source);
  const sourcePath = source.substring(sourceRoot.length);
  const localRoot = fs.resolve(`tmp/${fs.basename(sourceRoot)}`);
  const localPath = fs.join(localRoot, sourcePath);

  await fs.ensureDir(fs.dirname(localRoot));
  await fs.remove(localRoot);
  await fs.copy(sourceRoot, localRoot);

  // Import the entry react element(s).
  const err = `Failed to load bundle entries at path: ${source}.`;
  try {
    const res = require(localPath);
    if (Array.isArray(res.default)) {
      return done(res.default);
    }
    return done([], `${err} Ensure the array is exported as the module default.`);
  } catch (error) {
    return done([], `${err} ${error.message}`);
  } finally {
    // Clean up.
    await fs.remove(fs.resolve('tmp'));
  }
};
