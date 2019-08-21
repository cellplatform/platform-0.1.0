import { fs, http, t, util } from '../common';
import { Site } from './Site';

type IPullResonse = {
  ok: boolean;
  status: number;
  manifest: t.IManifest;
  error?: Error;
};

type IManifestArgs = { url: string; def: t.IManifest; status?: number };

let CACHE: any = {};

export class Manifest {
  /**
   * [Static]
   */

  /**
   * Reset the cache.
   */
  public static reset() {
    CACHE = {};
  }

  public static async fromFile(args: { file: string; url: string }) {
    const { url } = args;
    const path = fs.resolve(args.file);
    if (!(await fs.pathExists(path))) {
      throw new Error(`Manifest file does not exist: '${args.file}'`);
    }
    const text = await fs.readFile(path, 'utf-8');
    const def = await Manifest.parse({ text, baseUrl: url });
    return Manifest.create({ def, url });
  }

  /**
   * Pulls the manifest from the given url end-point.
   */
  public static async fromUrl(args: { url: string; baseUrl?: string }): Promise<IPullResonse> {
    const { url } = args;
    const empty: t.IManifest = { sites: [] };

    const errorResponse = (status: number, error: string): IPullResonse => {
      const manifest = empty;
      return { ok: false, status, error: new Error(error), manifest };
    };

    try {
      // Retrieve manifiest from network.
      const res = await http.get(args.url);
      if (!res.ok) {
        const error =
          res.status === 403
            ? `The manifest YAML has not been made "public" on the internet.`
            : `Failed while pulling manifest YAML from cloud.`;
        return errorResponse(403, error);
      }

      // Attempt to parse the yaml.
      const baseUrl = args.baseUrl || url;
      const text = res.body;
      const manifest = await Manifest.parse({ text, baseUrl });

      // Finish up.
      return {
        ok: true,
        status: 200,
        manifest,
      };
    } catch (error) {
      return errorResponse(500, error);
    }
  }

  /**
   * Pulls the manifest at the given url end-point.
   */
  public static async parse(args: { text: string; baseUrl: string }) {
    const baseUrl = args.baseUrl.replace(/\/manifest.yml$/, '');

    // Attempt to parse the yaml.
    const yaml = util.parseYaml(args.text);
    if (!yaml.ok || !yaml.data) {
      const error = `Failed to parse manifest YAML. ${yaml.error.message}`;
      throw new Error(error);
    }

    // Process the set of sites.
    let sites: t.ISiteManifest[] = [];
    const input = yaml.data.sites;
    sites = await Site.formatMany({ input, baseUrl });

    // Finish up.
    const manifest: t.IManifest = { sites };
    return manifest;
  }

  /**
   * Gets the manifest (from cache if already pulled).
   */
  public static async get(args: {
    url: string; // URL to the manifest.yml (NB: don't use a caching CDN).
    baseUrl?: string; // If different from `url` (use this to pass in the Edge/CDN alternative URL).
    force?: boolean;
  }) {
    const { url } = args;
    let manifest = CACHE[url] as Manifest;
    if (manifest && !args.force) {
      return manifest;
    }
    const res = await Manifest.fromUrl(args);
    if (res.manifest) {
      const { status, manifest: def } = res;
      manifest = new Manifest({ url, def, status });
      CACHE[url] = manifest;
    }
    return manifest;
  }

  /**
   * [Lifecycle]
   */
  public static create = (args: IManifestArgs) => new Manifest(args);
  private constructor(args: IManifestArgs) {
    this.def = args.def;
    this.url = args.url;
    this.status = args.status || 200;
  }

  /**
   * [Fields]
   */
  public readonly status: number;
  public readonly url: string;
  private readonly def: t.IManifest;
  private _sites: Site[];

  /**
   * [Properties]
   */
  public get ok() {
    return this.status.toString().startsWith('2');
  }

  public get sites() {
    if (!this._sites) {
      this._sites = this.def.sites.map(def => Site.create({ def }));
    }
    return this._sites;
  }

  /**
   * Retrieve the site definition for the domain (hostname).
   */
  public get site() {
    return {
      byHost: (domain?: string) => {
        domain = util.stripHttp(domain || '');
        return this.sites.find(site => site.isMatch(domain || ''));
      },
      byName: (name?: string) => {
        name = (name || '').trim();
        return this.sites.find(site => site.name.trim() === name);
      },
    };
  }

  /**
   * [Methods]
   */

  /**
   * Object representation of the Manifest.
   */
  public toObject() {
    return {
      status: this.status,
      ...this.def,
    };
  }
}
