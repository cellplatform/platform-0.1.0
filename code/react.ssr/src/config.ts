import * as dotenv from 'dotenv';
import { t, fs, semver, util } from './common';
import { Manifest } from './manifest';

const { stripSlashes } = util;
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
  // public static createSync = (options: { path?: string } = {}) => {
  //   const path = fs.resolve(options.path || './ssr.yml');
  //   if (!fs.pathExistsSync(path)) {
  //     throw new Error(`An "ssr.yml" configuration file does not exist at: ${path}`);
  //   }
  //   const def = fs.file.loadAndParseSync<t.ISsrConfig>(path);
  //   return new Config({ def });
  // };
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
  public get secret() {
    return toValue(this.def.secret);
  }

  public get builder() {
    const builder = this.def.builder || {};
    builder.bundles = builder.bundles || 'bundles';
    builder.entries = builder.entries || '';
    return builder;
  }

  public get s3() {
    const s3 = this.def.s3 || {};
    const path = s3.path || {};

    const endpoint = util.stripHttp(s3.endpoint || '');
    const cdn = util.stripHttp(s3.cdn || '');
    const accessKey = toValue(s3.accessKey);
    const secret = toValue(s3.secret);
    const bucket = s3.bucket || '';

    const api = {
      endpoint,
      cdn,
      accessKey,
      secret,
      bucket,
      path: {
        base: stripSlashes(path.base || ''),
        manifest: stripSlashes(path.manifest || ''),
        bundles: stripSlashes(path.bundles || ''),
      },
      get config(): t.IS3Config {
        return { endpoint, accessKey, secret };
      },
      get fs() {
        return fs.s3(api.config);
      },
      async versions(options: { sort?: 'ASC' | 'DESC' } = {}) {
        const s3 = api.fs;
        const prefix = `${api.path.base}/${api.path.bundles}`;
        const list = s3.list({
          bucket,
          prefix,
        });

        const dirs = (await list.dirs).items.map(({ key }) => ({ key, version: fs.basename(key) }));
        const versions = semver.sort(dirs.map(item => item.version));
        return options.sort === 'DESC' ? versions.reverse() : versions;
      },
    };

    return api;
  }

  public get manifest() {
    // Manifest file.
    const filePath = fs.resolve(this.def.manifest || 'manifest.yml');

    // Manifest URL.
    const s3 = this.s3;
    const urlPath = `${s3.bucket}/${s3.path.base}`;
    const manifestUrl = `https://${s3.endpoint}/${urlPath}/${s3.path.manifest}`;
    const baseUrl = `https://${s3.cdn || s3.endpoint}/${urlPath}`;

    const config = this; // tslint:disable-line
    const api = {
      local: {
        path: filePath,
        get exists() {
          return fs.pathExists(filePath);
        },
        async load() {
          return Manifest.fromFile({ path: filePath, baseUrl: baseUrl });
        },
        async ensureLatest(options: { minimal?: boolean } = {}) {
          // Ensure local exists.
          if (!(await api.local.exists)) {
            await config.createFromTemplate();
          }

          // Overwrite with latest cloud content (if it exists).
          const remote = await api.s3.get({ force: true });
          if (remote.ok) {
            const { minimal } = options;
            await remote.save(filePath, { minimal });
          }

          // Load the manifest.
          return api.local.load();
        },
      },
      s3: {
        url: manifestUrl,
        async get(args: { force?: boolean; loadBundleManifest?: boolean } = {}) {
          return Manifest.get({ ...args, manifestUrl, baseUrl });
        },
      },
    };

    return api;
  }

  /**
   * [Methods]
   */
  public async createFromTemplate() {
    const source = fs.join(__dirname, '../tmpl/manifest.yml');
    const target = this.manifest.local.path;
    await fs.ensureDir(fs.dirname(target));
    await fs.copy(source, target);
    return { source, target };
  }
}

/**
 * [Helpers]
 */
const toValue = (value?: string) => {
  value = value || '';
  value = process.env[value] ? process.env[value] : value;
  return value || '';
};
