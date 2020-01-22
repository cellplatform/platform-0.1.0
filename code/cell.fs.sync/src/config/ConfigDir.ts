import { t, fs, constants, Schema, util } from '../common';

export type IConfigDirArgs = {
  dir?: string;
};

export const DEFAULT: t.IFsConfigDirData = {
  host: '',
  target: '',
};

export const CONFIG = {
  ERROR: {
    TARGET: {
      INVALID_URI: `Target cell URI is invalid (valid example 'cell:ck499h7u30000fwet3k7085t1!A1')`,
    },
    HOST: {
      EMPTY: `Domain host not specified`,
    },
  },
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
    this.dir = fs.resolve(args.dir || __dirname);
    this.file = fs.join(this.dir, '.cell/config.yml');
    this.data = { ...DEFAULT };
  }

  /**
   * [Fields]
   */
  public readonly dir: string;
  public readonly file: string;
  public exists: boolean | null = null;
  public data: t.IFsConfigDirData;

  /**
   * [Properties]
   */
  public get target() {
    const host = this.data.host;
    const uri = Schema.uri.parse<t.ICellUri>(this.data.target);

    const toUrl = () => {
      try {
        return Schema.urls(host)
          .cell(uri.toString())
          .files.list.toString();
      } catch (error) {
        return '';
      }
    };

    return { uri, url: toUrl() };
  }

  public get isValid() {
    return this.validate().isValid;
  }

  /**
   * [Methods]
   */
  public async load(): Promise<t.IFsConfigDir> {
    await fs.ensureDir(fs.dirname(this.file));
    this.exists = await fs.pathExists(this.file);
    if (this.exists) {
      this.data = await fs.file.loadAndParse(this.file);
    }
    return this;
  }

  public async save(data?: t.IFsConfigDirData): Promise<t.IFsConfigDir> {
    this.data = { ...(data || this.data) };
    if (!this.validate().isValid) {
      throw new Error(`Cannot save invalid configuration.`);
    }
    await fs.file.stringifyAndSave(this.file, this.data);
    this.exists = true;
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
      const type = constants.ERROR.HTTP.CONFIG;
      const error: t.IError = { type, message };
      res.errors.push(error);
      return res;
    };

    const target = this.target.uri;
    if (!target.ok || target.parts.type !== 'CELL') {
      error(CONFIG.ERROR.TARGET.INVALID_URI);
    }
    if (target.error) {
      error(`Target problem: ${target.error.message}`);
    }

    if (!(data.host || '').trim()) {
      error(CONFIG.ERROR.HOST.EMPTY);
    }

    return res;
  }
}
