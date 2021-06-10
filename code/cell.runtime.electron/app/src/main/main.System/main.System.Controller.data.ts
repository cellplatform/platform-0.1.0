import { app, shell } from 'electron';
import { t, rx, log, fs } from '../common';
import { Events } from './main.System.Events';

type Events = ReturnType<typeof Events>;

export function DataController(args: {
  bus: t.EventBus<any>;
  events: Events;
  paths: t.ElectronDataPaths;
}) {
  const { paths } = args;
  const bus = rx.busAsType<t.SystemEvent>(args.bus);
  const events = Events({ bus });

  /**
   * Open path within the host OS shell.
   */
  events.open.path.$.subscribe((e) => shell.openPath(e.path));

  /**
   * Snapshot data.
   */
  events.data.snapshot.$.subscribe((e) => data.snapshot(paths, e));

  /**
   * Reset data.
   */
  events.data.reset.$.subscribe((e) => data.reset(paths, e));

  // Finish up.
  return {};
}

/**
 * Helpers
 */

const data = {
  /**
   * Makes a snapshot of the current data, then resets the app.
   */
  async reset(
    paths: t.ElectronDataPaths,
    options: { openDir?: boolean; reopen?: boolean; quit?: boolean },
  ) {
    const { openDir } = options;
    const { dir } = await data.snapshot(paths, { suffix: 'reset', openDir });
    await Promise.all([fs.remove(paths.db), fs.remove(paths.fs), fs.remove(paths.config)]);
    await shell.openPath(dir);
    if (options.reopen) {
      app.relaunch();
    }
    if (options.quit) {
      app.quit();
    }
  },

  async snapshot(paths: t.ElectronDataPaths, options: { openDir?: boolean; suffix?: string } = {}) {
    await fs.ensureDir(paths.archive);

    // Count number backups.
    const dirnames = (await fs.glob.find(`${paths.archive}/*.zip`))
      .map((path) => fs.basename(path))
      .map((name) => (name.includes('.') ? name.substring(0, name.indexOf('.')) : name))
      .filter((name) => name.match(/^\d*$/)); // NB: Only numbered folder names.
    const count = dirnames.length;

    // Derive next dirname.
    let dirname = count < 1000 ? `0000${count}` : count.toString();
    dirname = count < 1000 ? dirname.substring(dirname.length - 3) : dirname;
    dirname = options.suffix ? `${dirname}.${options.suffix}` : dirname;

    const dir = fs.join(paths.archive, dirname);
    await fs.ensureDir(dir);

    // Copy data.
    const copy = async (source: string) => {
      const target = fs.join(dir, fs.basename(source));
      await fs.copy(source, target);
    };
    await Promise.all([copy(paths.db), copy(paths.fs), copy(paths.config)]);

    // Open the folder.
    if (options.openDir) {
      shell.openPath(paths.archive);
    }

    // Zip the folder.
    const path = `${dir}.zip`;
    await fs.zip(dir).save(path);
    await fs.remove(dir);

    // Finish up.
    log.info();
    log.info(`🌳 Data Snapshot 🌳`);
    log.info(`   path: ${path}`);
    log.info();

    return { dir, path };
  },
};
