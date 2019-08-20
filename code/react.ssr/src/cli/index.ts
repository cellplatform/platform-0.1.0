import { log, time, fs, exec, cli, npm, t } from './common';
import { bundler } from '../bundler';
import { Config } from '../config';

const app = cli.create('ssr');

app
  /**
   * Status.
   */
  .command(
    ['status', 's'],
    'Current status of the service.',
    yargs => {
      return yargs;
    },
    async argv => {
      log.info('status', argv);
    },
  )

  /**
   * Bundle.
   */
  .command(
    ['bundle', 'b'],
    'Bundles and prepare javascript.',
    yargs => {
      return yargs;
    },
    async argv => {
      type Logger = () => void;

      // Setup initial conditions.
      const config = await Config.create();
      const builder = config.builder;
      const loggers: Logger[] = [];

      // Increment the package version.
      await npm.prompt.incrementVersion({ noChange: true, save: true });

      // Run bundling tasks.
      await app
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
              log.error(err);
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
    },
  );

/**
 * Run
 */
app.run();

/**
 * [Helpers]
 */

async function execScript(e: cli.TaskArgs, scriptName: string) {
  const pkg = npm.pkg();
  const exists = Boolean(pkg.scripts.bundle);
  if (!exists) {
    e.error(`Package.json does not have a "${scriptName}" script.`);
    return;
  }

  // Run the bundle script.
  await exec.command(`yarn ${scriptName}`).run({ silent: true });
}
