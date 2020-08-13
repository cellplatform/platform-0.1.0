import { app, MenuItemConstructorOptions as M, shell } from 'electron';
import { t, fs } from '../common';

/**
 * Menu for working with debug tools.
 */
export function debug(args: { paths: t.IAppPaths }): M {
  const { paths } = args;
  const item: M = {
    label: 'Debug',
    submenu: [
      {
        label: 'Data',
        submenu: [
          {
            label: 'Open Folder',
            click: () => shell.openPath(paths.dir),
          },
          {
            label: 'Snapshot',
            click: () => data.snapshot(paths, { openDir: true }),
          },
          {
            label: 'Archive and Reset',
            click: () => data.reset(paths, { openDir: true, reopen: true, quit: true }),
          },
        ],
      },
    ],
  };

  return item;
}

/**
 * Helpers
 */

const data = {
  /**
   * Makes a snapshot of the current data, then resets the app.
   */
  async reset(
    paths: t.IAppPaths,
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

  async snapshot(paths: t.IAppPaths, options: { openDir?: boolean; suffix?: string } = {}) {
    await fs.ensureDir(paths.archive);

    // Count number of folders.
    const dirnames = (await fs.glob.find(`${paths.archive}/*/`))
      .map((path) => fs.basename(path))
      .filter((name) => name.match(/^\d*$/)); // NB: Only number folders
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
      shell.openPath(dir);
    }
    return { dir };
  },
};
