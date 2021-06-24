import { ENV, paths } from './constants';
import { fs, R, semver, time, Uri } from './libs';
import * as t from './types';

/**
 * Configuration data.
 */
export const ConfigFile = {
  path: paths.data({ prod: ENV.isProd }).config,

  get process() {
    const { name, version } = ENV.pkg;
    return `${name}@${version}`;
  },

  /**
   * Generate a new "default" configuration file.
   */
  default(): t.ElectronConfigFile {
    const { name, version } = ENV.pkg;
    return {
      refs: { genesis: Uri.toNs().toString() },
      created: getIdentifierLogItem(),
      started: [],
    };
  },

  /**
   * Retrieve the URI of the genesis cell.
   */
  async genesisUri() {
    const config = await ConfigFile.read();
    return Uri.create.cell(config.refs.genesis, 'A1');
  },

  /**
   * Read the configuration file from disk.
   */
  async read(): Promise<t.ElectronConfigFile> {
    const path = ConfigFile.path;

    let file = await fs.file.loadAndParse<t.ElectronConfigFile>(path);
    if (file) return file;

    file = ConfigFile.default();
    await ConfigFile.write(file);
    return file;
  },

  /**
   * Write the configuration file to disk.
   */
  write(data: t.ElectronConfigFile) {
    const path = ConfigFile.path;
    return fs.file.stringifyAndSave<t.ElectronConfigFile>(path, data);
  },

  /**
   * Appends the startup log.
   */
  log: {
    async updateStarted() {
      const file = await ConfigFile.read();
      const started = [...(file.started ?? [])];

      const now = (() => {
        const item = getIdentifierLogItem();
        return { item, process: parseProcess(item.process) };
      })();
      const append = () => started.push(now.item);

      const last = started[started.length - 1]
        ? parseProcess(started[started.length - 1].process)
        : undefined;

      /**
       * Save the latest time (if the current version hasn't changed) or append the
       * log with the newer version if a new version is opening the data folder.
       */
      if (!last) append();
      if (last) {
        if (semver.eq(now.process.version, last.version)) {
          // Remove last item so "current" started time is updated for the last item at this version (but not appended).
          started.pop();
        }
        append();
      }

      const next = { ...file, started };
      const changed = !R.equals(file, next);
      if (changed) await ConfigFile.write(next);

      // Finish up.
      return { changed, started };
    },
  },
};

/**
 * [Helpers]
 */
function getIdentifierLogItem(): t.ElectronRuntimeIdentifierLogItem {
  return {
    process: ConfigFile.process,
    time: time.now.timestamp,
  };
}

function parseProcess(input: string) {
  const [runtime, version] = input.split('@');
  return { runtime, version };
}
