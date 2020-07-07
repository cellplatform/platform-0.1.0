import { IConfigFile } from './types';
import { fs, Uri } from './libs';
import { paths, ENV } from './constants';

/**
 * Configuration data.
 */
export class ConfigFile {
  public static path = paths.data({ prod: ENV.isProd }).config;

  public static default(): IConfigFile {
    return { ns: { appType: '', appData: Uri.toNs().toString() } };
  }

  public static async read(): Promise<IConfigFile> {
    const res = await fs.file.loadAndParse<IConfigFile>(ConfigFile.path);
    return res || ConfigFile.default();
  }

  public static write(data: IConfigFile) {
    return fs.file.stringifyAndSave<IConfigFile>(ConfigFile.path, data);
  }
}
