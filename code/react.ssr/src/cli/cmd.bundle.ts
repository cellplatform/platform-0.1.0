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
  const loggers: Logger[] = [];

  // Increment the package version.
  await npm.prompt.incrementVersion({ noChange: true, save: true });

  // Run bundling tasks.
  await cli
    .tasks()
    .task('build', async e => execScript(e, 'build'))
    .task('bundle', async e => execScript(e, 'bundle'))
    .task('manifest', async e => {
      const getEntries = async () => {
        let path = builder.entries;
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

      const entries = await getEntries();
      const bundleDir = await bundler.lastDir(fs.resolve(builder.bundles));
      const res = await bundler.prepare({ bundleDir, entries, silent: true });
      loggers.push(res.write);
    })
    .run({ concurrent: false });

  // Log any output from tasks.
  loggers.forEach(fn => {
    fn();
    log.info();
  });
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
