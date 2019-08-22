import { fs, http, t, util } from '../common';
import { Site } from './Site';

type IPullResonse = {
  ok: boolean;
  status: number;
  manifest?: Manifest;
  error?: Error;
};

type IManifestArgs = {
  baseUrl: string;
  def: t.IManifest;
  status?: number;
};

let URL_CACHE: any = {};

export class Manifest {
  /**
   * [Static]
   */

  /**
   * Reset the cache.
   */
  public static reset() {
    URL_CACHE = {};
  }

  public static async fromFile(args: { path: string; baseUrl: string }) {
    const { baseUrl } = args;
    const path = fs.resolve(args.path);
    if (!(await fs.pathExists(path))) {
      throw new Error(`Manifest file does not exist: '${args.path}'`);
    }
    const text = await fs.readFile(path, 'utf-8');
    const def = await Manifest.parse({ yaml: text, baseUrl });
    return Manifest.create({ def, baseUrl });
  }

  /**
   * Pulls the manifest from the given url end-point.
   */
  public static async fromUrl(args: {
    manifestUrl: string;
    baseUrl?: string;
    loadBundleManifest?: boolean;
  }): Promise<IPullResonse> {
    const { manifestUrl, loadBundleManifest } = args;

    const errorResponse = (status: number, error: string): IPullResonse => {
      return { ok: false, status, error: new Error(error) };
    };

    try {
      // Retrieve manifiest from network.
      const res = await http.get(args.manifestUrl);
      if (!res.ok) {
        const error =
          res.status === 403
            ? `The manifest YAML has not been made "public" on the internet.`
            : `Failed while pulling manifest YAML from cloud.`;
        return errorResponse(403, error);
      }

      // Attempt to parse the yaml.
      const baseUrl = args.baseUrl || manifestUrl;
      const manifest = await Manifest.fromYaml({ yaml: res.body, baseUrl, loadBundleManifest });

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

  public static async fromYaml(args: {
    yaml: string;
    baseUrl: string;
    loadBundleManifest?: boolean;
  }) {
    const { yaml: text, baseUrl, loadBundleManifest } = args;
    const def = await Manifest.parse({ yaml: text, baseUrl, loadBundleManifest });
    return Manifest.create({ def, baseUrl });
  }

  /**
   * Pulls the manifest at the given url end-point.
   */
  public static async parse(args: { yaml: string; baseUrl: string; loadBundleManifest?: boolean }) {
    const { loadBundleManifest } = args;
    const baseUrl = args.baseUrl.replace(/\/manifest.yml$/, '');

    // Attempt to parse the yaml.
    const yaml = util.parseYaml(args.yaml);
    if (!yaml.ok || !yaml.data) {
      const error = `Failed to parse manifest YAML. ${yaml.error.message}`;
      throw new Error(error);
    }

    // Process the set of sites.
    let sites: t.ISiteManifest[] = [];
    const input = yaml.data.sites;
    sites = await Site.formatMany({ input, baseUrl, loadBundleManifest });

    // Finish up.
    const manifest: t.IManifest = { sites };
    return manifest;
  }

  /**
   * Gets the manifest (from cache if already pulled).
   */
  public static async get(args: {
    manifestUrl: string; // URL to the manifest.yml (NB: don't use a caching CDN).
    baseUrl: string; // If different from `url` (use this to pass in the Edge/CDN alternative URL).
    force?: boolean;
    loadBundleManifest?: boolean;
  }) {
    const key = `${args.manifestUrl}::${args.loadBundleManifest || 'false'}`;

    let manifest = URL_CACHE[key] as Manifest;
    if (manifest && !args.force) {
      return manifest;
    }
    const res = await Manifest.fromUrl(args);
    if (res.manifest) {
      manifest = res.manifest;
      URL_CACHE[key] = manifest;
    }
    return manifest;
  }

  /**
   * [Lifecycle]
   */
  public static create = (args: IManifestArgs) => new Manifest(args);
  private constructor(args: IManifestArgs) {
    this.def = args.def;
    this.baseUrl = args.baseUrl;
    this.status = args.status || 200;
  }

  /**
   * [Fields]
   */
  public readonly status: number;
  public readonly baseUrl: string;
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
      const manifest = this.def;
      this._sites = this.def.sites.map((def, index) => Site.create({ index, manifest }));
    }
    return this._sites;
  }

  /**
   * Retrieve the site definition for the domain (hostname).
   */
  public get site() {
    return {
      byName: (name?: string) => {
        name = (name || '').trim();
        return this.sites.find(site => site.name.trim() === name);
      },
      byHost: (domain?: string) => {
        domain = util.stripHttp(domain || '');
        return this.sites.find(site => site.isMatch(domain || ''));
      },
    };
  }

  /**
   * Methods for changing and saving values.
   */
  public get change() {
    return {
      site: (id: string | Site) => {
        const name = typeof id === 'string' ? id : id.name;
        return {
          bundle: async (args: { value: string; saveTo?: string }) => {
            // Find the site.
            const site = this.site.byName(name);
            if (!site) {
              return undefined;
            }

            // Update the bundle version.
            const bundle = args.value;
            const def = { ...this.def };
            def.sites[site.index].bundle = bundle;

            // Clone of manifest with updated def.
            const manifest = Manifest.create({ def, baseUrl: this.baseUrl });

            // Save to local file-system.
            if (args.saveTo) {
              await manifest.save(args.saveTo);
            }

            // Finish up.
            return manifest;
          },
        };
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

  public async save(path: string, options: { minimal?: boolean } = {}) {
    // Prepare content.
    const def = { ...this.def };
    if (options.minimal) {
      def.sites.forEach(site => {
        delete site.files;
        delete site.entries;
        delete site.baseUrl;
      });
    }

    // Save to file-system.
    path = fs.resolve(path);
    await fs.ensureDir(fs.dirname(path));
    await fs.file.stringifyAndSave(path, def);
  }
}
