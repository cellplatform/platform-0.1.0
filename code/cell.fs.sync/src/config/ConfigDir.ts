import { t, fs } from '../common';

export type IConfigDirArgs = {
  dir?: string;
};

export const DEFAULT: t.IConfigDir = {
  host: '',
  ns: '',
};

/**
 * Configuration instructions for a filesystem directory.
 */
export class ConfigDir {
  public static create(args: IConfigDirArgs = {}) {
    return new ConfigDir(args);
  }

  public static async load(args: IConfigDirArgs) {
    return ConfigDir.create(args).load();
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IConfigDirArgs) {
    this.dir = fs.join(fs.resolve(args.dir || __dirname), '.cell');
    this.file = fs.join(this.dir, 'config.yml');
    this.data = DEFAULT;
  }

  /**
   * [Fields]
   */
  public readonly dir: string;
  public readonly file: string;
  public data: t.IConfigDir;

  /**
   * [Methods]
   */
  public async load() {
    await fs.ensureDir(this.dir);
    if (!(await fs.pathExists(this.file))) {
      this.data = DEFAULT;
      await this.save();
    } else {
      this.data = await fs.file.loadAndParse(this.file);
    }
    return this;
  }

  public async save(data?: t.IConfigDir) {
    await fs.file.stringifyAndSave(this.file, data || this.data);
    return this;
  }
}
