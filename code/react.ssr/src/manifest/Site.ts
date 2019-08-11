import { constants, http, jsYaml, t, util } from '../common';
import { Route } from './Route';

export type ISiteArgs = { def: t.ISiteManifest };

/**
 * Definition of a site.
 */
export class Site {
  /**
   * Format the "sites" field from YAML.
   */
  public static async formatMany(args: { input: any; baseUrl: string }) {
    const { baseUrl } = args;

    if (!Array.isArray(args.input)) {
      const error = `The manifest YAML "sites" field is not an array.`;
      throw new Error(error);
    }

    let sites: t.ISiteManifest[] = [];
    for (const input of args.input) {
      const site = await Site.formatOne({ input, baseUrl });
      sites = site ? [...sites, site] : sites;
    }

    return sites;
  }

  /**
   * Format a single "site" from YAML.
   */
  public static async formatOne(args: { input: any; baseUrl: string }) {
    const { input, baseUrl } = args;
    if (typeof input !== 'object') {
      return;
    }

    // Domain name.
    const domain = util.stripHttp(input.domain);

    // Bundle.
    let bundle = util.asString(input.bundle);
    bundle = (bundle ? `${baseUrl}/${bundle}` : bundle).replace(/\/*$/, '');

    // Routes.
    let routes = typeof input.routes === 'object' ? input.routes : {};
    routes = Object.keys(routes).reduce((acc, next) => {
      const input = routes[next];
      if (input) {
        const route = Route.format({ input });
        if (route) {
          acc[next] = route;
        }
      }
      return acc;
    }, {});

    // Pull the file manifest.
    const res = await http.get(`${bundle}/${constants.PATH.BUNDLE_MANIFEST}`);
    const manifest = res.ok ? (jsYaml.safeLoad(res.body) as t.IBundleManifest) : undefined;
    const files = manifest ? manifest.files : [];
    const dirs = manifest ? manifest.dirs : [];

    // Finish up.
    const site: t.ISiteManifest = { domain, bundle, routes, files, dirs };
    return site;
  }

  /**
   * [Lifecycle]
   */
  public static create = (args: ISiteArgs) => new Site(args);
  private constructor(args: ISiteArgs) {
    const { def } = args;
    this.def = def;
  }

  /**
   * [Fields]
   */
  private readonly def: t.ISiteManifest;
  private _routes: Route[];

  /**
   * [Properties]
   */
  public get domain() {
    return this.def.domain;
  }

  public get files() {
    return this.def.files;
  }

  public get dirs() {
    return this.def.dirs;
  }

  public get routes() {
    if (!this._routes) {
      const site = this.def;
      const routes = Object.keys(this.def.routes).map(key => site.routes[key]);
      this._routes = routes.map(route => Route.create({ site, route }));
    }
    return this._routes;
  }

  /**
   * [Methods]
   */
  public route(path: string) {
    return this.routes.find(route => route.paths.includes(path));
  }
}
