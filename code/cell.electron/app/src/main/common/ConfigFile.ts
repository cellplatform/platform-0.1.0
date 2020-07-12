import { ENV, paths } from './constants';
import { fs, Uri } from './libs';
import { IConfigFile } from './types';

/**
 * Configuration data.
 */
export class ConfigFile {
  public static path = paths.data({ prod: ENV.isProd }).config;

  public static default(): IConfigFile {
    return { ns: { appType: '', appData: Uri.toNs().toString() } };
  }

  public static async read(): Promise<IConfigFile> {
    const path = ConfigFile.path;
    return (await fs.file.loadAndParse<IConfigFile>(path)) || ConfigFile.default();
  }

  public static write(data: IConfigFile) {
    const path = ConfigFile.path;
    return fs.file.stringifyAndSave<IConfigFile>(path, data);
  }
}
