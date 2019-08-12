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
    let domain = input.domain || '';
    domain = Array.isArray(domain) ? domain : [domain];
    domain = domain.map((hostname: string) => util.stripHttp(hostname));

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

    // Pull the bundle manifest from the network to get [files] and [dirs].
    const res = await http.get(`${bundle}/${constants.PATH.BUNDLE_MANIFEST}`);
    const manifest = res.ok ? (jsYaml.safeLoad(res.body) as t.IBundleManifest) : undefined;
    const files = manifest ? manifest.files || [] : [];
    const entries = manifest ? manifest.entries || [] : [];
    const version = manifest ? manifest.version || '0.0.0' : '0.0.0';

    // Finish up.
    const site: t.ISiteManifest = { version, domain, bundle, routes, files, entries };
    return site;
  }

  /**
   * [Lifecycle]
   */
  public static create = (args: ISiteArgs) => new Site(args);
  private constructor(args: ISiteArgs) {
    const { def } = args;
    this.def = def;
    this._regexes = toDomainRegexes(def.domain);
  }

  /**
   * [Fields]
   */
  private readonly def: t.ISiteManifest;
  private _routes: Route[];
  private _regexes: RegExp[];

  /**
   * [Properties]
   */
  public get domain() {
    return this.def.domain;
  }

  public get files() {
    return this.def.files;
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
  public isMatch(domain: string | string[]) {
    const isMatch = (domain: string, regex: RegExp) => {
      const res = regex.exec(domain);
      return Array.isArray(res) && res[0] === domain;
    };
    const domains = Array.isArray(domain) ? domain : [domain];
    const regexes = this._regexes;
    return domains.some(d => this.domain.includes(d) || regexes.some(r => isMatch(d, r)));
  }

  /**
   * Look up the route at the given path.
   */
  public route(path?: string) {
    return path ? this.routes.find(route => route.isMatch(path)) : undefined;
  }

  /**
   * Scan the manifest looking for a match with the given resource.
   */
  public redirectUrl(path?: string) {
    path = (path || '').replace(/^\/*/, '').replace(/\/*$/, '');
    const exists = this.files.includes(path);
    return exists ? `${this.def.bundle}/${path}` : '';
  }

  /**
   * Object representation of the Site.
   */
  public toObject() {
    return { ...this.def };
  }
}

/**
 * [Helpers]
 */
export function toDomainRegexes(domains: string[]) {
  const isRegex = (domain: string) => domain.startsWith('/') && domain.endsWith('/');
  const toRegex = (domain: string) => {
    domain = domain.replace(/^\//, '').replace(/\/$/, '');
    return new RegExp(domain);
  };
  return domains.filter(domain => isRegex(domain)).map(domain => toRegex(domain));
}
