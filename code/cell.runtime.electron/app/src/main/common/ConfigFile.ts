import { ENV, paths } from './constants';
import { fs, Uri, time } from './libs';
import { IConfigFile } from './types';

/**
 * Configuration data.
 */
export class ConfigFile {
  public static path = paths.data({ prod: ENV.isProd }).config;

  /**
   * Generate a new "default" configuration file.
   */
  public static default(): IConfigFile {
    const { name, version } = ENV.pkg;
    return {
      created: { by: `${name}@${version}`, at: time.now.timestamp },
      refs: { genesis: Uri.toNs().toString() },
    };
  }

  /**
   * Read the configuration file from disk.
   */
  public static async read(): Promise<IConfigFile> {
    const path = ConfigFile.path;

    let file = await fs.file.loadAndParse<IConfigFile>(path);
    if (file) return file;

    file = ConfigFile.default();
    await ConfigFile.write(file);
    return file;
  }

  /**
   * Write the configuration file to disk.
   */
  public static write(data: IConfigFile) {
    const path = ConfigFile.path;
    return fs.file.stringifyAndSave<IConfigFile>(path, data);
  }
}
