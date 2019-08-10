import { t } from '../common';

/**
 * Definition of a site route.
 */
export class Route {
  /**
   * [Static]
   */
  public static find(args: { manifest: t.IManifest; domain: string; path: string }) {
    const { manifest, domain, path } = args;
    const site = manifest.sites.find(item => item.domain === domain);
    const routes = site ? Object.keys(site.routes).map(key => site.routes[key]) : [];
    const route = routes.find(route => route.path.includes(path));
    return site && route ? new Route({ site, path, route }) : undefined;
  }

  /**
   * [Lifecycle]
   */
  public constructor(args: { site: t.ISiteManifest; path: string; route: t.ISiteManifestRoute }) {
    this.site = args.site;
    this.path = (args.path || '').trim();
    this.def = args.route;
  }

  /**
   * [Fields]
   */
  public readonly path: string;
  private readonly site: t.ISiteManifest;
  private readonly def: t.ISiteManifestRoute;

  /**
   * [Properties]
   */
}
