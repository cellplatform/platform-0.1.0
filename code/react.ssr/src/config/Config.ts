import * as dotenv from 'dotenv';
import { t, fs } from '../common';
import { Manifest } from '../manifest';

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
    const s3 = this.def.s3 || {};
    const path = s3.path || {};

    const toValue = (value?: string) => {
      value = value || '';
      value = process.env[value] ? process.env[value] : value;
      return value || '';
    };

    const endpoint = toValue(s3.endpoint);
    const accessKey = toValue(s3.accessKey);
    const secret = toValue(s3.secret);

    return {
      endpoint,
      accessKey,
      secret,
      bucket: s3.bucket || '',
      path: {
        manifest: path.manifest || '',
        bundles: path.bundles || '',
      },
      get fs() {
        return fs.s3({ endpoint, accessKey, secret });
      },
    };
  }

  public get manifestUrl() {
    const s3 = this.s3;
    const endpoint = s3.endpoint.replace(/\/*$/, '');
    const path = s3.path.manifest.replace(/^\/*/, '');
    const bucket = s3.bucket;
    return `https://${endpoint}/${bucket}/${path}`;
  }

  public get manifest() {
    const file = fs.resolve(this.def.manifest || 'manifest.yml');
    const url = this.manifestUrl;
    let manifest: Manifest | undefined;
    const api = {
      file,
      url,
      get exists() {
        return fs.pathExists(file);
      },
      async load() {
        if (!manifest && (await api.exists)) {
          manifest = await Manifest.fromFile({ file, url });
        }
        return manifest;
      },
    };
    return api;
  }
}
