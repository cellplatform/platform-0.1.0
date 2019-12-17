import { t, fs, ERROR, Schema } from '../common';

export type IConfigDirArgs = {
  dir?: string;
};

export const DEFAULT: t.IFsConfigDirData = {
  host: '',
  target: '',
};

/**
 * Configuration instructions for a filesystem directory.
 */
export class ConfigDir implements t.IFsConfigDir {
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
  public data: t.IFsConfigDirData;

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

  public async save(data?: t.IFsConfigDirData) {
    this.data = data || this.data;
    await fs.file.stringifyAndSave(this.file, this.data);
    return this;
  }

  public validate() {
    const data = this.data;
    const res: t.IHttpConfigValidation = {
      errors: [],
      get isValid() {
        return res.errors.length === 0;
      },
    };

    const error = (message: string) => {
      const error: t.IError = { type: ERROR.HTTP.CONFIG, message };
      res.errors.push(error);
      return res;
    };

    const target = Schema.uri.parse(data.target);
    if (!target.ok || target.parts.type !== 'CELL') {
      error(`Target must be a cell URI.`);
    }

    if (!(data.host || '').trim()) {
      error(`Host not specified.`);
    }

    return res;
  }
}
