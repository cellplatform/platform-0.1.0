import { fs, http, t } from './common';
import { Bundle } from './Bundle';
import * as url from 'url';

export type IReleaseArgs = {
  version: string;
  baseUrl: string;
  baseDir: string;
};

/**
 * Represents a bundled release.
 */
export class Release {
  /**
   * [Static]
   */
  public static create(args: IReleaseArgs) {
    return new Release(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IReleaseArgs) {
    const { version } = args;
    this.version = version;
    this.dir = fs.join(fs.resolve(args.baseDir), version);

    const base = args.baseUrl.replace(/\/$/, '');
    this.url = {
      bundle: `${base}/${version}/${version}.zip`,
      info: `${base}/${version}/info.json`,
    };
  }

  /**
   * [Fields]
   */

  public readonly version: string;
  public readonly dir: string;
  public readonly url: { bundle: string; info: string };
  private _cache: any = {};

  /**
   * [Properties]
   */

  public get renderer() {
    const path = fs.join(this.dir, 'renderer');
    return {
      path,
      file(filename: string) {
        const pathname = fs.join(path, filename);
        return url.format({ protocol: 'file:', pathname, slashes: true });
      },
    };
  }

  /**
   * [Methods]
   */

  public async remote(): Promise<{ exists: boolean; info?: t.IBundleInfo }> {
    const k = 'INFO';
    try {
      const info = this._cache[k] || (this._cache[k] = (await http.get(this.url.info)).json());
      return { exists: Boolean(info), info };
    } catch (error) {
      delete this._cache[k];
      return { exists: false };
    }
  }

  public async info() {
    if (await this.isDownloaded()) {
      const path = fs.join(this.dir, 'info.json');
      return (await fs.readJson(path)) as t.IBundleInfo;
    } else {
      return (await this.remote()).info;
    }
  }

  public async isDownloaded() {
    const path = fs.join(this.dir, 'info.json');
    return fs.pathExists(path);
  }

  public async download(options: { checksum?: string; force?: boolean } = {}) {
    if (!options.force && (await this.isDownloaded())) {
      return this.info();
    }

    const info = (await this.remote()).info;
    if (!info) {
      let msg = '';
      msg += `Cannot download release '${this.version}' because`;
      msg += `no manifest info exists for the release. ${this.url.info}`;
      throw new Error(msg);
    }

    const checksum = options.checksum || info.checksum;
    const url = this.url.bundle;
    const dir = this.dir;
    await Bundle.download({ url, dir, checksum });

    return info;
  }
}
