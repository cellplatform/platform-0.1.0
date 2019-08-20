import { log, time, fs, exec, cli, npm } from './common';

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
      // Increment the package version.
      const version = await npm.prompt.incrementVersion({ noChange: true, save: true });

      app
        .task('Bundle javascript', async e => {
          // Ensure the script exists.
          const pkg = npm.pkg();
          if (!pkg.scripts.bundle) {
            return e.error('Package.json does not have a "bundle" script.');
          }

          // Run the bundle script.
          const cmd = exec.command('yarn bundle').run({ silent: true });
          cmd.output$.subscribe(args => e.message(args.text));
          await cmd;
        })
        .task('Prepare bundle manifest', async e => {
          // TEMP 🐷 - ensure package.json has a `bundle`.
          /**
           * - entries
           */
          return true;
        })
        .run({ concurrent: false });
    },
  );

/**
 * Run
 */
app.run();
