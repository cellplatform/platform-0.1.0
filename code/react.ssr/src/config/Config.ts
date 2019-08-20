import * as dotenv from 'dotenv';
import { t, fs } from '../common';

dotenv.config();

/**
 * A parser for the `ssr.yml` configuration file.
 */
export class Config {
  /**
   * [Lifecycle]
   */
  public static create = async (options: { path?: string } = {}) => {
    const path = fs.resolve(options.path || './ssr.yml');
    if (!(await fs.pathExists(path))) {
      throw new Error(`An "ssr.yml" configuration file does not exist at: ${path}`);
    }

    const def = await fs.file.loadAndParse<t.ISsrConfig>(path);

    return new Config({ def });
  };
  private constructor(args: { def: t.ISsrConfig }) {
    this.def = args.def;
  }

  /**
   * [Fields]
   */
  private readonly def: t.ISsrConfig;

  /**
   * [Properties]
   */
  public get builder() {
    const builder = this.def.builder || {};
    builder.bundles = builder.bundles || 'bundles';
    builder.entries = builder.entries || '';
    return builder;
  }

  public get s3() {
    const def = this.def;
    const toValue = (value?: string) => {
      value = value || '';
      value = process.env[value] ? process.env[value] : value;
      return value || '';
    };

    const path = def.s3.path || '';
    const index = path.indexOf('/');

    const bucket = index > -1 ? path.substring(0, index) : '';
    const bucketKey = index > -1 ? path.substring(index + 1) : '';

    return {
      endpoint: toValue(def.s3.endpoint),
      accessKey: toValue(def.s3.accessKey),
      secret: toValue(def.s3.secret),
      bucket,
      bucketKey,
    };
  }
}
