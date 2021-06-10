import { ENV, paths } from './constants';
import { fs, Uri, time } from './libs';
import { ElectronConfigFile } from './types';

/**
 * Configuration data.
 */
export class ConfigFile {
  public static path = paths.data({ prod: ENV.isProd }).config;

  /**
   * Generate a new "default" configuration file.
   */
  public static default(): ElectronConfigFile {
    const { name, version } = ENV.pkg;
    return {
      created: {
        process: `${name}@${version}`,
        time: time.now.timestamp,
      },
      refs: { genesis: Uri.toNs().toString() },
    };
  }

  /**
   * Read the configuration file from disk.
   */
  public static async read(): Promise<ElectronConfigFile> {
    const path = ConfigFile.path;

    let file = await fs.file.loadAndParse<ElectronConfigFile>(path);
    if (file) return file;

    file = ConfigFile.default();
    await ConfigFile.write(file);
    return file;
  }

  /**
   * Write the configuration file to disk.
   */
  public static write(data: ElectronConfigFile) {
    const path = ConfigFile.path;
    return fs.file.stringifyAndSave<ElectronConfigFile>(path, data);
  }
}
