import { log, constants, fs, Schema, t } from '../common';

type IConfigFileArgs = {
  dir?: string;
};

export const DEFAULT: t.IConfigFileData = {
  host: '',
  target: '',
};

export const CONFIG = {
  ERROR: {
    TARGET: {
      INVALID_URI: `Target cell URI is invalid (valid example 'cell:<uid>:A1')`,
    },
    HOST: {
      EMPTY: `Domain host not specified`,
    },
  },
};

/**
 * Configuration instructions for a filesystem directory.
 */
export class ConfigFile implements t.IConfigFile {
  public static create(args: IConfigFileArgs = {}) {
    return new ConfigFile(args);
  }

  public static async load(args: IConfigFileArgs) {
    return ConfigFile.create(args).load();
  }

  public static logInvalid(config: t.IConfigFile) {
    const isValid = config.isValid;

    if (!isValid) {
      const cmd = (name: string, alias: string) => {
        return `${log.cyan(name)} (${log.cyan(alias)})`;
      };

      log.warn(`The configuration file is invalid. file: ${config.file}`);
      const errors = config.validate().errors;
      errors.forEach(err => {
        log.info();
        log.info.gray(`${log.red('ERROR')} ${err.message}`);
      });

      log.info();
      log.info.green('Help');
      log.info.gray(`• Use ${cmd('dir --configure', '-c')} to reconfigure the folder`);
    }
    return !isValid;
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IConfigFileArgs) {
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
  public data: t.IConfigFileData;

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
  public async load(): Promise<t.IConfigFile> {
    await fs.ensureDir(fs.dirname(this.file));
    this.exists = await fs.pathExists(this.file);
    if (this.exists) {
      this.data = await fs.file.loadAndParse(this.file);
    }
    return this;
  }

  public async save(data?: t.IConfigFileData): Promise<t.IConfigFile> {
    this.data = { ...(data || this.data) };
    if (!this.validate().isValid) {
      const uri = this.target.uri;
      throw new Error(`Cannot save invalid configuration. [${uri.toString()}]`);
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
